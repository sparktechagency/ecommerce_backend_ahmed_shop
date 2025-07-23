import axios from 'axios';
import Product from '../product/product.model';
import config from '../../config';

// Credentials
// const UPS_CLIENT_ID = 'P3ucR6snAt3SAom8lDgxH8cGqDU2c9M2aok3chejxEykzCUi'; // old
// const UPS_CLIENT_SECRET =
//   'xroU0PhU67kwvd8fA8Qi9XGrtSIPtLqwjDfF3ZKuhiFXBaZXPDYpbE9Ww6ewUAYe'; // old

const UPS_CLIENT_ID = 'OtTaoIrv6WFvllB9H91zHTTVtQ2teUHw0kVv8vguuVMirRV3';
const UPS_CLIENT_SECRET =
  'HRW8hN3hNDvayeTAH90fTAwgtz2BJaW6BIVhVrGSvIAnEYQ8qVAcuunmDtarqfBk';
const UPS_OAUTH_TOKEN_URL = `${config.shipment_url}/security/v1/oauth/token`;
// const UPS_OAUTH_TOKEN_URL = 'https://wwwcie.ups.com/security/v1/oauth/token';

// Base64 encoding the client credentials (client_id:client_secret)
const auth = Buffer.from(
  `${config.ups_shipment_info.ups_client_id}:${config.ups_shipment_info.ups_client_secret}`,
).toString('base64');

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      UPS_OAUTH_TOKEN_URL,
      `grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      },
    );

    const accessToken = response.data.access_token;
    // console.log('New UPS Access Token obtained:', accessToken);
    return accessToken;
  } catch (error: any) {
    console.error('Error obtaining UPS Access Token:', error);
    if (error.response) {
      console.error('Error response:', error.response.data.response.errors);
    }
    throw new Error('Failed to obtain UPS access token');
  }
};

export default getAccessToken;

export async function calculateShippingBox(products: any) {
  let totalHeight = 0;
  let totalWidth = 0;
  let totalLength = 0;
  let totalWeight = 0;

  const productPromises = products.map(async (product: any) => {
    const productDetails = await Product.findById(product.productId);

    if (productDetails) {
      totalHeight += Number(productDetails.height) * product.quantity;
      totalWidth += Number(productDetails.width) * product.quantity;
      totalLength += Number(productDetails.length) * product.quantity;
      totalWeight += Number(productDetails.weight);
    }
  });

  await Promise.all(productPromises);

  console.log('totalHeight', totalHeight);
  console.log('totalWidth', totalWidth);
  console.log('totalLength', totalLength);

  const avgHeight = totalHeight / products.length;
  const avgWidth = totalWidth / products.length;
  const avgLength = totalWidth / products.length;



  return { avgHeight, avgWidth, avgLength, totalWeight };
}