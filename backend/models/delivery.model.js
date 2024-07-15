import mongoose from 'mongoose';


export const Delivery = mongoose.model(
    'Delivery',
    new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        deliveryDate: {
            type: Date,
            required: [true, "Please provide delivery date"]
        },
        deliveryProof: {
            type: String,
            validate: {
                validator: function (value) {
                  return /\.(jpg|jpeg|png|gif)$/.test(value.toLowerCase());
                },
            },
        },
        status: {
            type: String,
            required: [true, "Please provide status"],
            enum: ["PREPARING", "SHIPPING", "DELIVERED", "CANCELLED"],
            default: "PREPARING"
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }, { timestamps: true})
)