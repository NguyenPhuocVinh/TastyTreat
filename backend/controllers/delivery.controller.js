import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import { deliveryServices } from '../services/delivery.service.js';
import { singleUpload } from "../utils/upload.util.js";


export const deliveryController = {
    async getDeliveryByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const delivery = await deliveryServices.getDeliveryByOrderId(orderId);
            if (!delivery) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Delivery not found');
            }
            res.status(StatusCodes.OK).json(delivery);
        }catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async uploadDeliveryProof(req, res, next) {
        singleUpload(req, res, async (err) => {
            if (err) {
                console.log(err);
                return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
            }
            try {
                const { orderId } = req.params;
                const { path: image } = req.file;
                const updatedDelivery = await deliveryServices.uploadDeliveryProof(orderId, image, "DELIVERED");
                res.status(StatusCodes.OK).json(updatedDelivery);
            } catch (error) {
                res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
            }
        });
    },

    async takeDelivery(req, res) {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                throw new CustomError(StatusCodes.BAD_REQUEST, 'Order ID is required');
            }
            const userId = req.user.userId;
            if (!userId) {
                throw new CustomError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
            }
            const delivery = await deliveryServices.updateDelivery(userId, orderId, "SHIPPING");
            res.status(StatusCodes.OK).json(delivery);
        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
        
    },

    async getAllDeliveries(req, res) {
        try {
            const deliveries = await deliveryServices.getAllDeliveries();
            res.status(StatusCodes.OK).json(deliveries);
        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },

    async getDeliveryPreparing(req, res) {
        try {
            const deliveries = await deliveryServices.getDeliveryPreparing();
            res.status(StatusCodes.OK).json(deliveries);
        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}