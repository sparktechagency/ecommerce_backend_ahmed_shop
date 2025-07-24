import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import axios from 'axios';
import Cart from '../cart/cart.model';
import Product from '../product/product.model';
import { Order } from '../orders/orders.model';
import { User } from '../user/user.models';
import PickupAddress from '../pickupAddress/pickupAddress.model';
import { access } from 'fs';
import getAccessToken, { calculateShippingBox } from './shipmentApi.utils';
import config from '../../config';
// import Business from '../business/business.model';

// const apiKey = '7EyVLQIcx2Ul6FISHTba0Mr96geTdP6';
const apiKey = '7EyVLQIcx2Ul6PISQaTba0Mr96geTdP6';



const createShippingRequestService = async (id: any) => {
  console.log('Creating shipment request for ID:', id);

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order id is required');
  }

  const order: any = await Order.findById(id)
    .populate({
      path: 'sellerId',
      select:
        '_id city address_line2 postal_code address_line1 state_code country_code fullName phone',
    })
    .populate({
      path: 'customerId',
      select: '_id fullName',
    });
  console.log('order==', order);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }


  const { avgHeight, avgWidth, avgLength, totalWeight } =
    await calculateShippingBox(order.productList);

    console.log('order.sellerId.phone', order.sellerId.phone);

    if (!order.sellerId.phone) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Seller phone number is required',
      );
    }

    const numberSeller = order.sellerId.phone.toString();
    const numberCustommer = order.phone_number.toString();
  // Replace {{shipper_number}} with the actual shipper number dynamically
  const shipperNumber = '0J47J6'; // Set this value
  const shipmentRequestData = {
    ShipmentRequest: {
      Request: {
        SubVersion: '1801',
        RequestOption: 'nonvalidate',
        TransactionReference: {
          CustomerContext: 'Shipment Request for Order ' + id,
        },
      },
      Shipment: {
        Description: 'Ship WS test',
        Shipper: {
          Name: order.sellerId.fullName,
          AttentionName: 'ShipperZs Attn Name',
          TaxIdentificationNumber: '',
          Phone: {
            Number: numberSeller,
            // Number: '1115554758',
            // Number: cleanPhoneNumber(order.sellerId.phone.toString()),
            Extension: ' ',
          },
          ShipperNumber: shipperNumber,
          FaxNumber: '',
          Address: {
            AddressLine: order.sellerId.address_line1,
            City: order.sellerId.city,
            StateProvinceCode: order.sellerId.state_code,
            PostalCode: order.sellerId.postal_code,
            CountryCode: order.sellerId.country_code,
          },
        },
        ShipTo: {
          Name: order.customerId.fullName,
          AttentionName: 'customerZs Attn Name',
          Phone: {
            // Number: order.phone_number,
            // Number: '4564556456',
            // Number: order.sellerId.phone_number?.toString(),
            Number: numberCustommer,
          },
          Address: {
            AddressLine: order.address_line1,
            City: order.city,
            StateProvinceCode: order.state_code,
            PostalCode: order.postal_code,
            CountryCode: order.country_code,
          },
          Residential: ' ',
        },
        ShipFrom: {
          Name: order.sellerId.fullName,
          AttentionName: 'ShipperZs Attn Name',
          TaxIdentificationNumber: '',
          Phone: {
            // Number: '4564556456',
            Number: numberSeller,
            Extension: ' ',
          },
          ShipperNumber: shipperNumber,
          FaxNumber: '',
          Address: {
            AddressLine: order.sellerId.address_line1,
            City: order.sellerId.city,
            StateProvinceCode: order.sellerId.state_code,
            PostalCode: order.sellerId.postal_code,
            CountryCode: order.sellerId.country_code,
          },
        },
        PaymentInformation: {
          ShipmentCharge: {
            Type: '01',
            BillShipper: {
              AccountNumber: shipperNumber,
            },
          },
        },
        Service: {
          Code: '03',
          Description: 'Express',
        },
        Package: {
          Description: ' ',
          Packaging: {
            Code: '02',
            Description: 'Nails',
          },
          Dimensions: {
            UnitOfMeasurement: {
              Code: 'IN', // Inches
              Description: 'Inches',
            },
            Length: Math.round(avgLength).toString(),
            Width: Math.round(avgWidth).toString(),
            Height: Math.round(avgHeight).toString(),
          },
          PackageWeight: {
            UnitOfMeasurement: {
              Code: 'LBS', // Pounds
              Description: 'Pounds',
            },
            Weight: Number(totalWeight) >= 150 ? '150' : totalWeight.toString(),
          },
        },
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: 'GIF',
          Description: 'GIF',
        },
        HTTPUserAgent: 'Mozilla/4.5',
      },
    },
  };

  try {
    console.log('Shipment Request Data:', shipmentRequestData);
    const accessToken = await getAccessToken();

    // const shippingRequestURL = `${config.shipment_url}/shipments/v1/ship`;
    // console.log('shippingRequestURL:', shippingRequestURL);
    const shippingRequestURL = `https://onlinetools.ups.com/api/shipments/v1/ship`; // Use https

    const response = await axios.post(shippingRequestURL, shipmentRequestData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        transId: 'string',
        transactionSrc: 'testing',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Shipment Request Response:', response.data);
    console.log('Shipment Request Response:1', response.data.ShipmentResponse);
    console.log(
      'Shipment Request Response:2',
      response.data.ShipmentResponse.Response,
    );

   return response.data
  
  } catch (error:any) {
    console.log('Error creating shipment request:', error);

    const updateOrder = await Order.findByIdAndUpdate(
      id,
      {
        tacking_number:'error'
      },
      { new: true },
    );
    if (error.response) {
      console.error('API error response:', error);
      console.error(
        'API error response:response',
        error.response.data.response,
      );
      console.error(
        'API error response:response.errors',
        error.response.data.response.errors,
      );
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error creating shipment request:', error.message);
    }
    throw new Error('Failed to create UPS shipment request');
  }
};





const getSingleShippingTackingQuery = async (id: string) => {

  console.log('tracking id', id);

   try {
    const accessToken = await getAccessToken();
    console.log('accessToken is here', accessToken);

    // const shippingRequestURL = `${config.shipment_url}/shipments/v1/ship`;
    // console.log('shippingRequestURL:', shippingRequestURL);
    const shippingRequestURL = `https://onlinetools.ups.com//api/track/v1/details/${id}`;
    
    const response = await axios.get(shippingRequestURL, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        transId: 'string',
        transactionSrc: 'testing',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Shipment Request Response:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('API error response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error creating shipment request:', error.message);
    }
    throw new Error('Failed to create UPS shipment request');
  }

};



// const createShippingRatesService = async (payload: any) => {
//   try {

//     const accessToken = await getAccessToken();
//     console.log('accessToken', accessToken);


//     const response = await axios.post(
//       'https://onlinetools.ups.com/ship/v1/rating/Rate',
//       {
//         // Shipment data for the Rate API
//         Shipment: {
//           Shipper: {
//             Name: 'Shipper Name',
//             Address: {
//               AddressLine: ['123 Shipper St'],
//               City: 'Shipper City',
//               StateProvinceCode: 'CA',
//               PostalCode: '90001',
//               CountryCode: 'US',
//             },
//           },
//           ShipTo: {
//             Name: 'Receiver Name',
//             Address: {
//               AddressLine: ['456 Receiver Rd'],
//               City: 'Receiver City',
//               StateProvinceCode: 'NY',
//               PostalCode: '10001',
//               CountryCode: 'US',
//             },
//           },
//           Package: {
//             PackagingType: {
//               Code: '02', // Package type (e.g., 02 is for "Package")
//             },
//             Dimensions: {
//               UnitOfMeasurement: {
//                 Code: 'IN', // Inches
//               },
//               Length: '10',
//               Width: '5',
//               Height: '5',
//             },
//             PackageWeight: {
//               UnitOfMeasurement: {
//                 Code: 'LBS', // Pounds
//               },
//               Weight: '2',
//             },
//           },
//         },
//         // Request option: 'Shop' to validate the shipment and get available rates
//         RequestOption: 'Shop', // This is the key part for "Shop" option
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`, // Add Bearer token
//           'Content-Type': 'application/json', // Ensure Content-Type is JSON
//         },
//       },
//     );

//     // Process the response, which contains the rate information
//     console.log('Shipping rates received:', response.data);
//     return response.data;
//   } catch (error:any) {
//     console.error('Error getting shipping rates:', error);
//     console.error(
//       'Error getting shipping rates:',
//       error.response.data.response.errors
//     );
//     throw new Error('Failed to get shipping rates');
//   }
  
// };


const createShippingRatesService = async (id: string) => {

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order id is required');
  }

  const order: any = await Order.findById(id)
    .populate({
      path: 'sellerId',
      select:
        '_id city address_line2 postal_code address_line1 state_code country_code fullName',
    })
    .populate({
      path: 'customerId',
      select:
        '_id fullName',
    });
  console.log('order==', order);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }


  const { avgHeight, avgWidth, avgLength, totalWeight } =
    await calculateShippingBox(order.productList);

 

  console.log('totalWeight', totalWeight);






  try {
    const accessToken = await getAccessToken();
    console.log('accessToken is here', accessToken);

    const ratingURL = `${config.shipment_url}/api/rating/v1/rate`;
    console.log('\nRating API URL:', ratingURL);
    

    const rateRequest = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: 'Your Customer Context',
          },
        },
        Shipment: {
          Shipper: {
            Name: order.sellerId.fullName,
            ShipperNumber: '0J47J6',
            Address: {
              AddressLine: [
                order.sellerId.address_line1,
                order.sellerId.address_line2,
              ],
              City: order.sellerId.city,
              StateProvinceCode: order.sellerId.state_code,
              PostalCode: order.sellerId.postal_code,
              CountryCode: order.sellerId.country_code,
            },
          },
          ShipTo: {
            Name: order.customerId.fullName,
            Address: {
              AddressLine: [order.address_line1, order.address_line2],
              City: order.city,
              StateProvinceCode: order.state_code,
              PostalCode: order.postal_code,
              CountryCode: order.country_code,
            },
          },
          ShipFrom: {
            Name: order.sellerId.fullName,
            Address: {
              AddressLine: [
                order.sellerId.address_line1,
                order.sellerId.address_line2,
              ],
              City: order.sellerId.city,
              StateProvinceCode: order.sellerId.state_code,
              PostalCode: order.sellerId.postal_code,
              CountryCode: order.sellerId.country_code,
            },
          },
          PaymentDetails: {
            ShipmentCharge: {
              Type: '01',
              BillShipper: {
                AccountNumber: '0J47J6', 
              },
            },
          },
          Service: {
            Code: '03',
            Description: 'Ground',
          },
          Package: {
            PackagingType: {
              Code: '02',
              Description: 'Packaging',
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN',
                Description: 'Inches',
              },
              Length: Math.round(avgLength).toString(),
              Width: Math.round(avgWidth).toString(),
              Height: Math.round(avgHeight).toString(),
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS',
                Description: 'Pounds',
              },
              Weight:
                Number(totalWeight) >= 150 ? '150' : totalWeight.toString(),
            },
          },
        },
      },
    };

    console.log('rateRequest0', rateRequest);
    console.log('rateRequest1', rateRequest.RateRequest.Request);
    console.log('rateRequest2', rateRequest.RateRequest.Shipment);
    console.log('rateRequest3', rateRequest.RateRequest.Shipment.Package);


    const response = await axios.post(ratingURL, rateRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        transId: 'string',
        transactionSrc: 'testing',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Shipping Rates:', response.data);
    return response.data;
  } catch (error:any) {
    console.error('Error fetching shipping rates:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
      
      // More detailed error logging
      if (error.response.data?.response?.errors) {
        console.error('UPS API Errors:', error.response.data.response.errors);
      }
    }

    throw new Error('Failed to get shipping rates');
  }
  
};





const getAllBookingShippingQuery = async (data:any) => {

 

  return 'allBookings';
};

const getSingleShippingQuery = async (id: string) => {
  
  return 'singleBooking.data';
};

const deletedShippingQuery = async (id: string) => {
 

  
  return 'null';
};

export const shippingService = {
  // createShippingRequestService,
  createShippingRequestService,
  createShippingRatesService,
  getAllBookingShippingQuery,
  getSingleShippingTackingQuery,
  getSingleShippingQuery,
  deletedShippingQuery,
};
