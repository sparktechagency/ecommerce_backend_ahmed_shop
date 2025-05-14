import { model, Schema } from "mongoose";
import { TShop } from "./shop.interface";

const shopSchema = new Schema<TShop>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
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
        validator: function (value: string[]) {
          return value && value.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    document: {
      type: String,
      required: [true, 'documents are required'],
      validate: {
        validator: function (value: string[]) {
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
  },
  { timestamps: true },
);

const Shop = model<TShop>('Shop', shopSchema);
export default Shop;