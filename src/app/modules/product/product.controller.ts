import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { productService } from './product.service';
import Product from './product.model';
import AppError from '../../error/AppError';

const createProduct = catchAsync(async (req, res) => {
    const productData = req.body;
  const {userId} = req.user;
  productData.sellerId = userId;

  console.log('hit hoise');

  const isExist = await Product.findOne({
    name: productData.name,
    sellerId: productData.sellerId,
  });
  if (isExist) {
    throw new AppError(400, 'Product already exist !');
  }
  productData.availableStock = Number(productData.stock);
  productData.stock =Number(productData.stock);
  productData.price = Number(productData.price);
  const imageFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  
  if (imageFiles?.images && imageFiles.images.length > 0) {
    productData.images = imageFiles.images.map((file) => file.path.replace(/^public[\\/]/, ''))

  }

  console.log('productData', productData);


  const result = await productService.createProductService(productData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product added successfully!',
    data: result,
  });
});

const getAllProduct = catchAsync(async (req, res) => {
  const { meta, result } = await productService.getAllProductQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Product are requered successful!!',
  });
});


const getAllProductBySeller = catchAsync(async (req, res) => {
  const {userId} = req.user;
  const { meta, result } = await productService.getAllProductBySellerQuery(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Product are requered successful!!',
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
    const {userId} = req.user;
  const result = await productService.getSingleProductQuery(req.params.id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Product are requered successful!!',
  });
});

const updateSingleProduct = catchAsync(async (req, res) => {
    const {id} = req.params;
    const {userId} = req.user;
    const updateData = req.body;
      let remainingUrl = updateData?.remainingUrl || null;
    const imageFiles = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    if (imageFiles?.images && imageFiles.images.length > 0) {
      updateData.images = imageFiles.images.map((file) =>
        file.path.replace(/^public[\\/]/, ''),
      );
    }
     if (remainingUrl) {
       if (!updateData.images) {
         updateData.images = [];
       }
       updateData.images = [...updateData.images, remainingUrl];
     }

    if(updateData.images && !remainingUrl){
      updateData.images = [...updateData.images];

    }
    
     updateData.price = Number(updateData.price);
     updateData.availableStock = Number(updateData.availableStock);

     console.log('updateData', updateData);

  const result = await productService.updateSingleProductQuery(id, updateData, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Product are updated successful!!',
  });
});

const deleteSingleProduct = catchAsync(async (req, res) => {
  const {userId} = req.user;
  const result = await productService.deletedProductQuery(req.params.id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Single Product are successful!!',
  });
});

export const productController = {
  createProduct,
  getAllProduct,
  getAllProductBySeller,
  getSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
};
