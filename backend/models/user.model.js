import mongoose from "mongoose";
import validator from "validator";

export const User = mongoose.model(
  "User",
  new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid email format. Please enter a valid email address.",
      },
    },
    phone: {
      type: String,
      // required: true,
      validate: {
        validator: (phone) => {
          try {
            return validator.isMobilePhone(phone, "vi-VN");
          } catch (error) {
            console.error("Error validating phone number:", error);
          }
        },
        message:
          "Invalid phone number. Please enter a valid Vietnamese mobile phone number.",
      },
    },
    userName: {
      type: String,
      // required: true,
      // unique: true,
    },
    password: {
      type: String,
      // required: true,
      select: false,
      validate: {
        validator: (password) => {
          try {
            return password.length >= 8;
          } catch (error) {
            console.error("Error validating password:", error);
            return false;
          }
        },
        message: "Invalid password. Please enter a valid password with at least 8 characters.",
      },
    },
    role: {
      type: String,
      default: "customer",
      enum: ["customer", "guest", "admin", "superadmin", "employee"],
    },
    isShop: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiration: {
      type: Date,
    }
  })
);
