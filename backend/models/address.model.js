import mongoose from 'mongoose';

export const Address = mongoose.model('Address', new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    pid: { type: Number, default: null},
    tpye: { type: Number },
    region: { type: Number },
    alias: { type: String },
    is_pickup: { type: Number },
    is_delivered: { type: Number },
    lat: { type: String },
    lng: { type: String }
}, { timestamps: true }));

