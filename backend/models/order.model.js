import mongoose from 'mongoose';
import validator from "validator";

export const Order = mongoose.model(
    'Order',
    new mongoose.Schema({
        userId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop'
        },
        fullName: {
            type: String,
            required: [true, "Please provide your name"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Please provide email"],
            validate: {
                validator: validator.isEmail, 
                message: "Please provide a valid email"
            },
        },
        phone: {
            type: String,
            required: [true, "Please provide phone number"],
            validate: {
                validator: function(value) {
                    return /^0[0-9]{9}$/.test(value);
                },
                message: "Invalid phone number format. Please enter a valid Vietnamese phone number."
            }
        },
        address: {
            type: String,
            required: [true, "Please provide address"]
        },
    
        products: [{ 
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product' 
            }, 
                quantity: Number,
                price: Number
            }],
        shippingFee: Number,

        voucherCode: {
            type: String
        },
        voucherDiscount: {
            type: Number,
            default: 0
        },
        
        totalAmount: Number,

        paymentMethod: {
            type: String,
            required: [true, "Please provide payment method"],
            enum: ["CASH", "ONLINE"]
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }, { timestamps: true })
);