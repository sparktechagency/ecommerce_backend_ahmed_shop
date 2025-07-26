import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { Payment } from './payment.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import mongoose from 'mongoose';
import { StripeAccount } from '../stripeAccount/stripeAccount.model';
import Product from '../product/product.model';
import { Order } from '../orders/orders.model';
import { notificationService } from '../notification/notification.service';
import { TProduct } from '../product/product.interface';
import { shippingService } from '../shipmentApi/shipmentApi.service';
type SessionData = Stripe.Checkout.Session;

// console.log({ first: config.stripe.stripe_api_secret });

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

// console.log('stripe==', stripe);

const addPaymentService = async (payload: any) => {
  console.log('payment payload', payload);

  const order = await Order.findById(payload.orderId);

  console.log('order==', order);

  if (!order) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order not found');
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order already paid');
  }

  const customer = await User.findById(payload.customerId);
  if (!customer) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Customer not found');
  }

  if (order.customerId.toString() !== payload.customerId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not valid Customer for this order',
    );
  }

  if (!payload.shippingCost) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shipping cost is required');
  }
  if (payload.shippingCost < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Shipping cost can not be negative',
    );
  }

  const productStock = order.productList.map((product) => {
    const singleProduct: any = Product.findById(product.productId);
    if (!singleProduct) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Product not found');
    }

    if (singleProduct.availableStock < product.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${singleProduct.name} is out of stock`,
      );
    }
    return singleProduct;
  });

  const totalPaymentAmount = Number(order.totalAmount + payload.shippingCost);

  console.log('totalPaymentAmount', totalPaymentAmount);

  const stripeAccountCompleted = await StripeAccount.findOne({
    userId: order.sellerId,
  });

  if (!stripeAccountCompleted) {
    throw new AppError(404, 'Seller Stripe Account is not found!!');
  }

  if (!stripeAccountCompleted.isCompleted) {
    throw new AppError(404, 'Seller Stripe Account is not Completed !!');
  }

  const paymentInfo = {
    orderId: order._id,
    amount: Math.round(totalPaymentAmount),
    connectedAccountId: stripeAccountCompleted.accountId,
    shippingCost: Math.round(payload.shippingCost),
  };
  console.log('paymentInfo', paymentInfo);

  // console.log('======stripe payment');
  const checkoutResult: any = await createCheckout(
    payload.customerId,
    paymentInfo,
  );

  if (!checkoutResult) {
    throw new AppError(400, 'Failed to create checkout session!');
  }

  return checkoutResult;
};

const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(Payment.find({}), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};

const getAllPaymentBySellerService = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ sellerId: userId }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};
const getAllPaymentByCustomerService = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ customerId, status: 'paid' }).populate({
      path: 'serviceId',
      select: 'serviceName servicePrice',
      populate: { path: 'businessId', select: 'businessName' },
    }),
    // .populate('businessId'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};

const singlePaymentService = async (id: string) => {
  const task = await Payment.findById(id);
  return task;
};

const deleteSinglePaymentService = async (id: string) => {
  const result = await Payment.deleteOne({ _id: id });
  return result;
};

const getAllIncomeRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0,
  }));

  // console.log({ months });

  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$transactionDate' } },
        totalIncome: { $sum: '$adminAmount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    const monthData = months.find((m) => m.month === data.month);
    if (monthData) {
      monthData.totalIncome = data.totalIncome;
    }
  });

  // console.log({ months });

  return months;
};

// const getAllIncomeRatiobyDays = async (days: string) => {
//   const currentDay = new Date();
//   let startDate: Date;

//   if (days === '7day') {
//     startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
//   } else if (days === '24hour') {
//     startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
//   } else {
//     throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
//   }

//   const timeSlots =
//     days === '7day'
//       ? Array.from({ length: 7 }, (_, i) => {
//           const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
//           return {
//             date: day.toISOString().split('T')[0],
//             totalIncome: 0,
//           };
//         }).reverse()
//       : Array.from({ length: 24 }, (_, i) => {
//           const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
//           return {
//             hour: hour.toISOString(),
//             totalIncome: 0,
//           };
//         }).reverse();

//   const incomeData = await Payment.aggregate([
//     {
//       $match: {
//         transactionDate: { $gte: startDate, $lte: currentDay },
//       },
//     },
//     {
//       $group: {
//         _id:
//           days === '7day'
//             ? {
//                 date: {
//                   $dateToString: {
//                     format: '%Y-%m-%d',
//                     date: '$transactionDate',
//                   },
//                 },
//               }
//             : {
//                 hour: {
//                   $dateToString: {
//                     format: '%Y-%m-%dT%H:00:00',
//                     date: '$transactionDate',
//                   },
//                 },
//               },
//         totalIncome: { $sum: '$amount' },
//       },
//     },
//     // {
//     //   $project: {
//     //     dateHour: days === '7day' ? '$_id.date' : null,
//     //     dateHour: days === '24hour' ? '$_id.hour' : null,
//     //     totalIncome: 1,
//     //     _id: 0,
//     //   },
//     // },
//     {
//   $project: {
//     dateHour: {
//       $cond: {
//         if: { $eq: [days, '7day'] },
//         then: '$_id.date', // For 7day, use the date field
//         else: '$_id.hour', // For 24hour, use the hour field
//       },
//     },
//     totalIncome: 1,
//     _id: 0,
//   },
// },
//     {
//       $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
//     },
//   ]);

//   incomeData.forEach((data) => {
//     if (days === '7day') {
//       const dayData = timeSlots.find((d: any) => d.date === data.date);
//       if (dayData) {
//         dayData.totalIncome = data.totalIncome;
//       }
//     } else if (days === '24hour') {
//       const hourData = timeSlots.find((h: any) => h.hour === data.hour);
//       if (hourData) {
//         hourData.totalIncome = data.totalIncome;
//       }
//     }
//   });

//   return timeSlots;
// };

const getAllIncomeRatiobyDays = async (days: string, sellerId: string) => {
  const currentDay = new Date();
  let startDate: Date;

  if (days === '7day') {
    startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (days === '24hour') {
    startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
  } else {
    throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
  }

  const timeSlots =
    days === '7day'
      ? Array.from({ length: 7 }, (_, i) => {
          const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
          return {
            dateHour: day.toISOString().split('T')[0],
            totalIncome: 0,
          };
        }).reverse()
      : Array.from({ length: 24 }, (_, i) => {
          const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
          return {
            dateHour: hour.toISOString(),
            totalIncome: 0,
          };
        }).reverse();

  const incomeData = await Payment.aggregate([
    {
      $match: {
        sellerId: new mongoose.Types.ObjectId(sellerId),
        transactionDate: { $gte: startDate, $lte: currentDay },
      },
    },
    {
      $group: {
        _id:
          days === '7day'
            ? {
                date: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$transactionDate',
                  },
                },
              }
            : {
                hour: {
                  $dateToString: {
                    format: '%Y-%m-%dT%H:00:00',
                    date: '$transactionDate',
                  },
                },
              },
        totalIncome: { $sum: '$amount' },
      },
    },
    {
      $project: {
        dateHour: days === '7day' ? '$_id.date' : '$_id.hour', // Rename to 'dateHour'
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    if (days === '7day') {
      const dayData = timeSlots.find((d: any) => d.dateHour === data.dateHour);
      if (dayData) {
        dayData.totalIncome = data.totalIncome;
      }
    } else if (days === '24hour') {
      const hourData = timeSlots.find((h: any) => h.dateHour === data.dateHour);
      if (hourData) {
        hourData.totalIncome = data.totalIncome;
      }
    }
  });

  return timeSlots;
};

const createCheckout = async (userId: any, payload: any) => {
  console.log('stripe payment', payload);
  let session = {} as { id: string };
  const lineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Amount',
        },
        unit_amount: payload.amount * 100,
      },
      quantity: 1,
    },
  ];

  const adminFeeAmount = Math.round(payload.amount * 0.1 * 100);
  const totalAmount = payload.shippingCost * 100 + adminFeeAmount;

  const sessionData: any = {
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `http://10.10.7.30:5003/api/v1/payment/success`,
    cancel_url: `http://10.10.7.30:5003/api/v1/payment/cancel`,
    line_items: lineItems,
    metadata: {
      userId: String(userId),
      orderId: String(payload.orderId),
    },
    payment_intent_data: {
      application_fee_amount: totalAmount,
      transfer_data: {
        destination: payload.connectedAccountId,
      },
      on_behalf_of: payload.connectedAccountId,
    },
  };

  try {
    session = await stripe.checkout.sessions.create(sessionData);
  } catch (error) {
    console.log('Error', error);
  }

  const { id: session_id, url }: any = session || {};

  return { url };
};

const automaticCompletePayment = async (event: Stripe.Event): Promise<void> => {
  console.log('hit hise webhook controller servie');

  const session = await mongoose.startSession();
  session.startTransaction();
  let transactionCommitted = false;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log(
          'hit hise webhook controller servie checkout.session.completed',
        );
        const sessionData = event.data.object as Stripe.Checkout.Session;
        const {
          id: sessionId,
          payment_intent: paymentIntentId,
          metadata,
        }: SessionData = sessionData;
        const orderId = metadata?.orderId as string;
        const userId = metadata?.userId as string;
        if (!paymentIntentId) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment Intent ID not found in session',
          );
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId as string,
        );

        if (!paymentIntent || paymentIntent.amount_received === 0) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Successful');
        }

        const adminAmount =
          Math.round(paymentIntent.amount_received * 0.1) / 100;
        const mainAmount = paymentIntent.amount_received / 100;

        const orderdata = await Order.findById(orderId).session(session);
        if (!orderdata) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Order not found');
        }

        const paymentData: any = {
          customerId: userId,
          sellerId: orderdata?.sellerId,
          amount: mainAmount - adminAmount,
          adminAmount: adminAmount,
          method: 'stripe',
          transactionId: paymentIntentId,
          orderId: orderdata?._id,
          status: 'paid',
          session_id: sessionId,
          transactionDate: new Date(),
        };

        const payment = await Payment.create([paymentData], { session });
        console.log('===payment', payment);

        if (payment.length === 0) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Payment record creation failed',
          );
        }

        const order = await Order.findByIdAndUpdate(
          orderId,
          { paymentStatus: 'paid' },
          { new: true, session },
        );
        console.log('===order==update', order);

        if (!order) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Order not found');
        }

        const productlist = await Promise.all(
          order.productList.map(async (product: any) => {
            const singleProduct: any = await Product.findById(
              product.productId,
            ).session(session);

            if (!singleProduct) {
              throw new AppError(404, 'Product is not Found!!');
            }

            if (singleProduct.availableStock < product.quantity) {
              throw new AppError(403, 'Stock is not available!!');
            }

            const updatedProduct = await Product.findOneAndUpdate(
              {
                _id: product.productId,
              },
              { $inc: { availableStock: -product.quantity } },
              { new: true, session },
            );

            if (!updatedProduct) {
              throw new AppError(403, 'Insufficient stock after retry');
            }
            return updatedProduct;
          }),
        );

        console.log('productlist== up console');
        const shipment = await shippingService.createShippingRequestService(
          order._id,
        );

        console.log('shipment==create1', shipment.ShipmentResponse);
        console.log('shipment==create2', shipment.ShipmentResponse.Response);
        console.log(
          'shipment==create3',
          shipment.ShipmentResponse.Response.ResponseStatus,
        );
        console.log(
          'shipment==create4',
          shipment.ShipmentResponse.Response.ResponseStatus.Code,
        );
        console.log(
          'type of',
          typeof shipment.ShipmentResponse.Response.ResponseStatus.Code,
        );

        //  if (shipment.ShipmentResponse.Response.ResponseStatus.Code === '1') {
        //   console.log('true');
        //    const trackingNumber =
        //      shipment.ShipmentResponse.ShipmentResults
        //        .ShipmentIdentificationNumber;
        //        console.log('trackingNumber==', trackingNumber);
        //        console.log('type of trackingNumber==',typeof(trackingNumber));
        //        console.log('orderId  =',  orderId);
        //    const updatedOrderWithTracking = await Order.findByIdAndUpdate(
        //      orderId,
        //      { tracking_number: trackingNumber },
        //      { new: true, session },
        //    );
        //    console.log(
        //      'Order updated with tracking number:',
        //      updatedOrderWithTracking,
        //    );
        //  } else {
        //   console.log('true');
        //    const updatedOrderWithError = await Order.findByIdAndUpdate(
        //      orderId,
        //      { tracking_number: 'error' },
        //      { new: true, session },
        //    );
        //    console.log(
        //      'Order update failed with error:',
        //      updatedOrderWithError,
        //    );
        //  }

        const shipmentCode =
          shipment?.ShipmentResponse?.Response?.ResponseStatus?.Code;
        const trackingNumber =
          shipmentCode === '1'
            ? shipment.ShipmentResponse.ShipmentResults
                .ShipmentIdentificationNumber
            : 'error';

            console.log('trackingNumber==', trackingNumber);

        const updatedOrder = await Order.findByIdAndUpdate(
          order._id,
          { tacking_number: trackingNumber },
          { new: true, session },
        );

        console.log('Order updated with tracking number:', updatedOrder);

        if (!updatedOrder) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Failed to update order with tracking number',
          );
        }

        const notificationData = {
          userId: userId,
          message: 'Order create successfull!!',
          type: 'success',
        };

        const notificationData1 = {
          role: 'admin',
          message: 'New Order create successfull!!',
          type: 'success',
        };

        const notificationData2 = {
          userId: order.sellerId,
          message: 'New Order create successfull!!',
          type: 'success',
        };

        const [notification, notification1, notification2] = await Promise.all([
          notificationService.createNotification(notificationData),
          notificationService.createNotification(notificationData1),
          notificationService.createNotification(notificationData2),
        ]);

        if (!notification || !notification1 || !notification2) {
          throw new AppError(404, 'Notification create faild!!');
        }

        console.log('last console.log');

        await session.commitTransaction();
        transactionCommitted = true;
        console.log('Payment completed successfully:', {
          sessionId,
          paymentIntentId,
        });

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientSecret = session.client_secret;
        const sessionId = session.id;

        if (!clientSecret) {
          console.warn('Client Secret not found in session.');
          throw new AppError(httpStatus.BAD_REQUEST, 'Client Secret not found');
        }

        // const payment = await Payment.findOne({ session_id: sessionId });

        // if (payment) {
        //   payment.status = 'Failed';
        //   await payment.save();
        //   // console.log('Payment marked as failed:', { clientSecret });
        // } else {
        //   console.warn(
        //     'No Payment record found for Client Secret:',
        //     clientSecret,
        //   );
        // }

        break;
      }

      default:
        // // console.log(`Unhandled event type: ${event.type}`);
        // res.status(400).send();
        return;
    }
   
  } catch (err) {
    console.error('Error processing webhook event:', err);
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    session.endSession();
  }
};

// const paymentRefundService = async (
//   amount: number | null,
//   payment_intent: string,
// ) => {
//   const refundOptions: Stripe.RefundCreateParams = {
//     payment_intent,
//   };

//   // Conditionally add the `amount` property if provided
//   if (amount) {
//     refundOptions.amount = Number(amount);
//   }

//   // console.log('refaund options', refundOptions);

//   const result = await stripe.refunds.create(refundOptions);
//   // console.log('refund result ', result);
//   return result;
// };

const getAllEarningRatio = async (year: number, businessId: string) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0,
  }));

  // console.log({ months });

  const incomeData = await Payment.aggregate([
    {
      $match: {
        status: 'complete',
        transactionDate: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$transactionDate' } },
        totalIncome: { $sum: '$amount' },
      },
    },
    {
      $project: {
        month: '$_id.month',
        totalIncome: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  incomeData.forEach((data) => {
    const monthData = months.find((m) => m.month === data.month);
    if (monthData) {
      monthData.totalIncome = data.totalIncome;
    }
  });

  return months;
};

const refreshAccountConnect = async (
  id: string,
  host: string,
  protocol: string,
): Promise<string> => {
  const onboardingLink = await stripe.accountLinks.create({
    account: id,
    refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
    return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const createStripeAccount = async (
  user: any,
  host: string,
  protocol: string,
): Promise<any> => {
  // console.log('user',user);
  const existingAccount = await StripeAccount.findOne({
    userId: user.userId,
  }).select('user accountId isCompleted');
  // console.log('existingAccount', existingAccount);

  if (existingAccount) {
    if (existingAccount.isCompleted) {
      return {
        success: false,
        message: 'Account already exists',
        data: existingAccount,
      };
    }

    const onboardingLink = await stripe.accountLinks.create({
      account: existingAccount.accountId,
      refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
      return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
      type: 'account_onboarding',
    });
    // console.log('onboardingLink-1', onboardingLink);

    return {
      success: true,
      message: 'Please complete your account',
      url: onboardingLink.url,
    };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  // console.log('stripe account', account);

  await StripeAccount.create({ accountId: account.id, userId: user.userId });

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
    return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
    type: 'account_onboarding',
  });

  // console.log('onboardingLink-2', onboardingLink);

  return {
    success: true,
    message: 'Please complete your account',
    url: onboardingLink.url,
  };
};

const stripeConnectedAccountLoginQuery = async (landlordUserId: string) => {
  console.log('completed account hit hoise');
  const isExistaccount = await StripeAccount.findOne({
    userId: landlordUserId,
    isCompleted: true,
  });

  if (!isExistaccount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Account Not Found!!');
  }
  if (!isExistaccount.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Account Created not Completed');
  }

  const account = await stripe.accounts.createLoginLink(
    isExistaccount.accountId,
  );

  return account;
};

// const transferBalanceService = async (
//   accountId: string,
//   amt: number,
//   userId: string,
// ) => {
//   const withdreawAmount = await availablewithdrawAmount('stripe', userId);
//   // console.log('withdreawAmount===', withdreawAmount[0].totalAmount);

//   if (withdreawAmount[0].totalAmount < 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be positive');
//   }
//   const amount = withdreawAmount[0].totalAmount * 100;
//   const transfer = await stripe.transfers.create({
//     amount,
//     currency: 'usd',
//     destination: accountId,
//   });
//   // console.log('transfer', transfer);
//   if (!transfer) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
//   }
//   let withdraw;
//   if (transfer) {
//     const withdrawData: any = {
//       transactionId: transfer.id,
//       amount: withdreawAmount[0].totalAmount,
//       method: 'stripe',
//       status: 'completed',
//       businessId: userId,
//       destination: transfer.destination,
//     };

//     withdraw = withdrawService.addWithdrawService(withdrawData);
//     if (!withdraw) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Withdrawal failed');
//     }
//   }
//   return withdraw;
// };
// 0 0 */7 * *

// cron.schedule('* * * * *', async () => {
//   // console.log('Executing transferBalanceService every 7 days...');
//   const businessUser = await User.find({
//     role: 'business',
//     isDeleted: false,
//   });
//   // console.log('businessUser==', businessUser);

//   for (const user of businessUser) {
//     // console.log('usr=====');
//     const isExiststripeAccount:any = await StripeAccount.findOne({
//       userId: user._id,
//       isCompleted: true,
//     });
//     // console.log('isExiststripeAccount', isExiststripeAccount);

//     if (!isExiststripeAccount) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Account not found');
//     }

//      // console.log('=====1')
//     await transferBalanceService(
//       isExiststripeAccount.accountId,
//       0,
//       isExiststripeAccount.userId,
//     );
//     // console.log('=====2');
//   }

//   // await transferBalanceService();
// });

export const paymentService = {
  addPaymentService,
  getAllPaymentService,
  getAllPaymentBySellerService,
  singlePaymentService,
  deleteSinglePaymentService,
  getAllPaymentByCustomerService,
  getAllIncomeRatio,
  getAllIncomeRatiobyDays,
  createCheckout,
  automaticCompletePayment,
  getAllEarningRatio,
  //   paymentRefundService,
  //   filterBalanceByPaymentMethod,
  //   filterWithdrawBalanceByPaymentMethod,
  createStripeAccount,
  stripeConnectedAccountLoginQuery,
  refreshAccountConnect,
  //   transferBalanceService,
};
