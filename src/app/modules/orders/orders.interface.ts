import { Types } from 'mongoose';

export type TProductLish = {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  customerId: Types.ObjectId;
  price: number;
  quantity: number;
  offer: number;
  weight: number;
  height: number;
  width: number;
  length: number;
};

export type TOrder = {
  customerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  shopId: Types.ObjectId;
  productList: [TProductLish];
  totalAmount: Number;
  orderDate: Date;
  status: string;
  paymentStatus: string;
  // history: [
  //   {
  //     status: string;
  //     date: Date;
  //   },
  // ];

  phone_number: string;
  postal_code: string;
  state_code: string;
  city: string;
  address_line1: string;
  country_code: string;
  address_line2: string;
  tacking_number: string;
};
