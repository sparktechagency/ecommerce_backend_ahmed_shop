import { model, Schema } from "mongoose";
import { TShipmentApi } from "./shipmentApi.interface";

const shipmentApiSchema = new Schema<TShipmentApi>({
    bookingId: { type: String, required: true }
  });



const ShipmentApi = model<TShipmentApi>('ShipmentApi', shipmentApiSchema);
export default ShipmentApi;