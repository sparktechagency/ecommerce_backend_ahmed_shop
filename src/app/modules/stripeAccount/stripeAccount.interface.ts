import { Types } from "mongoose";

export interface IStripeAccounts {
  userId: Types.ObjectId; 
  accountId: string; 
  isCompleted: boolean;
}
