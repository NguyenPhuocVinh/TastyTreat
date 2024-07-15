import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import { discountServices } from '../services/discount.service.js';
import { singleUpload } from '../utils/upload.util.js';

export const discountController = {
    async createDiscount(req, res) {
        singleUpload(req, res, async (err) => {
            if (err) {
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const { path: imagePath } = req.file;
                // const { code, type, value, condition } = req.body;
                const { code, type, value, orderTotalMin, orderTotalMax, startDate, endDate } = req.body;
                const condition = { orderTotalMin, orderTotalMax, startDate, endDate };
                const discountData = { code, type, value, condition };
                console.log(discountData.condition);
                const discount = await discountServices.createDiscount(discountData, imagePath);
                res.status(StatusCodes.CREATED).json(discount);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        })
    },
    async getDiscountByCode(req, res) {
        try {
            const discountId = req.params.discountId;
            const discount = await discountServices.getDiscountByCode(discountId);
            if (!discount) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Discount not found');
            }
            res.status(StatusCodes.OK).json(discount);
        } catch (error) {
            res.status(error.statusCode).json({ message: error.message });
        }
    },
    async getAllDiscounts(req, res) {
        try {
            const discounts = await discountServices.getAllDiscounts();
            res.status(StatusCodes.OK).json(discounts);
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async updateDiscount(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err) {
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }

            try {
                const discountId = req.params.discountId;
                const newImagePath = req.file ? req.file.path : null;
                const { code, type, value, orderTotalMin, orderTotalMax, startDate, endDate } = req.body;

                const condition = {
                    ...(orderTotalMin !== undefined && { orderTotalMin }),
                    ...(orderTotalMax !== undefined && { orderTotalMax }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate })
                };

                const discountData = {
                    ...(code && { code }),
                    ...(type && { type }),
                    ...(value !== undefined && { value }),
                    ...(Object.keys(condition).length > 0 && { condition })
                };

                const updatedDiscount = await discountServices.updateDiscount(discountId, discountData, newImagePath);
                res.status(StatusCodes.OK).json({ discount: updatedDiscount, message: 'Discount updated successfully' });
            } catch (error) {
                next(error);
            }
        });
    },

    async deleteDiscount(req, res) {
        try {
            const discountId = req.params.discountId;
            const discount = await discountServices.deleteDiscount(discountId);
            res.status(StatusCodes.OK).send({ discount, message: 'Discount deleted successfully' });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}