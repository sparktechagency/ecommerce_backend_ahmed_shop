import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TShop } from './shop.interface';
import Shop from './shop.model';
import { notificationService } from '../notification/notification.service';

const createShopService = async (payload: TShop) => {
  const isExist = await Shop.findOne({
    sellerId: payload.sellerId,
  });
  if (isExist) {
    throw new AppError(400, 'Shop already exist for this seller!!');
  }

  const result = await Shop.create(payload);

  return result;
};

const getAllShopByAdminQuery = async (
  query: Record<string, unknown>,
) => {
  const ShopQuery = new QueryBuilder(
    Shop.find({}).populate('sellerId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ShopQuery.modelQuery;
  console.log('=======result', result);
  
  const meta = await ShopQuery.countTotal();
  return { meta, result };
};

const getShopBySellerQuery = async (sellerId: string) => {
    const seller = await User.findById(sellerId);
    if (!seller) {
      throw new AppError(404, 'Seller is Not Found!!');
    }
  const shop = await Shop.findOne({ sellerId: sellerId }).populate('sellerId');
  if (!shop) {
    throw new AppError(404, 'Shop Not Found!!');
  }
  return shop;
 
};

const getSingleShopQuery = async (id: string) => {
  const shop = await Shop.findById(id).populate('sellerId');
  if (!shop) {
    throw new AppError(404, 'Shop Not Found!!');
  }
  return shop;
};


const shopVerifyByAdmin  = async(id:string)=>{
    const shop = await Shop.findById(id).populate('sellerId');
    if (!shop) {
      throw new AppError(404, 'Shop Not Found!!');
    }

    if(shop.status === 'verify'){
      throw new AppError(403, 'Shop already verified!!');
    }

    const verifyShop = await Shop.findOneAndUpdate(
      { _id: id },
      { status: 'verify' },
      {
        new: true
      },
    )
    
    if(!verifyShop){
      throw new AppError(403, 'Shop verify failed!!');
    }
    
    if(verifyShop){
      const notificationData = {
        userId: shop.sellerId._id,
        message: 'Your Shop is verified now!!',
        type: 'success',
      };

      const notification = await notificationService.createNotification(
        notificationData,
      )

      if(!notification){
        throw new AppError(403, 'Notification create failed!!');
      }




    }

    return verifyShop ;

}

const updateShopQuery = async (id: string, payload: TShop) => {
    console.log('id', id);
    console.log('payload', payload);
  const result = await Shop.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(404, 'Shop Not Found!!');
  }
  return result;
};

export const shopService = {
  createShopService,
  getAllShopByAdminQuery,
  getShopBySellerQuery,
  updateShopQuery,
  shopVerifyByAdmin,
  getSingleShopQuery
};
