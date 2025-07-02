import { Types } from "mongoose";

export  type TProduct = {
  sellerId: Types.ObjectId;
  shopId: Types.ObjectId;
  categoryId: Types.ObjectId;
  categoryName: string;
  name: string;
  details: string;
  price: Number;
  stock: Number;
  availableStock: Number;
  images: [string];
  weight: string;
  // commonName: string;
  // scientificName: string;
  // type: string;
  // diet: string;
  // groupName: string;
  // size: string;
  // weight: string;
  // height: string;
  // width: string;
  isDeleted: boolean;
  isOffer?: Types.ObjectId;
};