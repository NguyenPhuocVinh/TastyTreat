import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { CustomError } from "../errors/custom.error.js";
import { StatusCodes } from "http-status-codes";

export const otpService = {
  async createOtp(otp, userId, expiration) {
    const otpDoc = new OTP({
      otp,
      userId,
      expiration,
    });
    return await otpDoc.save();
  },
  async verifyOTP(otpTmp, userId) {
    const otp = await OTP.findOne({ otp: otpTmp});
    if (!otp) {
      throw new CustomError(StatusCodes.NOT_FOUND, "OTP not found");
    }
    if (otp.otp !== otpTmp) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid OTP");
    }
    if (otp.expiration < new Date()) {
      throw new CustomError(StatusCodes.NOT_FOUND, "OTP expired");
    }
    this.verifyUser(otpTmp);
    this.deleteOtpByUserId(userId);
    return true;
  },
  async verifyUser(otpTmp) {
    const otp = await OTP.findOne({ otp: otpTmp});
    const user = await User.findById(otp.userId);
    if (!user) {
      throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
    }
    user.verified = true;
    return await user.save();
  },
  
  
  async resendOtpByUserId(userId, otp, expiration) {
    return await OTP.updateOne({ userId, otp, expiration });
  },
  async findOtpByUserId(userId) {
    return await OTP.findOne({ userId });
  },
  async deleteOtpByUserId(userId) {
    return await OTP.deleteOne({ userId });
  },
  async findOtpByOtp(otp) {
    return await OTP.findOne({ otp });
  },
};
