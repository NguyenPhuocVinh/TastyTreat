import { StatusCodes } from "http-status-codes";
import { authServices } from "../services/auth.service.js";
import { BadRequestError } from "../errors/badrequest.error.js";
import { emailService } from "../services/email.service.js";
import { otpService } from "../services/otp.service.js";
import { CustomError } from "../errors/custom.error.js";
import { userServices } from "../services/user.service.js";

export const authControllers = {
    async register(req, res) {
        try {
            const { fullName, email, phone, userName, password, role, isShop } =
                req.body;
            if (!fullName || !email || !phone || !userName || !password) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "Please fill in all fields"
                );
            }

            const registerBody = {
                fullName,
                email,
                phone,
                userName,
                password,
                role,
                isShop,
            };
            const { userSaved, otp } = await authServices.register(
                registerBody
            );
            emailService.sendOTPEmail(email, otp);
            res.status(StatusCodes.CREATED).json({
                user: userSaved,
                message: "OTP sent to email",
            });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    },
    async verifyOTP(req, res) {
        try {
            const userId = req.query.userId;
            const otp = req.body.otp;

            await otpService.verifyOTP(otp, userId);
            res.status(StatusCodes.OK).json({ message: "OTP verified" });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    },
    async login(req, res) {
        try {
            const { userName, password } = req.body;
            const loginBody = {
                userName,
                password,
            };
            if (!userName || !password) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "Please fill in all fields"
                );
            }
            const userLogin = await authServices.login(loginBody);
            res.status(StatusCodes.OK).json(userLogin);
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    },
    // async forgotPassword (req, res) {
    //   try {
    //     const email = req.body.email;
    //     if (!email) {
    //       throw new BadRequestError("Email is required", StatusCodes.BAD_REQUEST);
    //     }

    //     const {user, otp} = await authServices.forgotPassword(email);
    //     console.log(user, otp);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    async forgotPassword(req, res) {
        try {
            const email = req.body.email;
            if (!email) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "Email is required"
                );
            }
            const { resetPasswordToken } = await authServices.forgotPassword(
                email
            );
            const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
            emailService.sendResetPasswordToken(email, resetURL);
            res.status(StatusCodes.OK).json({
                message: "Reset password link sent to email",
            });
        } catch (error) {
            console.log(error);
            throw new CustomError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    },
    async resetPassword(req, res) {
        try {
            const resetToken = req.params.resetToken;
            const password = req.body.password;
            if (!resetToken || !password) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "Reset token and password are required"
                );
            }
            const response = await authServices.resetPassword(
                password,
                resetToken
            );
            res.status(StatusCodes.OK).json(response);
        } catch (error) {
            res.status(
                error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            ).json({ message: error.message });
        }
    },
    async resendOtp(req, res) {
        try {
            const userId = req.query.userId;
            if (!userId) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "User ID is required"
                );
            }
            const { email, newOtp } = await authServices.resendOtp(userId);
            emailService.sendOTPEmail(email, newOtp);
            res.status(StatusCodes.OK).json({ message: "OTP resent" });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
        }
    },

    async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new CustomError(
                    StatusCodes.BAD_REQUEST,
                    "Please fill in all fields"
                );
            }
            await authServices.changePassword(
                userId,
                currentPassword,
                newPassword
            );
            res.status(StatusCodes.OK).json({ message: "Password changed" });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
            });
        }
    },

    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { fullName, phone, userName } = req.body;
            const updateProfileBody = {
                ...(fullName && { fullName }),
                ...(phone && { phone }),
                ...(userName && { userName }),
            };

            const user = await authServices.updateProfile(
                userId,
                updateProfileBody
            );
            res.status(StatusCodes.OK).json({ user });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
            });
        }
    },

    async loginSuccess(req, res) {
        try {
            const userId = req.params.userId;
            const user = await authServices.loginSuccess(userId);
            res.status(StatusCodes.OK).json({ user });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
            });
        }
    },
};
