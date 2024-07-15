import { Product } from "../models/product.model.js";
import { CustomError } from "../errors/custom.error.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../config/cloudinary.config.js";

export const productServices = {
    async createProduct(productBody, imagePath) {
        try {
            // Upload image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(imagePath, {
                folder: "TastyTreat/Products",
            });
    
            // Check if image upload was successful
            if (!uploadedImage || !uploadedImage.url) {
                throw new Error("Failed to upload image to Cloudinary");
            }
    
            // Create new product instance
            const product = new Product({
                ...productBody,
                imagePath: uploadedImage.url,
            });
    
            // Save product to database
            const savedProduct = await product.save();
    
            return savedProduct; // Return saved product
        } catch (error) {
            // Handle and re-throw custom error
            throw new CustomError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    

    async updateProduct(id, productBody, newImagePath) {
        try {
            const product = await Product.findById(id);
            if (!product) {
                throw new CustomError("Product not found", StatusCodes.NOT_FOUND);
            }

            // Update the fields if provided
            if (productBody.productName) product.productName = productBody.productName;
            if (productBody.price) product.price = productBody.price;
            if (productBody.productSubtitles) product.productSubtitles = productBody.productSubtitles;
            if (productBody.feature !== undefined) product.feature = productBody.feature;
            if (productBody.description) product.description = productBody.description;
            if (productBody.categoryId) product.categoryId = productBody.categoryId;

            // Update the image if a new image path is provided
            if (newImagePath) {
                // Delete old image from Cloudinary if exists
                if (product.imagePath) {
                    const publicId = product.imagePath.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`TastyTreat/Products/${publicId}`);
                }

                const uploadedImage = await cloudinary.uploader.upload(newImagePath, {
                    folder: "TastyTreat/Products",
                });

                if (!uploadedImage || !uploadedImage.url) {
                    throw new CustomError("Failed to upload image to Cloudinary", StatusCodes.INTERNAL_SERVER_ERROR);
                }

                product.imagePath = uploadedImage.url;
            }

            return await product.save();
        } catch (error) {
            throw new CustomError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    async getAllProducts() {
        return await Product.find();
    },
    async deleteProduct(productId) {
        return await Product.findByIdAndDelete(productId);
    },
    async getProductById(productId) {
        return await Product.findById(productId);
    },
    async getProductsByCategory(categoryId) {
        return await Product.find({
            categoryId
        });
    },
    async getFeaturedProducts() {
        return await Product.find({
            feature: true
        });
    }
};
