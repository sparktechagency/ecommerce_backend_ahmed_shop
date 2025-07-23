import { model, Schema, Types } from "mongoose";
import { TProduct } from "./product.interface";

const productSchema = new Schema<TProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    categoryId: {
      type: Schema.Types.ObjectId,
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
        validator: function (value: string[]) {
          return value && value.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    weight: { type: Number, required: true },
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
    length: { type: Number, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isOffer: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },
  },
  { timestamps: true },
);

const Product = model<TProduct>('Product', productSchema);

export default Product;
