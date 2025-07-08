"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.stripe = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const payment_model_1 = require("./payment.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const stripe_1 = __importDefault(require("stripe"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const mongoose_1 = __importDefault(require("mongoose"));
const stripeAccount_model_1 = require("../stripeAccount/stripeAccount.model");
const product_model_1 = __importDefault(require("../product/product.model"));
const orders_model_1 = require("../orders/orders.model");
const notification_service_1 = require("../notification/notification.service");
// console.log({ first: config.stripe.stripe_api_secret });
exports.stripe = new stripe_1.default(config_1.default.stripe.stripe_api_secret);
// console.log('stripe==', stripe);
const addPaymentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("payment payload", payload);
    const order = yield orders_model_1.Order.findById(payload.orderId);
    if (!order) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order not found');
    }
    if (order.paymentStatus === 'paid') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order already paid');
    }
    const customer = yield user_models_1.User.findById(payload.customerId);
    if (!customer) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Customer not found');
    }
    if (order.customerId.toString() !== payload.customerId.toString()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not valid Customer for this order');
    }
    if (!payload.shippingCost) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shipping cost is required');
    }
    if (payload.shippingCost < 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Shipping cost can not be negative');
    }
    const productStock = order.productList.map((product) => {
        const singleProduct = product_model_1.default.findById(product.productId);
        if (!singleProduct) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product not found');
        }
        if (singleProduct.availableStock < product.quantity) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `${singleProduct.name} is out of stock`);
        }
        return singleProduct;
    });
    const totalPaymentAmount = Number(order.totalAmount) + Number(payload.shippingCost);
    console.log('totalPaymentAmount', totalPaymentAmount);
    const stripeAccountCompleted = yield stripeAccount_model_1.StripeAccount.findOne({
        userId: order.sellerId,
    });
    if (!stripeAccountCompleted) {
        throw new AppError_1.default(404, 'Seller Stripe Account is not found!!');
    }
    if (!stripeAccountCompleted.isCompleted) {
        throw new AppError_1.default(404, 'Seller Stripe Account is not Completed !!');
    }
    const paymentInfo = {
        orderId: order._id,
        amount: totalPaymentAmount,
        connectedAccountId: stripeAccountCompleted.accountId,
    };
    // console.log('======stripe payment');
    const checkoutResult = yield createCheckout(payload.customerId, paymentInfo);
    if (!checkoutResult) {
        throw new AppError_1.default(400, 'Failed to create checkout session!');
    }
    return checkoutResult;
});
const getAllPaymentService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find(), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const getAllPaymentByCustomerService = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find({ customerId, status: 'paid' }).populate({
        path: 'serviceId',
        select: 'serviceName servicePrice',
        populate: { path: 'businessId', select: 'businessName' },
    }), 
    // .populate('businessId'),
    query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const singlePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield payment_model_1.Payment.findById(id);
    return task;
});
const deleteSinglePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.Payment.deleteOne({ _id: id });
    return result;
});
const getAllIncomeRatio = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalIncome: 0,
    }));
    // console.log({ months });
    const incomeData = yield payment_model_1.Payment.aggregate([
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
});
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
const getAllIncomeRatiobyDays = (days, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDay = new Date();
    let startDate;
    if (days === '7day') {
        startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    else if (days === '24hour') {
        startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
    }
    else {
        throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
    }
    const timeSlots = days === '7day'
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
    const incomeData = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                sellerId: new mongoose_1.default.Types.ObjectId(sellerId),
                transactionDate: { $gte: startDate, $lte: currentDay },
            },
        },
        {
            $group: {
                _id: days === '7day'
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
            const dayData = timeSlots.find((d) => d.dateHour === data.dateHour);
            if (dayData) {
                dayData.totalIncome = data.totalIncome;
            }
        }
        else if (days === '24hour') {
            const hourData = timeSlots.find((h) => h.dateHour === data.dateHour);
            if (hourData) {
                hourData.totalIncome = data.totalIncome;
            }
        }
    });
    return timeSlots;
});
const createCheckout = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('stripe payment', payload);
    let session = {};
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
    const sessionData = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://10.0.70.35:8084/api/v1/payment/success`,
        cancel_url: `http://10.0.70.35:8084/api/v1/payment/cancel`,
        line_items: lineItems,
        metadata: {
            userId: String(userId),
            orderId: String(payload.orderId),
        },
        payment_intent_data: {
            application_fee_amount: adminFeeAmount,
            transfer_data: {
                destination: payload.connectedAccountId,
            },
            on_behalf_of: payload.connectedAccountId,
        },
    };
    try {
        session = yield exports.stripe.checkout.sessions.create(sessionData);
    }
    catch (error) {
        console.log('Error', error);
    }
    const { id: session_id, url } = session || {};
    return { url };
});
const automaticCompletePayment = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit hise webhook controller servie');
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                console.log('hit hise webhook controller servie checkout.session.completed');
                const sessionData = event.data.object;
                const { id: sessionId, payment_intent: paymentIntentId, metadata, } = sessionData;
                const orderId = metadata === null || metadata === void 0 ? void 0 : metadata.orderId;
                const userId = metadata === null || metadata === void 0 ? void 0 : metadata.userId;
                if (!paymentIntentId) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment Intent ID not found in session');
                }
                const paymentIntent = yield exports.stripe.paymentIntents.retrieve(paymentIntentId);
                if (!paymentIntent || paymentIntent.amount_received === 0) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment Not Successful');
                }
                const adminAmount = Math.round(paymentIntent.amount_received * 0.1) / 100;
                const mainAmount = (paymentIntent.amount_received) / 100;
                const orderdata = yield orders_model_1.Order.findById(orderId).session(session);
                if (!orderdata) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order not found');
                }
                const paymentData = {
                    customerId: userId,
                    sellerId: orderdata === null || orderdata === void 0 ? void 0 : orderdata.sellerId,
                    amount: mainAmount - adminAmount,
                    adminAmount: adminAmount,
                    method: 'stripe',
                    transactionId: paymentIntentId,
                    orderId: orderdata === null || orderdata === void 0 ? void 0 : orderdata._id,
                    status: 'paid',
                    session_id: sessionId,
                    transactionDate: new Date(),
                };
                const payment = yield payment_model_1.Payment.create([paymentData], { session });
                console.log('===payment', payment);
                if (!payment) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment record creation failed');
                }
                const order = yield orders_model_1.Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' }, { new: true, session });
                if (!order) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order not found');
                }
                const productlist = yield Promise.all(order.productList.map((product) => __awaiter(void 0, void 0, void 0, function* () {
                    const singleProduct = yield product_model_1.default.findById(product.productId).session(session);
                    if (!singleProduct) {
                        throw new AppError_1.default(404, 'Product is not Found!!');
                    }
                    if (singleProduct.availableStock < product.quantity) {
                        throw new AppError_1.default(403, 'Stock is not available!!');
                    }
                    const updatedProduct = yield product_model_1.default.findOneAndUpdate({
                        _id: product.productId
                    }, { $inc: { availableStock: -product.quantity } }, { new: true, session });
                    if (!updatedProduct) {
                        throw new AppError_1.default(403, 'Insufficient stock after retry');
                    }
                    return updatedProduct;
                })));
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
                const [notification, notification1, notification2] = yield Promise.all([
                    notification_service_1.notificationService.createNotification(notificationData),
                    notification_service_1.notificationService.createNotification(notificationData1),
                    notification_service_1.notificationService.createNotification(notificationData2),
                ]);
                if (!notification || !notification1 || !notification2) {
                    throw new AppError_1.default(404, 'Notification create faild!!');
                }
                yield session.commitTransaction();
                session.endSession();
                console.log('Payment completed successfully:', {
                    sessionId,
                    paymentIntentId,
                });
                break;
            }
            case 'checkout.session.async_payment_failed': {
                const session = event.data.object;
                const clientSecret = session.client_secret;
                const sessionId = session.id;
                if (!clientSecret) {
                    console.warn('Client Secret not found in session.');
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Client Secret not found');
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
    }
    catch (err) {
        console.error('Error processing webhook event:', err);
        yield session.abortTransaction();
        session.endSession();
    }
});
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
const getAllEarningRatio = (year, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalIncome: 0,
    }));
    // console.log({ months });
    const incomeData = yield payment_model_1.Payment.aggregate([
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
});
const refreshAccountConnect = (id, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    const onboardingLink = yield exports.stripe.accountLinks.create({
        account: id,
        refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
        return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
        type: 'account_onboarding',
    });
    return onboardingLink.url;
});
const createStripeAccount = (user, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('user',user);
    const existingAccount = yield stripeAccount_model_1.StripeAccount.findOne({
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
        const onboardingLink = yield exports.stripe.accountLinks.create({
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
    const account = yield exports.stripe.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US',
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    // console.log('stripe account', account);
    yield stripeAccount_model_1.StripeAccount.create({ accountId: account.id, userId: user.userId });
    const onboardingLink = yield exports.stripe.accountLinks.create({
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
});
const stripeConnectedAccountLoginQuery = (landlordUserId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('completed account hit hoise');
    const isExistaccount = yield stripeAccount_model_1.StripeAccount.findOne({
        userId: landlordUserId,
        isCompleted: true,
    });
    if (!isExistaccount) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Account Not Found!!');
    }
    if (!isExistaccount.isCompleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Account Created not Completed');
    }
    const account = yield exports.stripe.accounts.createLoginLink(isExistaccount.accountId);
    return account;
});
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
exports.paymentService = {
    addPaymentService,
    getAllPaymentService,
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
