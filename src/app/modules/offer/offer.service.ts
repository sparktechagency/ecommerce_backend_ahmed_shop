import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import Product from '../product/product.model';
import { TOffer } from './offer.interface';
import Offer from './offer.model';
import { User } from '../user/user.models';

const createOfferService = async (payload: TOffer) => {
  const isExist = await Offer.findOne({
    productId: payload.productId,
    endDate: { $gte: new Date() },
  });
  if (isExist) {
    throw new AppError(400, 'Offer already exist for this product');
  }

  const isProductExist = await Product.findById(payload.productId);
  if (!isProductExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }
  const result = await Offer.create(payload);

  return result;
};

const getAllOfferQuery = async (query: Record<string, unknown>, sellerId: string) => {
  const OfferQuery = new QueryBuilder(
    Offer.find({sellerId}).populate({ path: 'productId' }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await OfferQuery.modelQuery;
  console.log('=======result', result);
  const offerExpair = result.map((offer: any) => {
    const today = new Date();
    const offerEndDate = new Date(offer.endDate);
    const isActive = today <= offerEndDate;

    const firstMaterialName = offer?.productId?.name;

    return {
      _id: offer?._id,
      sellerId: offer?.sellerId,
      productId: offer?.productId?._id,
      offer: offer.offer,
      productName: firstMaterialName,
      startDate: offer.startDate,
      endDate: offer.endDate,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      active: isActive,
    };
  });
  console.log('offerExpair', offerExpair);
  const meta = await OfferQuery.countTotal();
  return { meta, result: offerExpair };
};

const getSingleOfferQuery = async (id: string) => {
  const productOffer: any = await Offer.findById(id);
  if (!productOffer) {
    throw new AppError(404, 'Offer Not Found!!');
  }
  const today = new Date();
  const offerEndDate = new Date(productOffer.endDate);
  const isActive = today <= offerEndDate;
  // productOffer.active = isActive;

  return {
    _id: productOffer._id,
    sellerId: productOffer.sellerId,
    productId: productOffer.productId,
    offer: productOffer.offer,
    startDate: productOffer.startDate,
    endDate: productOffer.endDate,
    createdAt: productOffer.createdAt,
    updatedAt: productOffer.updatedAt,
    active: isActive,
  };

};

const deletedOfferQuery = async (id: string, sellerId: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new AppError(404, 'Seller is Not Found!!');
  }

  const productOffer = await Offer.findById(id);
  if (!productOffer) {
    throw new AppError(404, 'Offer Not Found!!');
  }

  if (productOffer.sellerId.toString() !== sellerId.toString()) {
    throw new AppError(404, 'You are not valid Seller for deleted this offer!!');
  }
  
  const result = await Offer.findOneAndDelete({
    _id: id,
    sellerId: sellerId,
  });
  if (!result) {
    throw new AppError(404, 'Offer deleted is failed!!');
  }

  return result;
};

export const offerService = {
  createOfferService,
  getAllOfferQuery,
  getSingleOfferQuery,
  deletedOfferQuery,
};
