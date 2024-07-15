import { categoryService } from "../services/category.service.js";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/custom.error.js";
import { BadRequestError } from "../errors/badrequest.error.js";
import { singleUpload } from "../utils/upload.util.js";

export const categoryController = {
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(StatusCodes.OK).json({ categories });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async createCategory(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err) {
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const { path: imagePath } = req.file;
                const { categoryName } = req.body;

                const categoryBody = {
                    categoryName,
                };

                const savedCategory = await categoryService.createCategory(categoryBody, imagePath);
                res.status(StatusCodes.CREATED).json({ category: savedCategory });
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        });
    },
    async updateCategory(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
                console.log(err);
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const { categoryId } = req.params;
                const newImagePath = req.file ? req.file.path : null;
                const { categoryName } = req.body;

                const updatedCategory = await categoryService.updateCategory(categoryId, { categoryName }, newImagePath);
                res.status(StatusCodes.OK).json({ category: updatedCategory });
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        });
    },
    async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            await categoryService.deleteCategory(categoryId);
            res.status(StatusCodes.NO_CONTENT).send();
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async getCategoryById(req, res, next) {
        try {
            const { categoryId } = req.params;
            const category = await categoryService.getCategoryById(categoryId);
            res.status(StatusCodes.OK).json({ category });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    
};
