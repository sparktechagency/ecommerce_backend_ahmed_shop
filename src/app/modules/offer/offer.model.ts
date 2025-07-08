import { model, Schema } from "mongoose";
import { TOffer } from "./offer.interface";

const offerSchema = new Schema<TOffer>({
  sellerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  productId: {
    type: Schema.Types.ObjectId,
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

const Offer = model<TOffer>('Offer', offerSchema);
export default Offer;