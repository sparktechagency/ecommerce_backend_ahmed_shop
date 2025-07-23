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
// export const initiatePayment = async (payload: any) => {
//   try {
//     const accessToken = await authenticateMpesa();

//     const timestamp = new Date()
//       .toISOString()
//       .replace(/[-T:.Z]/g, '')
//       .slice(0, 14); // Format: yyyyMMddHHmmss

//     const response = await new Promise<any>((resolve, reject) => {
//       unirest(
//         'POST',
//         'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
//       )
//         .headers({
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         })
//         .send(
//           JSON.stringify({
//             BusinessShortCode: 174379,
//             Password:
//               'MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjUwNTEwMDgyMzI0', // Keep this secure
//             Timestamp: timestamp,
//             TransactionType: 'CustomerPayBillOnline',
//             Amount: payload.amount, // Make sure to use dynamic values
//             PartyA: payload.phoneNumber, // dynamic phone number
//             PartyB: 174379,
//             PhoneNumber: '01744687793',
//             CallBackURL: callbackUrl, // dynamic callback URL
//             AccountReference: 'CompanyXLTD',
//             TransactionDesc: 'Payment of X',
//           }),
//         )
//         .end((res: any) => {
//           console.log('error===', res);
//           if (res.error) {
//             reject(res.error);
//           } else {
//             resolve(res.body); // or resolve(res.raw_body) depending on what you want
//           }
//         });
//     });

//     console.log('Response from M-Pesa:', response);
//     return response;
//   } catch (error) {
//     console.error('Error initiating payment:', error);
//     throw error;
//   }
// };



