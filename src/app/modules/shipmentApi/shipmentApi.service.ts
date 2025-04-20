import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { calculateShippingBox, wearewuunderApiRequest } from './shipmentApi.utils';
import axios from 'axios';
import Cart from '../cart/cart.model';
import Product from '../product/product.model';
import { Order } from '../orders/orders.model';
import { User } from '../user/user.models';
// import Business from '../business/business.model';

// const apiKey = '7EyVLQIcx2Ul6FISHTba0Mr96geTdP6';  
const apiKey = '7EyVLQIcx2Ul6PISQaTba0Mr96geTdP6';  

const createShippingService = async (payload:any) => {
    const order = await Order.findById(payload.orderId);
    if (!order) {
      throw new AppError(400, 'Order is not found!');  
    }
    const user = await User.findById(order.userId);
    if (!user) {
      throw new AppError(400, 'User is not found!');
    }
    const heightAndWidth = await calculateShippingBox(order.productList);

    const productItems = await Promise.all(
      order.productList.map(async (productItem: any) => {
       
        const product = await Product.findById(productItem.productId);

        if (!product) {
          throw new AppError(400, 'Product not found for this cart item');
        }

        return {
          weight: Number(product.weight),
          value: productItem.price,
          quantity: productItem.quantity,
          description: 'string',
        };
      }),
    );


    // calculateShippingBox(order.productList)
    //   .then((heightAndWidth) => {
    //     console.log('heightAndWidth==', heightAndWidth);
    //   })
    //   .catch((err) => {
    //     console.error('Error calculating shipping box:', err);
    //   });


// const url = 'https://api.wearewuunder.com/api/v2/bookings';

const shippingData = {
  width: heightAndWidth.avgWidth, // in centimeters
  // weight: 1000, // in grams
  // webhook_url: 'string',
  // value: 40000, // value in eurocents (e.g., €400.00)
  // redirect_url: 'string',
  // preferred_service_level: 'post_nl:cheapest',
  // picture: 'string',
  pickup_date: '2019-08-24T14:15:22Z', // ISO 8601 format, UTC
  pickup_address: {
    zip_code: '6003 DD',
    vat: 'NL8559.62.100',
    street_name: 'Marconilaan',
    state_code: 'FL',
    phone_number: '+31683243251',
    locality: 'Weert',
    house_number: '8',
    given_name: 'First name',
    family_name: 'Last name',
    eori_number: 'NL8559.62.100',
    email_address: 'info@examplebusiness.com',
    country: 'NL',
    business: 'Example Business Ltd.',
    address2: 'Appartment 4D',
  },
  // personal_message: 'A very personal message',
  // parcelshop_id: 'POST_NL:1234',
  order_lines: productItems,
  meta: {},
  length: 40, // in centimeters
  kind: 'package',
  is_return: false,
  height: heightAndWidth.avgHeight, // in centimeters
  drop_off: false,
  description: 'description',
  delivery_address: {
    zip_code: order.zip_code,
    street_name: order.street_name,
    state_code: order.state_code,
    phone_number: order.phone_number,
    locality: order.locality,
    house_number: order.house_number,
    given_name: order.given_name,
    family_name: order.family_name,
    email_address: user.email,
    country: order.country,
    business: order.business,
    address2: order.address2,
  },
  customer_reference: 'W202301',
};


console.log('shippingData====', shippingData);


// const shipingRates = await wearewuunderApiRequest(
//   'bookings/rates',
//   'POST',
//   shippingData,
// );




// axios
//   .post('https://api.wearewuunder.com/api/v2/bookings', shippingData, {
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     }
//   })
//   .then((response) => {
//     if (response.status === 201) {
//       console.log('Booking created successfully:', response.data);
//       // You can also check for specific data within response.data
//       // For example, a successful response might contain a "shipment_id"
//       console.log('Shipment ID:', response.data.shipment_id);
//     } else {
//       console.error('Failed to create booking, status:', response.status);
//     }
//   })
//   .catch((error) => {
//     console.log('error==post', error);
//   });


// console.log('console-1');

// try {
//   const response = await axios.get(
//     'https://api.wearewuunder.com/api/v2/bookings',
//     {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       timeout: 10000,
//     },
//   );
//   console.log('console-2');
//   console.log('All Shipments:', response.data);
// } catch (error: any) {
//   console.log('Error:', error);

//   if (error.response) {
//     console.error(
//       'Error fetching shipments:',
//       error.response.status,
//       error.response.data,
//     );
//   } else {
//     console.error('Error message:', error.message);
//   }
// }




// const shipingBooking = await wearewuunderApiRequest(
//   'bookings',
//   'GET',
// );


// console.log('shipingBooking==', shipingBooking);


// return message;

 
};


const createShippingRatesService = async (payload:any) => {
    console.log('shiping booking api hit hoise')
    console.log('shipping rate payload==', payload);


const productItems = await Promise.all(
  payload.cartIds.map(async (cartId: any) => {
    const cartProduct = await Cart.findById(cartId);

    if (!cartProduct) {
      throw new AppError(400, 'Cart is not found!');
    }

    const product = await Product.findById(cartProduct.productId);

    if (!product) {
      throw new AppError(400, 'Product not found for this cart item');
    }

    return {
      weight: Number(product.weight),
      value: cartProduct.price,
      quantity: cartProduct.quantity,
      description: 'string',
    };
  }),
);


const productList = await Promise.all(
  payload.cartIds.map(async (cartId: any) => {
    const cartProduct = await Cart.findById(cartId);

    if (!cartProduct) {
      throw new AppError(400, 'Cart is not found!');
    }

    const product = await Product.findById(cartProduct.productId);

    if (!product) {
      throw new AppError(400, 'Product not found for this cart item');
    }

    return {
      productId: product._id,
      name: product.name,
      height: Number(product.height),
      width: Number(product.width),
    };
  }),
);

const heightAndWidth = await calculateShippingBox(productList);
 

// const url = 'https://api.wearewuunder.com/api/v2/bookings/rates';

const shippingData = {
  width: heightAndWidth.avgWidth, // in centimeters
  // weight: 1000, // in grams
  // webhook_url: 'string',
  // value: 40000, // value in eurocents (e.g., €400.00)
  // redirect_url: 'string',
  // preferred_service_level: 'post_nl:cheapest',
  // picture: 'string',
  // pickup_date: '2019-08-24T14:15:22Z', // ISO 8601 format, UTC
  pickup_address: {
    zip_code: '6003 DD',
    vat: 'NL8559.62.100',
    street_name: 'Marconilaan',
    state_code: 'FL',
    phone_number: '+31683243251',
    locality: 'Weert',
    house_number: '8',
    given_name: 'First name',
    family_name: 'Last name',
    eori_number: 'NL8559.62.100',
    email_address: 'info@examplebusiness.com',
    country: 'NL',
    business: 'Example Business Ltd.',
    address2: 'Appartment 4D',
  },
  // personal_message: 'A very personal message',
  // parcelshop_id: 'POST_NL:1234',
  order_lines: productItems,
  meta: {},
  length: 40, // in centimeters
  kind: 'package',
  is_return: false,
  incoterms: 'DDP',
  height: heightAndWidth.avgHeight, // in centimeters
  drop_off: false,
  description: 'string',
  delivery_address: {
    zip_code: payload.zip_code,
    street_name: payload.street_name,
    state_code: payload.state_code,
    phone_number: payload.phone_number,
    locality: payload.locality,
    house_number: payload.house_number,
    given_name: payload.given_name,
    family_name: payload.family_name,
    // email_address: payload.email_address,
    country: payload.country,
    business: payload.business,
    address2: payload.address2,
  },
  customer_reference: 'W202301',
};


console.log('shippingData--', shippingData);


// const shipingRates = await wearewuunderApiRequest(
//   'bookings/rates',
//   'POST',
//   shippingData,
// );

// console.log('shipingRates==', shipingRates.rates);


// return shipingRates.rates;

return 'shipingRates.rates';

 
};


   
  


const getAllBookingShippingQuery = async (

) => {
    try {
      // Assuming you have an API key and the endpoint exists for fetching all bookings
      const response = await axios.get(
        'https://api.wearewuunder.com/api/v2/bookings',
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // Replace with your actual API key
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('All Bookings:', response.data);
    } catch (error:any) {
       console.error('Error fetching all bookings:');
       console.error(
         'Status Code:',
         error.response ? error.response.status : 'No response',
       );
       console.error(
         'Error Response:',
         error.response ? error.response.data : error.message,
       );
       console.error(
         'Error Response:',
         error.response ? error.response.data : error.message,
       );
    }
 


};

const getSingleShippingQuery = async (id: string) => {
  console.log('id', id);
  const singleBooking = await wearewuunderApiRequest(`bookings/${id}`, 'GET');

  console.log('singleBooking==', singleBooking);

  // if(){

  // }

  return singleBooking;
};



const deletedShippingQuery = async (id: string) => {
   console.log('id', id);
   const singleBooking = await wearewuunderApiRequest(`bookings/${id}`, 'DELETE');

   console.log('singleBooking==', singleBooking);
   return singleBooking;
 
};

export const shippingService = {
  createShippingService,
  createShippingRatesService,
  getAllBookingShippingQuery,
  getSingleShippingQuery,
  deletedShippingQuery,
};
