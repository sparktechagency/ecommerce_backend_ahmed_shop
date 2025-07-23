import { Types } from "mongoose";

export  type TProduct = {
  sellerId: Types.ObjectId;
  shopId: Types.ObjectId;
  categoryId: Types.ObjectId;
  categoryName: string;
  name: string;
  details: string;
  price: number;
  stock: number;
  availableStock: number;
  images: [string];
  weight: number;
  // commonName: string;
  // scientificName: string;
  // type: string;
  // diet: string;
  // groupName: string;
  length: number;
  height: number;
  width: number;
  isDeleted: boolean;
  isOffer?: Types.ObjectId;
};