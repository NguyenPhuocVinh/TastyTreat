import { Delivery } from '../models/delivery.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from "../config/cloudinary.config.js";


export const deliveryServices = {
    async createDelivery(deliveryData) {
        try {
            const newDelivery = new Delivery(deliveryData);
            await newDelivery.save();
            return newDelivery;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getDeliveryByOrderId(orderId) {
        return await Delivery.findOne({ orderId});
    },

    async uploadDeliveryProof(orderId, imagePath, status) {
        const uploadedImage = await cloudinary.uploader.upload(imagePath, {
            folder: "TastyTreat/Proofs",
        });
        if (!uploadedImage || !uploadedImage.url) {
            throw new CustomError("Failed to upload image to Cloudinary", StatusCodes.INTERNAL_SERVER_ERROR);
        }
        return await Delivery.findOneAndUpdate(
            { orderId }, 
            { deliveryProof: uploadedImage.url, status },
            { new: true }
        );
    },
    
    async updateDelivery(userId, orderId, status) {
        return await Delivery.findOneAndUpdate(
            { orderId },
            { userId, status },
            { new: true }
        )
    },
    async getAllDeliveries() {
        return await Delivery.find();
    },

    async getDeliveryPreparing() {
        return await Delivery.find({ status: "PREPARING" })
        .populate('orderId') 
        .lean();
    },
}