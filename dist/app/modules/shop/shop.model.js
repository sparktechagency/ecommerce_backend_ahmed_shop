"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shopSchema = new mongoose_1.Schema({
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: [true, 'Images are required'],
        validate: {
            validator: function (value) {
                return value && value.length > 0;
            },
            message: 'At least one image is required',
        },
    },
    document: {
        type: String,
        required: [true, 'documents are required'],
        validate: {
            validator: function (value) {
                return value && value.length > 0;
            },
            message: 'At least one documents is required',
        },
    },
    status: {
        type: String,
        enum: ['pending', 'verify'],
        default: 'pending',
    },
}, { timestamps: true });
const Shop = (0, mongoose_1.model)('Shop', shopSchema);
exports.default = Shop;
