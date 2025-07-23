import { Types } from 'mongoose';

export type TShop = {
  sellerId: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  document: string;
  address: string;
  status: string;
};
