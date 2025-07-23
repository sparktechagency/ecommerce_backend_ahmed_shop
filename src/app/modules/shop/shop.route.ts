import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { shopController } from './shop.controller';

const shopRouter = express.Router();
const upload = fileUpload('./public/uploads/shop');

shopRouter
  .post(
    '/create-shop',
    ((req, res, next) => {
      console.log('hit hoise route');
      next();
    }),
    auth(USER_ROLE.SELLER),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ]),
    // validateRequest(videoValidation.VideoSchema),
    shopController.createShop,
  )
  .get(
    '/all-admin',
    auth(USER_ROLE.ADMIN),
    shopController.getAllShopbyAdmin,
  )
  .get('/', auth(USER_ROLE.SELLER), shopController.getShopBySeller)
  .get('/:id', shopController.getSingleShop)
  .patch(
    '/verify/:id',
    auth(USER_ROLE.ADMIN),
    shopController.verifySingleShop,
  )
  .patch(
    '/:id',
    auth(USER_ROLE.SELLER),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ]),
    shopController.updateSingleShop,
  );

export default shopRouter;
