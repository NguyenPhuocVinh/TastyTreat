import { Category } from "../models/category.model.js";
import { CustomError } from "../errors/custom.error.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.config.js";

export const categoryService = {
    async createCategory(categoryBody, imagePath) {
        try {
            const uploadedImage = await cloudinary.uploader.upload(imagePath, {
                folder: "TastyTreat/Categories",
            });

            if (!uploadedImage || !uploadedImage.url) {
                throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload image to Cloudinary");
            }

            const category = new Category({
                ...categoryBody,
                imagePath: uploadedImage.url,
            });

            return await category.save();
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },

    async updateCategory(id, categoryBody, newImagePath) {
        try {
            const category = await Category.findById(id);
            if (!category) {
                throw new CustomError("Category not found", StatusCodes.NOT_FOUND);
            }

            // Update the name if provided
            if (categoryBody.categoryName) {
                category.categoryName = categoryBody.categoryName;
            }

            // Update the image if a new image path is provided
            if (newImagePath) {
                // Delete old image from Cloudinary if exists
                if (category.imagePath) {
                    const publicId = category.imagePath.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`TastyTreat/Categories/${publicId}`);
                }

                const uploadedImage = await cloudinary.uploader.upload(newImagePath, {
                    folder: "TastyTreat/Categories",
                });

                if (!uploadedImage || !uploadedImage.url) {
                    throw new CustomError("Failed to upload image to Cloudinary", StatusCodes.INTERNAL_SERVER_ERROR);
                }

                category.imagePath = uploadedImage.url;
            }

            return await category.save();
        } catch (error) {
            throw new CustomError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getAllCategories() {
        return await Category.find();
    },

    async deleteCategory(categoryId) {
        return await Category.findOneAndDelete({ _id: categoryId });
    },

    async getCategoryById(categoryId) {
        return await Category.findById(categoryId);
    }
};
