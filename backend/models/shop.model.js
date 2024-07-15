import mongoose from 'mongoose';

export const Shop = mongoose.model(
    'Shop',
    new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        location: [{
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            }
        }],

        phoneNumber: {
            type: String,
            required: true,
        },

    }),
)