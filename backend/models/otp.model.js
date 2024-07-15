import mongoose from "mongoose";

export const OTP = mongoose.model(
    "OTP",
    new mongoose.Schema({
        otp: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expiration: {
            type: Date,
            required: true,
        },
    })
)