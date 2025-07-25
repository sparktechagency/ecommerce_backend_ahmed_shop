import { Schema, model, Types } from 'mongoose';
import { TOrder, TProductLish } from './orders.interface';

const ProductLishSchema = new Schema<TProductLish>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
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
  height: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
});

// const historyEntrySchema = new Schema({
//   status: { type: String, required: true },
//   date: { type: Date, required: false,  },
// });

const OrderSchema = new Schema<TOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    sellerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
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
    postal_code: { type: String, required: true },
    state_code: { type: String, required: true },
    country_code: { type: String, required: true },
    address_line1: { type: String, required: true },
    address_line2: { type: String, required: true },
    city: { type: String, required: true },
    tacking_number: { type: String, required: false },
    // history: {
    //   type: [historyEntrySchema],
    //   required: false,
    // },
  },
  { timestamps: true },
);

export const Order = model<TOrder>('Order', OrderSchema);
