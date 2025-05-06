// import axios from 'axios';
// let unirest = require('unirest');

// const pass = 'testcredentials';
// const oauthUrl =
//   'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
// // M-Pesa API credentials
// const lipaNaMpesaOnlineShortcode = '123456';
// const lipaNaMpesaOnlinePass = 'Safaricom123!!';
// const lipaNaMpesaOnlineShortcodeKey =
//   '6f1WedJ1zqXTpLgCKSc6dip2i6LyrDAdZdNdpN9tG1jjBnzq';
// const lipaNaMpesaOnlineShortcodeSecret =
//   'rwG7X6GQMaLymt3vwHHGHA19AYzgoZmc5dGD4PsFNdIPYZsX88QrH1ERRgsrg6kf';
// const processrequestUrl =
//   'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

//   const callbackUrl = 'http://10.0.70.35:8084/api/v1/callback';
// // M-Pesa authentication
// const authenticateMpesa = async () => {
//   const credentials = Buffer.from(
//     `${lipaNaMpesaOnlineShortcodeKey}:${lipaNaMpesaOnlineShortcodeSecret}`,
//   ).toString('base64');

//   // Return a Promise for the asynchronous request
//   return new Promise((resolve, reject) => {
//     let req = unirest(
//       'GET',
//       'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
//     )
//       .headers({
//         Authorization: `Basic ${credentials}`,
//       })
//       .send()
//       .end((res:any) => {
//         if (res.error) {
//           console.log('res.error=======', res.error);
//           reject(new Error(res.error)); 
//         }
//         try {
//           const responseData = JSON.parse(res.raw_body);

//           if (responseData.access_token) {
//             resolve(responseData.access_token); 
//           } else {
//             console.error('Access token not found in the response.');
//             reject(new Error('Access token not found'));
//           }
//         } catch (err:any) {
//           console.error('Error parsing response:', err.message);
//           reject(new Error('Error parsing response'));
//         }
//       });
//   });
// };



// // Initiate STK Push
// export const initiatePayment = async (payload:any) => {
   
//   const accessToken = await authenticateMpesa();

//   console.log('accessToken===', accessToken);
//   console.log('Sandbox Payment URL:', processrequestUrl);

//   const paymentPayload = {
//     BusinessShortcode: '174379',
//     LipaNaMpesaOnlineShortcodePassword:
//       'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
//     PhoneNumber: '254708374149', // Customer phone number
//     Amount: payload.totalAmount,
//     AccountReference: payload.orderId.toString(),
//     CallbackURL: callbackUrl,
//   };

//   console.log('paymentPayload', paymentPayload);

//   try {
//       const response = await axios.post(processrequestUrl, paymentPayload, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       console.log('initiatePayment response', response);

//       return response.data;
    
//   } catch (error:any) {
//     console.error('initiatePayment error', error);
//     console.error('initiatePayment error.message', error.message);
//     throw error;
    
//   }


// };


