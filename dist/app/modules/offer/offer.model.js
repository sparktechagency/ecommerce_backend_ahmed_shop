"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const offerSchema = new mongoose_1.Schema({
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    offer: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });
const Offer = (0, mongoose_1.model)('Offer', offerSchema);
exports.default = Offer;
