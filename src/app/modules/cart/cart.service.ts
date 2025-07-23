import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import Offer from '../offer/offer.model';
import Product from '../product/product.model';
import Shop from '../shop/shop.model';
import { User } from '../user/user.models';
import { TCart } from './cart.interface';
import Cart from './cart.model';

const createCartService = async (payload: TCart) => {
  const isProductExist = await Product.findById(payload.productId);
  if (!isProductExist) {
    throw new AppError(400, 'Product is not Found!!');
  }
  console.log('isProductExist', isProductExist);
  
  payload.weight = Number(isProductExist.weight); 
  payload.height = Number(isProductExist.height); 
  payload.width = Number(isProductExist.width); 
  payload.length = Number(isProductExist.length); 
  payload.sellerId = isProductExist.sellerId;
  console.log('payload', payload);

  const shopExist = await Shop.findOne(isProductExist.shopId);
  if (!shopExist) {
    throw new AppError(400, 'Shop is not Found!!');
  }
  payload.shopId = shopExist._id;

  const isOfferExist = await Offer.findOne({
    productId: payload.productId,
    endDate: { $gte: new Date() },
  });

   if (isOfferExist) {
     const offerPercentage = Number(isOfferExist.offer);
     payload.price = Number(isProductExist.price) * (1 - offerPercentage / 100);
     payload.offer = offerPercentage; 
   } else {
     payload.price = Number(isProductExist.price);
     payload.offer = 0; 
   }

  const isUserExist = await User.findById(payload.customerId);
  if (!isUserExist) {
    throw new AppError(400, 'User is not Found!!');
  }

  const isExistCartProduct = await Cart.findOne({
    productId: payload.productId,
    customerId: payload.customerId,
  });
    if (isExistCartProduct) {
      throw new AppError(400, 'Product is already Exist. Please check cart page!!');
    }

  const result = await Cart.create(payload);

  return result;
};

const getAllCartQuery = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const favoriteProductQuery = new QueryBuilder(
    Cart.find({ customerId }).populate({
      path: 'productId',
      select: 'name images',
    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await favoriteProductQuery.modelQuery;
  const meta = await favoriteProductQuery.countTotal();
  return { meta, result };
};



const singleCartProductQuantityUpdateQuery = async (
  id: string,
  action: 'increment' | 'decrement',
) => {
  const cartProduct = await Cart.findById(id);

  if (!cartProduct) {
    throw new AppError(400, 'Cart Product is not found!!');
  }

   const product:any = await Product.findById(cartProduct.productId);

   if (!product) {
     throw new AppError(400, 'Product not found for this cart item');
   }

  const quantityChange =
    action === 'increment' ? 1 : action === 'decrement' ? -1 : 0;

  if (cartProduct.quantity + quantityChange < 1) {
    throw new AppError(400, 'Quantity cannot be less than 0');
  }

  console.log('quantityChange==', quantityChange);

    const newQuantity = cartProduct.quantity + quantityChange;
     const newTotalPrice = newQuantity * product.price;
     const newTotalWeight = newQuantity * product.weight;
  // console.log('newQuantity==', newQuantity);
  // console.log('newTotalPrice==', newTotalPrice);

  if(product.availableStock < newQuantity) {
    throw new AppError(400, 'Product is out of stock!!');
  }

  const result = await Cart.findByIdAndUpdate(
    id,
    {
      quantity: newQuantity,
      price: newTotalPrice,
      weight: newTotalWeight
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(400, 'Failed to update the quantity');
  }
  return result;
};

const deletedCartQuery = async (id: string, customerId: string) => {
  const cart = await Cart.findById(id);
  if (!cart) {
    throw new AppError(404, 'Cart Not Found !');
  }
  if (cart.customerId.toString() !== customerId.toString())  {
    throw new AppError(404, 'you are not valid Customer for deleted this cart!!');
  }
  const result = await Cart.findOneAndDelete({_id:id, customerId:customerId});
  if (!result) {
    throw new AppError(404, 'Cart Not Found or Unauthorized Access!');
  }

  return result;
};

export const cartService = {
  createCartService,
  getAllCartQuery,
  singleCartProductQuantityUpdateQuery,
  deletedCartQuery,
};
