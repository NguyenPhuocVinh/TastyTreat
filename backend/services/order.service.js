import { Order } from '../models/order.model.js';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../errors/custom.error.js';
import { paymentServices } from './payment.service.js';

export const orderService = {
    async createOrder(orderData) {
        try {
            const newOrder = new Order(orderData);
            await newOrder.save();

            return newOrder;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getOrders() {
        try {
            return await Order.find();
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getOrderByUserId(userId) {
        return await Order.find({ userId });

    },
    async getTotalAmountByUserId(userId) {
        return await Order.find({ userId }).select('totalAmount');
    },
    async getTotalAmountById(orderId) {
        const order = await Order.findById(orderId).select('totalAmount');
        return order.totalAmount;
    }
};
