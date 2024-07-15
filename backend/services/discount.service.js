import { Discount } from '../models/discount.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from "../config/cloudinary.config.js";
import fs from 'fs';


export const discountServices = {
    async createDiscount(discountData, imagePath) {
        try {
            const uploadedImage = await cloudinary.uploader.upload(imagePath, {
                folder: "TastyTreat/Discounts",
            });

            if (!uploadedImage || !uploadedImage.url) {
                throw new Error("Failed to upload image to Cloudinary");
            }
            
            const discount = await Discount.create({
                ...discountData,
                imagePath: uploadedImage.url,
                condition: {
                    orderTotalMin: discountData.condition.orderTotalMin,
                    orderTotalMax: discountData.condition.orderTotalMax,
                    startDate: discountData.condition.startDate,
                    endDate: discountData.condition.endDate
                }
            });
            fs.unlinkSync(imagePath);
            return discount;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getDiscountByCode(code) {
        return await Discount.findOne({ code: code });
    },
    async getAllDiscounts() {
        return await Discount.find();
    },
    async updateDiscount(discountId, discountData, newImagePath) {
        const discount = await Discount.findById(discountId);
        if (!discount) {
            throw new CustomError(StatusCodes.NOT_FOUND, 'Discount not found');
        }

        if (discountData.code) discount.code = discountData.code;
        if (discountData.type) discount.type = discountData.type;
        if (discountData.value !== undefined) discount.value = discountData.value;
        if (discountData.condition) {
            if (discountData.condition.orderTotalMin !== undefined) discount.condition.orderTotalMin = discountData.condition.orderTotalMin;
            if (discountData.condition.orderTotalMax !== undefined) discount.condition.orderTotalMax = discountData.condition.orderTotalMax;
            if (discountData.condition.startDate) discount.condition.startDate = discountData.condition.startDate;
            if (discountData.condition.endDate) discount.condition.endDate = discountData.condition.endDate;
        }

        if (newImagePath) {
            // Xóa hình ảnh cũ từ Cloudinary nếu có
            if (discount.imagePath) {
                const publicId = discount.imagePath.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`TastyTreat/Discounts/${publicId}`);
            }

            const uploadedImage = await cloudinary.uploader.upload(newImagePath, {
                folder: "TastyTreat/Discounts",
            });

            if (!uploadedImage || !uploadedImage.url) {
                throw new CustomError("Failed to upload image to Cloudinary", StatusCodes.INTERNAL_SERVER_ERROR);
            }

            discount.imagePath = uploadedImage.url;
        }

        return await discount.save();
    },
    async deleteDiscount(discountId) {
        const discount = await Discount.findByIdAndDelete(discountId);
        if (!discount) {
            throw new CustomError(StatusCodes.NOT_FOUND, 'Discount not found');
        }
        return discount;
    },

    async applyDiscount(discountCode, totalAmount) {
        const discount = await this.getDiscountByCode(discountCode);
        if (!discount) {
            throw new CustomError(StatusCodes.NOT_FOUND, 'Discount not found');
        }

        const { discountType, discountAmount, condition, validUntil } = discount;

        if (condition !== 'none') {
            // Check condition
            // Implement the condition checking logic here
        }

        if (validUntil < new Date()) {
            throw new CustomError(StatusCodes.BAD_REQUEST, 'Discount code has expired');
        }

        let discountValue = 0;
        if (discountType === 'fixed') {
            discountValue = discountAmount;
        } else if (discountType === 'percentage') {
            discountValue = totalAmount * discountAmount / 100;
        }

        return discountValue;
    }
}