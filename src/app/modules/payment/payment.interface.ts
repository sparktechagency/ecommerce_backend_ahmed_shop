import { Types } from 'mongoose';

export type TPayment = {
  customerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  method: string;
  amount: Number;
  adminAmount: Number;
  status: string;
  transactionId: string;
  transactionDate: Date;
  orderId: Types.ObjectId;
  session_id: string;
};
