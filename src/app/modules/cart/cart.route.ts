import express from 'express';
import { cartController } from './cart.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const cartRouter = express.Router();

cartRouter
  .post(
    '/create-cart',
    auth(USER_ROLE.CUSTOMER),
    // validateRequest(videoValidation.VideoSchema),
    cartController.createCart,
  )
  .get('/', auth(USER_ROLE.CUSTOMER), cartController.getAllCart)
  .patch(
    '/:id/quantity/:action',
    auth(USER_ROLE.CUSTOMER),
    cartController.singleCartProductQuantityUpdate,
  )
  .delete('/:id', auth(USER_ROLE.CUSTOMER), cartController.deleteSingleCart);

export default cartRouter;
