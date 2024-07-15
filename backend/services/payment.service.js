import { Payment } from '../models/payment.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';

export const paymentServices = {
    async createPayment(orderId, vnpayRef, amountTransfer, status) {
        try {
            const payment = new Payment({
                orderId,
                vnpayRef,
                amountTransfer,
                status
            });
            await payment.save();
            return payment;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async updatePaymentStatus(vnpayRef, status) {
        return await Payment.findOneAndUpdate({ vnpayRef }, { status });
    },
    async deletePayment(vnpayRef) {
        return await Payment.findOneAndDelete({ vnpayRef });
    },
    async getPaymentByOrderId(orderId) {
        return await Payment.findOne({ orderId });
    },
    async checkStatusPaymentByOrderId(orderId) {
        const payment = await Payment.findOne({ orderId }).select('status');
        return payment.status;
    },
    async updateVnpayRefByOrderId(orderId, vnpayRef) {
        return await Payment.findOneAndUpdate({ orderId }, { vnpayRef });
    },
    async findPaymentByVnpayRef(vnpayRef) {
        return await Payment.findOne({ vnpayRef });
    }
}
