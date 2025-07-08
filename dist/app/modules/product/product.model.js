"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Shop' },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Category',
    },
    categoryName: { type: String, required: true },
    name: { type: String, required: true },
    details: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    availableStock: { type: Number, required: true },
    images: {
        type: [String],
        required: [true, 'Images are required'],
        validate: {
            validator: function (value) {
                return value && value.length > 0;
            },
            message: 'At least one image is required',
        },
    },
    weight: { type: String, required: true },
    // commonName: { type: String, required: true },
    // scientificName: { type: String, required: true },
    // type: { type: String, required: true },
    // diet: { type: String, required: true },
    // groupName: { type: String, required: true },
    // size: { type: String, required: true },
    // images: { type: [String], required: true, minlength: 1 },
    // images: {
    //   type: [String],
    //   required: [true, 'Images are required'],
    //   validate: {
    //     validator: function (value: string[]) {
    //       return value && value.length > 0;
    //     },
    //     message: 'At least one image is required',
    //   },
    // },
    // height: { type: String, required: true },
    // width: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isOffer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Offer',
        default: null,
    },
}, { timestamps: true });
const Product = (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
