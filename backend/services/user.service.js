import { User } from "../models/user.model.js";

export const userServices = {
    async getRoleByUserName (userName) {
        const user = await User.findOne(userName);
        return user.role;
    },
    async getUserById (userId) {
        return await User.findById(userId);
    },
    async createGuestUser (fullName, email, password) {
        const user = new User({
            fullName,
            email,
            password,
            role: "guest"
        });
        await user.save();
        return user;
    },
    async getAllUsers () {
        return await User.find();
    },
}