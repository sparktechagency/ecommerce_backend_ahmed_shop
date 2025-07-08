import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { orderController } from './orders.controller';


const orderRouter = express.Router();

orderRouter
  .post('/create-order', auth(USER_ROLE.CUSTOMER), orderController.createOrder)
  .get(
    '/',
    auth(USER_ROLE.CUSTOMER, USER_ROLE.SELLER),
    orderController.getAllOrderByCustomerAndSeller,
  )
  .get('/:id', orderController.getSingleOrder)
  .patch(
    '/:id',
    auth(USER_ROLE.SELLER),
    orderController.updateSingleOrderStatus,
  )
  .delete('/:id', auth(USER_ROLE.CUSTOMER), orderController.deleteSingleOrder);

export default orderRouter;
