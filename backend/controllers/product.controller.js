import { productServices } from "../services/product.service.js";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/custom.error.js";
import { BadRequestError } from "../errors/badrequest.error.js";
import { singleUpload } from "../utils/upload.util.js";

export const productController = {
    async getAllProducts(req, res) {
        try {
            const products = await productServices.getAllProducts();
            res.status(StatusCodes.OK).json({ products });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async createProduct(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err) {
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const { path: imagePath } = req.file;
                const { productName, price, productSubtitles, feature, categoryId } = req.body;

                const productBody = {
                    productName,
                    price,
                    ...(productSubtitles && { productSubtitles }), // Only add if productSubtitles is not empty
                    feature,
                    categoryId
                };

                const savedProduct = await productServices.createProduct(productBody, imagePath);
                res.status(StatusCodes.CREATED).json({ product: savedProduct });
            } catch (error) {
                console.log(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        });
    },
    async updateProduct(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const { productId } = req.params;
                const newImagePath = req.file ? req.file.path : null;
                const { productName, price, productSubtitles, feature, categoryId } = req.body;

                const productBody = {
                    ...(productName && { productName }),
                    ...(price && { price }),
                    ...(productSubtitles && { productSubtitles }),
                    ...(feature !== undefined && { feature }),
                    ...(categoryId && { categoryId })
                };

                const updatedProduct = await productServices.updateProduct(productId, productBody, newImagePath);
                res.status(StatusCodes.OK).json({ product: updatedProduct });
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        });
    },
    async deleteProduct(req, res, next) {
        try {
            const { productId } = req.params;
            await productServices.deleteProduct(productId);
            res.status(StatusCodes.NO_CONTENT).send();
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async getProductById(req, res, next) {
        try {
            const { productId } = req.params;
            const product = await productServices.getProductById(productId);
            res.status(StatusCodes.OK).json({ product });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async getProductsByCategory(req, res, next) {
        try {
            const categoryId = req.params.categoryId;
            if (!categoryId) {
                return CustomError(StatusCodes.BAD_REQUEST, "Category ID is required");
            }
            const products = await productServices.getProductsByCategory(String(categoryId));
            res.status(StatusCodes.OK).json({ products });
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async getFeaturedProducts(req, res) {
        try {
            const products = await productServices.getFeaturedProducts();
            res.status(StatusCodes.OK).json({ products });
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
};
