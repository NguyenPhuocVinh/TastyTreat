import { StatusCodes } from "http-status-codes";
import { userServices } from "../services/user.service.js";
import { BadRequestError } from "../errors/badrequest.error.js";
import { CustomError } from "../errors/custom.error.js";

export const userControllers = {
    async getInfoUser (req, res) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new CustomError(StatusCodes.BAD_REQUEST, "User ID is required");
            }
            const user = await userServices.getUserById(userId);
            res.status(StatusCodes.OK).json({ user });
        } catch (error) {
            res.status(error.statusCode || StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    },
    async getAllUsers (req, res) {
        try {
            const users = await userServices.getAllUsers();
            res.status(StatusCodes.OK).json({ users });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    },
}