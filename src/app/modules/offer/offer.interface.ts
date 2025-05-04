import { Types } from "mongoose";

export type TOffer = {
  sellerId: Types.ObjectId;
  productId: Types.ObjectId;
  offer: Number;
  startDate: Date;
  endDate: Date;
};
