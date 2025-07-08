import { Types } from 'mongoose';

export type TReview = {
  customerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  rating: number;
  review: string;
};
