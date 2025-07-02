// import AppError from '../../error/AppError';
// import httpStatus from 'http-status';
// import mongoose from 'mongoose';
// import QueryBuilder from '../../builder/QueryBuilder';
// import {
//   calculateShippingBox,
//   wearewuunderApiRequest,
// } from './shipmentApi.utils';
// import axios from 'axios';
// import Cart from '../cart/cart.model';
// import Product from '../product/product.model';
// import { Order } from '../orders/orders.model';
// import { User } from '../user/user.models';
// import { ShipmentApi, ShipmentRequestApi } from './shipmentApi.model';
// import PickupAddress from '../pickupAddress/pickupAddress.model';
// // import Business from '../business/business.model';

// // const apiKey = '7EyVLQIcx2Ul6FISHTba0Mr96geTdP6';
// const apiKey = '7EyVLQIcx2Ul6PISQaTba0Mr96geTdP6';

// const createShippingService = async (payload: any) => {
//   const order = await Order.findById(payload.orderId);
//   if (!order) {
//     throw new AppError(400, 'Order is not found!');
//   }
//   const user = await User.findById(order.userId);
//   if (!user) {
//     throw new AppError(400, 'User is not found!');
//   }

//   const pickupAddress = await PickupAddress.findOne({});
//   if (!pickupAddress) {
//     throw new AppError(400, 'Pickup Address is not found!');  
//   }
//   const heightAndWidth = await calculateShippingBox(order.productList);

//   const productItems = await Promise.all(
//     order.productList.map(async (productItem: any) => {
//       const product = await Product.findById(productItem.productId);

//       if (!product) {
//         throw new AppError(400, 'Product not found for this cart item');
//       }

//       return {
//         weight: Number(product.weight),
//         value: productItem.price,
//         quantity: productItem.quantity,
//         description: 'string',
//       };
//     }),
//   );

//   // calculateShippingBox(order.productList)
//   //   .then((heightAndWidth) => {
//   //     console.log('heightAndWidth==', heightAndWidth);
//   //   })
//   //   .catch((err) => {
//   //     console.error('Error calculating shipping box:', err);
//   //   });

//   // const url = 'https://api.wearewuunder.com/api/v2/bookings';
//   console.log('heightAndWidth==', heightAndWidth);

//   const shippingData = {
//     width: Math.ceil(heightAndWidth.avgWidth), // in centimeters
//     // weight: 1000, // in grams
//     // webhook_url: 'string',
//     // value: 40000, // value in eurocents (e.g., €400.00)
//     // redirect_url: 'string',
//     // preferred_service_level: 'post_nl:cheapest',
//     // picture: 'string',
//     pickup_date: '2019-08-24T14:15:22Z', // ISO 8601 format, UTC
//     pickup_address: {
//       zip_code: pickupAddress.zip_code,
//       street_name: pickupAddress.street_name,
//       state_code: pickupAddress.state_code,
//       phone_number: pickupAddress.phone_number,
//       locality: pickupAddress.locality,
//       house_number: pickupAddress.house_number,
//       given_name: pickupAddress.given_name,
//       family_name: pickupAddress.family_name,
//       email_address: pickupAddress.email_address,
//       country: pickupAddress.country,
//       business: pickupAddress.business,
//       address2: pickupAddress.address2,
//     },
//     // personal_message: 'A very personal message',
//     // parcelshop_id: 'POST_NL:1234',
//     order_lines: productItems,
//     meta: {},
//     length: 40, // in centimeters
//     kind: 'package',
//     is_return: false,
//     height: Math.ceil(heightAndWidth.avgHeight), // in centimeters
//     drop_off: false,
//     description: 'description',
//     delivery_address: {
//       zip_code: order.zip_code,
//       street_name: order.street_name,
//       state_code: order.state_code,
//       phone_number: order.phone_number,
//       locality: order.locality,
//       house_number: order.house_number,
//       given_name: order.given_name,
//       family_name: order.family_name,
//       email_address: user.email,
//       country: order.country,
//       business: order.business,
//       address2: order.address2,
//     },
//     customer_reference: 'W202301',
//   };




//   const shipingBooking = await wearewuunderApiRequest(
//     'bookings',
//     'POST',
//     shippingData,
//   );


//   if (shipingBooking.status === 201) {
//     const data = {
//       shippingbookingId: shipingBooking.data.id,
//     };

//     const shipingApi = await ShipmentApi.create(data);

//     if (!shipingApi) {
//       throw new AppError(400, 'ShipmentApi creqate failed!');
//     }
//   }

//   return shipingBooking;
// };



// const createShippingRequestService = async (id: any) => {
//   console.log("id===",id);

//   const shipingApiExist = await ShipmentApi.findOne({shippingbookingId:id}); 
//   if (!shipingApiExist) {
//     throw new AppError(400, 'ShipmentBooking id is not found!');
//   }
//   const pickupAddress = await PickupAddress.findOne({});
//   if (!pickupAddress) {
//     throw new AppError(400, 'Pickup Address is not found!');
//   }

//   const singleBooking = await wearewuunderApiRequest(`bookings/${id}`, 'GET');

//   if (singleBooking.status === 200) {
//     const data = singleBooking.data;

//     if (!data.width || data.width <= 0) {
//       throw new AppError(400, 'Width must be greater than 0');
//     }

//     if (!data.customer_reference) {
//       throw new AppError(400, "Customer reference can't be blank");
//     }
//     // console.log('data===', data);
//     const orderItems = data.order_lines.map((item: any) => {
//       return {
//         weight: item.weight,
//         value: item.value,
//         quantity: item.quantity,
//         description: item.description,
//       };
//     });

//     // console.log('orderItems====', orderItems);

//     const shipmentRequestData = {
//       width: data.width, // in centimeters
//       // pickup_date: '2019-08-24T14:15:22Z', // ISO 8601 format, UTC
//       preferred_service_level: 'any:most_efficient',
//       pickup_address: {
//         zip_code: pickupAddress.zip_code,
//         street_name: pickupAddress.street_name,
//         state_code: pickupAddress.state_code,
//         phone_number: pickupAddress.phone_number,
//         locality: pickupAddress.locality,
//         house_number: pickupAddress.house_number,
//         given_name: pickupAddress.given_name,
//         family_name: pickupAddress.family_name,
//         email_address: pickupAddress.email_address,
//         country: pickupAddress.country,
//         business: pickupAddress.business,
//         address2: pickupAddress.address2,
//       },
//       personal_message: 'A very personal message',
//       // parcelshop_id: 'POST_NL:1234',
//       order_lines: orderItems,
//       meta: {},
//       length: 40, // in centimeters
//       kind: 'package',
//       is_return: false,
//       height: data.height, // in centimeters
//       drop_off: false,
//       description: 'description',
//       delivery_address: {
//         zip_code: data.delivery_address.zip_code,
//         street_name: data.delivery_address.street_name,
//         state_code: data.delivery_address.state_code,
//         phone_number: data.delivery_address.phone_number,
//         locality: data.delivery_address.locality,
//         house_number: data.delivery_address.house_number,
//         given_name: data.delivery_address.given_name,
//         family_name: data.delivery_address.family_name,
//         email_address: data.delivery_address.email_address,
//         country: data.delivery_address.country,
//         business: data.delivery_address.business,
//         address2: data.delivery_address.address2,
//       },
//       delivery_instructions: 'delivery instructions',
//       customer_reference: data.customer_reference,
//     };

//     console.log('shipmentRequestData===========', shipmentRequestData);

//     // const requestData = {
//     //   width: 30,
//     //   weight: 1000,
//     //   webhook_url: 'string',
//     //   value: 40000,
//     //   request_pickup: true,
//     //   preferred_service_level: 'post_nl:cheapest',
//     //   picture: 'string',
//     //   pickup_address: {
//     //     zip_code: '6003 DD',
//     //     vat: 'NL8559.62.100',
//     //     street_name: 'Marconilaan',
//     //     state_code: 'FL',
//     //     phone_number: '+31683243251',
//     //     locality: 'Weert',
//     //     house_number: '8',
//     //     given_name: 'First name',
//     //     family_name: 'Last name',
//     //     eori_number: 'NL8559.62.100',
//     //     email_address: 'info@examplebusiness.com',
//     //     country: 'NL',
//     //     business: 'Example Business Ltd.',
//     //     address2: 'Appartment 4D',
//     //   },
//     //   personal_message: 'A very personal message',
//     //   parcelshop_id: 'POST_NL:1234',
//     //   ordered_at: '2024-04-11T16:44:21.013152',
//     //   order_lines: [
//     //     {
//     //       weight: 1000,
//     //       value: '5.99',
//     //       sku: '54321',
//     //       quantity: 1,
//     //       hs_code: '1234567890',
//     //       ean: '12345',
//     //       description: 'string',
//     //       country_of_origin: 'NL',
//     //     },
//     //   ],
//     //   number_of_items: 1,
//     //   meta: {},
//     //   length: 40,
//     //   kind: 'package',
//     //   is_return: false,
//     //   incoterms: 'DDP',
//     //   height: 20,
//     //   drop_off: false,
//     //   description: '1x API documentation',
//     //   delivery_address: {
//     //     zip_code: '6003 DD',
//     //     vat: 'NL8559.62.100',
//     //     street_name: 'Marconilaan',
//     //     state_code: 'FL',
//     //     phone_number: '+31683243251',
//     //     locality: 'Weert',
//     //     house_number: '8',
//     //     given_name: 'First name',
//     //     family_name: 'Last name',
//     //     eori_number: 'NL8559.62.100',
//     //     email_address: 'info@examplebusiness.com',
//     //     country: 'NL',
//     //     business: 'Example Business Ltd.',
//     //     address2: 'Appartment 4D',
//     //   },
//     //   deliver_by: '2023-02-29',
//     //   customer_reference: 'W202301',
//     // };

//     const shipmentRequestBooking = await wearewuunderApiRequest(
//       'shipments',
//       'POST',
//       shipmentRequestData,
//     );

//     console.log('shipmentRequestBooking==*****', shipmentRequestBooking);

//     if (shipmentRequestBooking.status === 201) {
//       const data = {
//         shipmentRequestId: shipmentRequestBooking.data.id,
//       };

//       const shipingApi = await ShipmentRequestApi.create(data);

//       if (!shipingApi) {
//         throw new AppError(400, 'ShipmentRequestApi creqate failed!');
//       }
//     }

//       return shipmentRequestBooking.data;
//   }

// };

// const getAllBookingShippingRequestQuery = async (data: any) => {
//   if (!data.ids || data.ids.length === 0) {
//     throw new AppError(403, 'Invalid input parameters: No IDs provided');
//   }
 

//   const allIds = await ShipmentRequestApi.find();
//   const invalidIds = data.ids.filter(
//     (id: any) =>
//       !allIds.some((shipment) => shipment.shipmentRequestId.toString() === id),
//   );

//   if (invalidIds.length > 0) {
//     throw new AppError(
//       403,
//       `Invalid input parameters: The following IDs do not exist: ${invalidIds.join(', ')}`,
//     );
//   }

//   const bookingPromises = data.ids.map(async (id: any) => {
//     const singleBooking = await wearewuunderApiRequest(
//       `shipments/${id}`,
//       'GET',
//     );
//     return singleBooking.data;
//   });

//   const allBookingsRequest = await Promise.all(bookingPromises);

//   return allBookingsRequest;
// };


// const createShippingRatesService = async (payload: any) => {
//   const productItems = await Promise.all(
//     payload.cartIds.map(async (cartId: any) => {
//       const cartProduct = await Cart.findById(cartId);

//       if (!cartProduct) {
//         throw new AppError(400, 'Cart is not found!');
//       }

//       const product = await Product.findById(cartProduct.productId);

//       if (!product) {
//         throw new AppError(400, 'Product not found for this cart item');
//       }

//       return {
//         weight: Number(product.weight),
//         value: cartProduct.price,
//         quantity: cartProduct.quantity,
//         description: 'string',
//       };
//     }),
//   );

//   const pickupAddress = await PickupAddress.findOne({});
//   if (!pickupAddress) {
//     throw new AppError(400, 'Pickup Address is not found!');
//   }

//   const productList = await Promise.all(
//     payload.cartIds.map(async (cartId: any) => {
//       const cartProduct = await Cart.findById(cartId);

//       if (!cartProduct) {
//         throw new AppError(400, 'Cart is not found!');
//       }

//       const product = await Product.findById(cartProduct.productId);

//       if (!product) {
//         throw new AppError(400, 'Product not found for this cart item');
//       }

//       return {
//         productId: product._id,
//         name: product.name,
//         height: Number(product.height),
//         width: Number(product.width),
//       };
//     }),
//   );

//   const heightAndWidth = await calculateShippingBox(productList);

//   // const url = 'https://api.wearewuunder.com/api/v2/bookings/rates';

//   const shippingData = {
//     width: Math.ceil(heightAndWidth.avgWidth), // in centimeters
//     // weight: 1000, // in grams
//     // webhook_url: 'string',
//     // value: 40000, // value in eurocents (e.g., €400.00)
//     // redirect_url: 'string',
//     // preferred_service_level: 'post_nl:cheapest',
//     // picture: 'string',
//     // pickup_date: '2019-08-24T14:15:22Z', // ISO 8601 format, UTC
//     pickup_address: {
//       zip_code: pickupAddress.zip_code,
//       street_name: pickupAddress.street_name,
//       state_code: pickupAddress.state_code,
//       phone_number: pickupAddress.phone_number,
//       locality: pickupAddress.locality,
//       house_number: pickupAddress.house_number,
//       given_name: pickupAddress.given_name,
//       family_name: pickupAddress.family_name,
//       email_address: pickupAddress.email_address,
//       country: pickupAddress.country,
//       business: pickupAddress.business,
//       address2: pickupAddress.address2,
//     },
//     // personal_message: 'A very personal message',
//     // parcelshop_id: 'POST_NL:1234',
//     order_lines: productItems,
//     meta: {},
//     length: 40, // in centimeters
//     kind: 'package',
//     is_return: false,
//     incoterms: 'DDP',
//     height: Math.ceil(heightAndWidth.avgHeight), // in centimeters
//     drop_off: false,
//     description: 'string',
//     delivery_address: {
//       zip_code: payload.zip_code,
//       street_name: payload.street_name,
//       state_code: payload.state_code,
//       phone_number: payload.phone_number,
//       locality: payload.locality,
//       house_number: payload.house_number,
//       given_name: payload.given_name,
//       family_name: payload.family_name,
//       // email_address: payload.email_address,
//       country: payload.country,
//       business: payload.business,
//       address2: payload.address2,
//     },
//     customer_reference: 'W202301',
//   };

//   console.log('shippingData--', shippingData);

//   const shipingRates = await wearewuunderApiRequest(
//     'bookings/rates',
//     'POST',
//     shippingData,
//   );

//   // console.log('shipingRates==', shipingRates.rates);

//   // return shipingRates.rates;

//   return shipingRates.data.rates;
// };



// const getAllBookingShippingQuery = async (data:any) => {

//   if(!data.ids || data.ids.length === 0){
//     throw new AppError(403, 'Invalid input parameters: No IDs provided');

//   }

//   const allIds = await ShipmentApi.find();
//    const invalidIds = data.ids.filter(
//      (id:any) =>
//        !allIds.some((shipment) => shipment.shippingbookingId.toString() === id),
//    );

//    if (invalidIds.length > 0) {
//      throw new AppError(
//        403,
//        `Invalid input parameters: The following IDs do not exist: ${invalidIds.join(', ')}`,
//      );
//    }


//   const bookingPromises = data.ids.map(async (id:any) => {
//     const singleBooking = await wearewuunderApiRequest(`bookings/${id}`, 'GET');
//     return singleBooking.data;
//   });

//   const allBookings = await Promise.all(bookingPromises);

//   return allBookings;
// };

// const getSingleShippingQuery = async (id: string) => {
//   console.log('id', id);
//   const singleBooking = await wearewuunderApiRequest(`bookings/${id}`, 'GET');

//   console.log('singleBooking==', singleBooking);

//   if (!singleBooking) {
//     throw new AppError(404, 'Booking Not Found!!');
//   }

//   return singleBooking.data;
// };

// const deletedShippingQuery = async (id: string) => {
//   const shipmentApi = await ShipmentApi.findOne({
//     shippingbookingId: id,
//   });

//   if (!shipmentApi) {
//     throw new AppError(404, 'Booking Id is Not Found!!');
//   }

//     const singleBooking = await wearewuunderApiRequest(
//       `bookings/${id}`,
//       'DELETE',
//     );

//     if (singleBooking.status === 204) {
//       const deleted = await ShipmentApi.findOneAndDelete({
//         shippingbookingId: id,
//       });

//       if (!deleted) {
//         throw new AppError(404, 'Booking Deletion Failed in Local Database!');
//       }
//     } else {
//       throw new AppError(500, 'Failed to delete the booking from Wuunder');
//     }
  
//   return null;
// };

// export const shippingService = {
//   createShippingService,
//   createShippingRequestService,
//   createShippingRatesService,
//   getAllBookingShippingQuery,
//   getAllBookingShippingRequestQuery,
//   getSingleShippingQuery,
//   deletedShippingQuery,
// };
