import express from 'express';
import { paymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

// import { auth } from "../../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter
  .post('/add-payment', auth(USER_ROLE.CUSTOMER), paymentController.addPayment)
  .post(
    '/create-stripe-connected-account',
    auth(USER_ROLE.SELLER),
    paymentController.createStripeAccount,
  )
  .post(
    '/login-stripe-connected-account',
    auth(USER_ROLE.SELLER),
    paymentController.stripeConnectedAccountLogin,
  )
  //   .post(
  //     '/transfer',
  //     auth(USER_ROLE.BUSINESS),
  //     paymentController.transferBalance,
  //   )

  //   .post(
  //   '/checkout',
  //   auth(USER_ROLE.CUSTOMER),
  //   paymentController.createCheckout,
  // )
  //   .post('/refund', paymentController.paymentRefund)
  .get('/success', paymentController.successPage)
  .get('/cancel', paymentController.cancelPage)

  .get(
    '/',
    // auth(USER_ROLE.ADMIN),
    paymentController.getAllPayment,
  )
  .get(
    '/user',
    auth(USER_ROLE.SELLER),
    paymentController.getAllPaymentBySeller,
  )
  // .get('/payment-tracking', auth(USER_ROLE.CUSTOMER), paymentController.getAllPaymentByCustomer)
  .get('/all-income-rasio', paymentController.getAllIncomeRasio)
  .get(
    '/all-income-rasio-by-days',
    auth(USER_ROLE.SELLER),
    paymentController.getAllIncomeRasioBydays,
  )
  .get(
    '/all-earning-rasio',
    auth(USER_ROLE.ADMIN),
    paymentController.getAllEarningRasio,
  )

  .get('/refreshAccountConnect/:id', paymentController.refreshAccountConnect)
  .get('/:id', paymentController.getSinglePayment)
  .get('/success-account/:id', paymentController.successPageAccount)

  .delete('/:id', paymentController.deleteSinglePayment);

export default paymentRouter;
