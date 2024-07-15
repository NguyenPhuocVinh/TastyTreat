import mongoose from 'mongoose';

export const Payment = mongoose.model(
    'Payment',
    new mongoose.Schema({
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        vnpayRef: {
            type: String,
            default: null
        },
        amountTransfer: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: String,
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: 'PENDING'
        },
        paymentDate: {
            type: Date,
            default: Date.now
        }
    }, { timestamps: true })
);