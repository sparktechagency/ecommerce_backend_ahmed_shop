import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { productController } from './product.controller';


const upload = fileUpload('./public/uploads/products');

const productRouter = express.Router();

productRouter
  .post(
    '/create-product',
    auth(USER_ROLE.SELLER),
    upload.fields([{ name: 'images', maxCount: 5 }]),
    // validateRequest(videoValidation.VideoSchema),
    productController.createProduct,
  )
  .get('/', productController.getAllProduct)
  .get('/sellers', auth(USER_ROLE.SELLER), productController.getAllProductBySeller)
  .get(
    '/:id',
    auth(USER_ROLE.CUSTOMER, USER_ROLE.SELLER),
    productController.getSingleProduct,
  )
  .patch(
    '/:id',
    auth(USER_ROLE.SELLER),
    upload.fields([{ name: 'images', maxCount: 1 }]),
    productController.updateSingleProduct,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.SELLER),
    productController.deleteSingleProduct,
  );

export default productRouter;
