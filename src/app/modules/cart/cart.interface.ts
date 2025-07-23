import { Types } from "mongoose"

 export type TCart = {
   productId: Types.ObjectId;
   sellerId: Types.ObjectId;
   customerId: Types.ObjectId;
   shopId: Types.ObjectId;
   price: number;
   quantity: number;
   offer: number;
   weight: number;
   height: number;
   width: number;
   length: number;
 };