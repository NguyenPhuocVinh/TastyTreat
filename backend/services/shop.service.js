import { Shop } from '../models/shop.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
export const shopServices = {
    async createShop(shopData) {
        try {
            const newShop = new Shop(shopData);
            await newShop.save();
            return newShop;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getShopById(shopId) {
        return await Shop.findById(shopId);
    },

    async deleteShop(shopId) {
        return await Shop.findByIdAndDelete(shopId);
    },

    async getLocationShop() {
        return await Shop.find();
    }
}