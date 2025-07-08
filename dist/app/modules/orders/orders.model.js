"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const ProductLishSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    offer: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
});
const historyEntrySchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    date: { type: Date, required: false, },
});
const OrderSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Shop' },
    productList: { type: [ProductLishSchema], required: true },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: [
            'pending',
            'completed',
            'recived',
            'ongoing',
            'delivery',
            'finished',
            'cancelled',
        ],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid'],
        default: 'pending',
    },
    phone_number: { type: String, required: true },
    zip_code: { type: String, required: true },
    street_name: { type: String, required: true },
    state_code: { type: String, required: true },
    locality: { type: String, required: true },
    house_number: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    history: {
        type: [historyEntrySchema],
        required: false,
    },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
