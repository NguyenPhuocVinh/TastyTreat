import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/custom.error.js";
import { User } from "../models/user.model.js";
import { generateOTP } from "../utils/otp.util.js";
import { generateJwt } from "../utils/auth.util.js";
import crypto from "crypto";
import { NotFoundError } from "../errors/notfound.error.js";
import { otpService } from "./otp.service.js";
import { createTokenResetPassword } from "../utils/auth.util.js";
import { userServices } from "./user.service.js";

export const authServices = {
    async generateTokens(payload) {
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        const tokenPair = await createTokenPair(payload, privateKey);
        if (!tokenPair) {
            throw new CustomError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Error creating token pair"
            );
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const publicKeyString = await jwtService.createTokenService({
            userId: payload.userId,
            publicKey,
            refreshToken: tokenPair.refreshToken,
            expiresAt: expiresAt,
        });
        return tokenPair;
    },
    async register(registerBody) {
        const emailExist = await User.findOne({ email: registerBody.email });
        if (emailExist) {
            throw new CustomError(
                StatusCodes.BAD_REQUEST,
                "Email already exists"
            );
        }
        const hashPassword = await bcrypt.hash(registerBody.password, 10);
        const otp = generateOTP();
        const otpExpiration = new Date(Date.now() + 1 * 60 * 5000);
        // otpService.createOtp(otp, user._id, otpExpiration);
        const user = new User({
            ...registerBody,
            password: hashPassword,
            // otp,
            // otpExpiration,
        });
        const userSaved = await user.save();
        await otpService.createOtp(otp, userSaved._id, otpExpiration);
        return { userSaved, otp };
    },

    async login(loginBody) {
        const { userName, password } = loginBody;
        const user = await User.findOne({ userName })
            .select("+password")
            .lean();
        if (!user) {
            throw new CustomError(StatusCodes.UNAUTHORIZED, "Wrong username");
        }
        if (!user.verified) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "User is not verified"
            );
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "Password is incorrect"
            );
        }
        const userObj = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            userName: user.userName,
        };
        const payload = {
            userId: user._id,
            role: user.role,
        };

        const { accessToken, refreshToken } = await generateJwt(payload);
        return { userObj, Token: { accessToken, refreshToken } };
    },
    //chua test
    async logout(keyToken) {
        try {
            return removeKeyById(keyToken);
        } catch (error) {
            throw new CustomError(
                "Error logging out",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    async resendOtp(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
        }
        const newOtp = generateOTP();
        const otpExpiration = new Date(Date.now() + 1 * 60 * 1000);
        await otpService.resendOtpByUserId(userId, newOtp, otpExpiration);
        return { email: user.email, newOtp };
    },

    // async forgotPassword(email) {
    //   const user = await User.findOne({email});
    //   if(!user){
    //     throw new NotFoundError("User not found");
    //   }
    //   const otp = generateOTP();
    //   const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
    //   await otpService.createOtp(otp, user._id, otpExpiration);
    //   return { otp, user };
    // },

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const { resetPasswordToken, resetTokenExpiration } =
            createTokenResetPassword();

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetPasswordToken)
            .digest("hex");
        user.resetPasswordExpiration = resetTokenExpiration;
        await user.save();
        return { resetPasswordToken };
    },

    async resetPassword(password, resetToken) {
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        try {
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpiration: { $gt: Date.now() },
            });
            if (!user) {
                throw new CustomError(
                    "Invalid or expired token",
                    StatusCodes.BAD_REQUEST
                );
            }

            user.password = await bcrypt.hash(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiration = undefined;
            await user.save();
            return { message: "Password reset successful" };
        } catch (error) {
            throw new CustomError(
                "Internal Server Error",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    async handleGoogleLogin(profile) {
        try {
            if (!profile.id) {
                throw new Error("Google ID not found in profile");
            }

            let user = await User.findOne({ email: profile.emails[0].value });

            if (!user) {
                // Create a new user
                user = new User({
                    fullName: `${profile.name.familyName} ${profile.name.givenName}`,
                    email: profile.emails[0].value,
                    verified: true,
                    googleId: profile.id,
                });
            } else {
                // Update user info
                user.fullName = `${profile.name.familyName} ${profile.name.givenName}`;
                user.email = profile.emails[0].value;
                user.verified = true;
                user.googleId = profile.id;
            }

            return user.save();
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async findByUserId(userId) {
        return await User.findById(userId);
    },

    async deleteUserNotVerify(thresholdTime) {
        return await User.deleteMany({
            verified: false,
            createdAt: { $lte: thresholdTime },
        });
    },

    async loginForShop(userName, password) {
        const user = await User.findOne({ userName })
            .select("+password +isShop")
            .lean();
        if (!user) {
            throw new CustomError(StatusCodes.UNAUTHORIZED, "Wrong username");
        }
        if (!user.verified) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "User is not verified"
            );
        }
        //check role
        if (user.isShop === false) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "User is not a shop"
            );
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "Password is incorrect"
            );
        }
        const userObj = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            userName: user.userName,
        };
        const payload = {
            userId: user._id,
            role: user.role,
        };

        const { accessToken, refreshToken } = await generateJwt(payload);
        return { userObj, Token: { accessToken, refreshToken } };
    },

    async changePassword(userId, oldPassword, newPassword) {
        console.log(userId);
        const user = await User.findById(userId).select("+password");
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
        }
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );
        if (!isPasswordMatch) {
            throw new CustomError(
                StatusCodes.UNAUTHORIZED,
                "Old password is incorrect"
            );
        }
        user.password = await bcrypt.hash(newPassword, 10);
        return await user.save();
    },

    async updateProfile(userId, updateBody) {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
        }
        return await User.findByIdAndUpdate(userId, updateBody, { new: true });
    },

    async loginSuccess(userId) {
        const user = await User.findOne(userId);
        return user;
    },
};
//delete user not verify
export const deleteUnverifiedAccounts = async () => {
    const thresholdTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ví dụ: Xóa sau 1 ngày
    try {
        await User.deleteMany({
            verified: false,
            createdAt: { $lte: thresholdTime },
        });
    } catch (error) {
        throw new CustomError(
            "Internal Server Error",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
};

deleteUnverifiedAccounts();
