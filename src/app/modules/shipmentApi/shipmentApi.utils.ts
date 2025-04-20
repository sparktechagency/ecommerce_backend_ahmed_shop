import axios from 'axios';
import config from '../../config';
import AppError from '../../error/AppError';
import Product from '../product/product.model';

const apiKey = '7EyVLQIcx2Ul6PISQaTba0Mr96geTdP6';

export const wearewuunderApiRequest = async (
  endpoint: any,
  method = 'GET',
  data = {},
) => {
  const baseUrl = 'https://api.wearewuunder.com/api/v2';
  //  const baseUrl = 'https://api-playground.wearewuunder.com/api/v2';
  const url = `${baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  try {
    const response = await axios({
      url,
      method: method.toUpperCase(),
      //  headers: getAuthHeader(),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: method.toUpperCase() === 'GET' ? null : data,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: url,
        method: method,
      });

      if (error.response.status === 401) {
        throw new AppError(401, 'Unauthorized');
      }
      if (error.response.status === 404) {
        throw new AppError(404, 'Not found');
      }
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

export async function calculateShippingBox(products: any) {
  let totalHeight = 0;
  let totalWidth = 0;

  const productPromises = products.map(async (product: any) => {
    const productDetails = await Product.findById(product.productId);

    if (productDetails) {
      totalHeight += Number(productDetails.height);
      totalWidth += Number(productDetails.width);
    }
  });

  await Promise.all(productPromises);

  const avgHeight = totalHeight / products.length;
  const avgWidth = totalWidth / products.length;

  return { avgHeight, avgWidth };
}