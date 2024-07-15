import mongoose from 'mongoose';

export const Discount = mongoose.model(
    'Discount',
    new mongoose.Schema({
        code: {
            type: String,
            required: true,
            unique: true
        },
        imagePath: { type: String },
        type: {
            type: String,
            enum: ['FIXED', 'PERCENT'],
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        condition: {
            orderTotalMin: {
                type: Number,
                default: 0
            },
            orderTotalMax: {
                type: Number
            },
            startDate: {
                type: Date
            },
            endDate: {
                type: Date
            }
        },
        createAt: {
            type: Date,
            default: Date.now,
        }
    }, { timestamps: true })
)