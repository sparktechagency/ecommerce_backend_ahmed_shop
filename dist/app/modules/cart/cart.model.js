"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
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
    shopId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shop',
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
const Cart = (0, mongoose_1.model)("Cart", cartSchema);
exports.default = Cart;
