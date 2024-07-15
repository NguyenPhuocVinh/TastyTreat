import express from "express";
import { authControllers } from "../controllers/auth.controller.js";
import { authenticateAccessToken } from "../middlewares/auth.middlewares.js";
import {
  ROLE_LIST,
  checkPermissions,
} from "../middlewares/permission.middleware.js";

const authRouter = express.Router();


authRouter.post("/register", authControllers.register);
authRouter.post("/verify-otp", authControllers.verifyOTP);
authRouter.post("/login", authControllers.login);

authRouter.post("/forgot-password", authControllers.forgotPassword);
authRouter.patch("/reset-password/:resetToken", authControllers.resetPassword);
authRouter.put("/change-password", authenticateAccessToken, authControllers.changePassword);
authRouter.put("/update-profile", authenticateAccessToken, authControllers.updateProfile);

authRouter.post("/resend-otp", authControllers.resendOtp);

//test token
authRouter.get(
  "/test-token",
  authenticateAccessToken,
  checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
  (req, res) => {
    res.status(200).json({
      message: "Token is valid",
    });
  }
);

export default authRouter;
