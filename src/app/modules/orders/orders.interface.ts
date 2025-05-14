import { Types } from 'mongoose';

export type TProductLish = {
   productId: Types.ObjectId;
   sellerId: Types.ObjectId;
   customerId: Types.ObjectId;
   price: number;
   quantity: number;
   offer: number;
   weight: number;
 
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
  history: [
    {
      status: string;
      date: Date;
    },
  ];

  phone_number: string;
  zip_code: string;
  street_name: string;
  state_code: string;
  locality: string;
  house_number: string;
  country: string;
  address: string;
};
