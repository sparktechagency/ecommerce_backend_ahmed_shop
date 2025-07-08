import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { shopService } from './shop.service';

const createShop = catchAsync(async (req, res) => {
  console.log('hit hoise');
  const {userId} = req.user;
  const shopData = req.body;
  shopData.sellerId = userId;

  const imageFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

   if (imageFiles?.image && imageFiles.image.length > 0) {
     shopData.image = imageFiles.image[0].path.replace(/^public[\\/]/, '');
   }
   if (imageFiles?.document && imageFiles.document.length > 0) {
     shopData.document = imageFiles.document[0].path.replace(
       /^public[\\/]/,
       '',
     );
   }


  const result = await shopService.createShopService(shopData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop added successfully!',
    data: result,
  });
});

const getAllShopbyAdmin = catchAsync(async (req, res) => {
  const { meta, result } = await shopService.getAllShopByAdminQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Shop by admin are requered successful!!',
  });
});


const getShopBySeller = catchAsync(async (req, res) => {
    const {userId} = req.user;
  const result = await shopService.getShopBySellerQuery(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: ' Seller Shop are requered successful!!',
  });
});

const getSingleShop = catchAsync(async (req, res) => {
  const result = await shopService.getSingleShopQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Shop are requered successful!!',
  });
});

const verifySingleShop = catchAsync(async (req, res) => {
  const result = await shopService.shopVerifyByAdmin(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Verify Single Shop are successful!!',
  });
});

const updateSingleShop = catchAsync(async (req, res) => {
    const {userId} = req.user;
    const shopData = req.body;

    const imageFiles = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (imageFiles?.image && imageFiles.image.length > 0) {
      shopData.image = imageFiles.image[0].path.replace(/^public[\\/]/, '');
    }
    if (imageFiles?.document && imageFiles.document.length > 0) {
      shopData.document = imageFiles.document[0].path.replace(
        /^public[\\/]/,
        '',
      );
    }

    

  const result = await shopService.updateShopQuery(req.params.id, shopData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update Single Shop are successful!!',
  });
});

export const shopController = {
  createShop,
  getAllShopbyAdmin,
  getShopBySeller,
  verifySingleShop,
  getSingleShop,
  updateSingleShop
};
