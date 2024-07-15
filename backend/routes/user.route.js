import { userControllers } from "../controllers/user.controller.js";
import { authenticateAccessToken } from "../middlewares/auth.middlewares.js";
import { checkPermissions, ROLE_LIST } from "../middlewares/permission.middleware.js";
import express from "express";

const userRouter = express.Router();

userRouter.get("/get-info-user", authenticateAccessToken, userControllers.getInfoUser);
userRouter.get("/get-all-users", authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN), userControllers.getAllUsers);

export default userRouter;