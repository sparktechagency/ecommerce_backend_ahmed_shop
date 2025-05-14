import { model, Schema } from "mongoose";
import { TCart } from "./cart.interface";

const cartSchema = new Schema<TCart>({
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
  shopId: {
    type: Schema.Types.ObjectId,
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


const Cart = model("Cart", cartSchema);

export default Cart;