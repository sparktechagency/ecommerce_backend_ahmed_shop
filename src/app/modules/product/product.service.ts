import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import Product from './product.model';
import { TProduct } from './product.interface';
import FavoriteProduct from '../favorite/favorite.model';
import { access } from 'fs/promises';
import { unlink } from 'fs/promises';
import { Category } from '../category/category.model';
import Offer from '../offer/offer.model';
import { Payment } from '../payment/payment.model';
import { Order } from '../orders/orders.model';
import Shop from '../shop/shop.model';
import { StripeAccount } from '../stripeAccount/stripeAccount.model';
import { stripe } from '../payment/payment.service';
import { User } from '../user/user.models';
// import PickupAddress from '../pickupAddress/pickupAddress.model';


const createProductService = async (payload: TProduct) => {

  const selllerExist:any = await User.findById(payload.sellerId);

  if (!selllerExist) {
    throw new AppError(400, 'Seller is not Found!!');
  }

  const requiredFields = [
    'city',
    'address_line1',
    'country_code',
    'postal_code',
    'state_code',
    'phone',
  ];

  for (const field of requiredFields) {
    if (!selllerExist[field]) {
      throw new AppError(
        400,
        `Please update your profile. The field "${field}" is required. Please input valid information.`,
      );
    }
  }

    // const isStripeConnectedAccount = await StripeAccount.findOne({
    //   userId: payload.sellerId,
    // });

    // if (!isStripeConnectedAccount) {
    //   throw new AppError(404, 'Stripe Connected Account Not Found!!');
    // }

    // if (isStripeConnectedAccount.isCompleted === false) {
    //   throw new AppError(
    //     404,
    //     'Stripe Connected Account Not Valid or incompleted. Please again create account!!',
    //   );
    // }

    // const account = await stripe.accounts.retrieve(
    //   isStripeConnectedAccount.accountId,
    // );
    // if (!account.payouts_enabled) {
    //   throw new AppError(
    //     httpStatus.BAD_REQUEST,
    //     'Payouts are not enabled for this account',
    //   );
    // }

  const isExistShop = await Shop.findOne({ sellerId: payload.sellerId });
  if (!isExistShop) {
    throw new AppError(400, 'Shop is not Found!!');
  }
  if (isExistShop.status !== 'verify') {
    throw new AppError(
      400,
      'Your shop is not verified yet. Until the verification process is complete, you cannot add any products. Please complete the verification and try again. Thank you.',
    );
  }

  payload.shopId = isExistShop._id;


  const categoryExist = await Category.findOne({
    _id: payload.categoryId,
    isActive: true,
  });
  if (!categoryExist) {
    throw new AppError(400, 'Category is not Found!!');
  }

  payload.categoryName = categoryExist.name;
  
  const result = await Product.create(payload);

  
    if (!result) {
      const imagePaths = payload.images.map(
        (image: string) => `public/${image}`,
      );

      try {
        await Promise.all(
          imagePaths.map(async (imagePath) => {
            try {
              await access(imagePath);
              await unlink(imagePath);
            } catch (error: any) {
              console.error(
                `Error handling file at ${imagePath}:`,
                error.message,
              );
            }
          }),
        );
      } catch (error: any) {
        console.error('Error deleting images:', error.message);
      }
    }

  return result;
};


const getAllProductQuery = async (query: Record<string, unknown>) => {
  console.log('query==', query);
  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false }).populate('sellerId'),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;

// const isOfferByProduct = await Offer.find({
//   endDate: { $gte: new Date() },
// });
//   const offerProductList = await Promise.all(
//     result.map(async (product: any) => {
//       const offer = isOfferByProduct.find(
//         (offer) => offer.productId.equals(product._id),
//       )
//       console.log('offer==', offer);
//       console.log('offer==', offer?.offer);
//        let populatedProduct:any = await Product.findById(product._id).populate('sellerId').exec();
  
//       if (offer) {
//         populatedProduct.isOffer = offer?.offer; 
//       } else {
//         populatedProduct.isOffer = false;
//       }
//         return populatedProduct;
//     })
//   )

const isOfferByProduct = await Offer.find({
  endDate: { $gte: new Date() },
  productId: { $in: result.map((product: any) => product._id) },
});
console.log('isOfferByProduct==', isOfferByProduct);

// Creating a map for faster lookup of offers by productId
const offerMap = isOfferByProduct.reduce((map:any, offer) => {
  map[offer.productId.toString()] = offer.offer; // Store offer by productId as key (convert to string)
  return map;
}, {});

console.log('offerMap==', offerMap);

const offerProductList = result.map((product: any) => {
  // Convert Mongoose document to a plain JavaScript object
  // This is important to allow adding new properties like 'isOffer'
  const productObject = product.toObject();

  const offerForProduct = offerMap[product._id.toString()];
  console.log('offerForProduct==', offerForProduct);

  if (offerForProduct) {
    console.log('Found offer for product:', offerForProduct);
    productObject.isOffer = offerForProduct;
  } else {
    console.log('No offer found for product:', product._id);
    productObject.isOffer = null; // Or false, depending on your desired default
  }

  return productObject;
});

  console.log('offerProductList==', offerProductList);

  const meta = await productQuery.countTotal();
  return { meta, result: offerProductList };
};


const getAllProductBySellerQuery = async (query: Record<string, unknown>, userId: string) => {
  console.log('query==', query);

 
  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false, sellerId:userId }),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;

  const isOfferByProduct = await Offer.find({
    endDate: { $gte: new Date() },
    productId: { $in: result.map((product: any) => product._id) },
  });
  console.log('isOfferByProduct==', isOfferByProduct);

  // Creating a map for faster lookup of offers by productId
  const offerMap = isOfferByProduct.reduce((map: any, offer) => {
    map[offer.productId.toString()] = offer.offer; // Store offer by productId as key (convert to string)
    return map;
  }, {});

  console.log('offerMap==', offerMap);

  const offerProductList = result.map((product: any) => {
    // Convert Mongoose document to a plain JavaScript object
    // This is important to allow adding new properties like 'isOffer'
    const productObject = product.toObject();

    const offerForProduct = offerMap[product._id.toString()];
    console.log('offerForProduct==', offerForProduct);

    if (offerForProduct) {
      console.log('Found offer for product:', offerForProduct);
      productObject.isOffer = offerForProduct;
    } else {
      console.log('No offer found for product:', product._id);
      productObject.isOffer = null; // Or false, depending on your desired default
    }

    return productObject;
  });

  const meta = await productQuery.countTotal();
  return { meta, result: offerProductList };
};


const getAllProductByOfferBySellerQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  console.log('query==', query);

  const productQuery = new QueryBuilder(
    Product.find({ isDeleted: false, sellerId: userId }).select("name"),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;

  const meta = await productQuery.countTotal();
  return { meta, result: result };
};


const getAllProductOverviewBySellerQuery = async (
  query: Record<string, unknown>,
  sellerId: string,
) => {
  console.log('query==', query);

  const productCount = await Product.countDocuments({
    sellerId: sellerId,
  });

  const payments = await Payment.find({ sellerId }); 
  const totalEarning = payments.reduce((acc, payment) => {
    acc += Number(payment.amount);
    return acc;
  }, 0); 

  console.log('productCount', productCount);
  console.log('totalEarning', totalEarning);

  const totalOrder = await Order.countDocuments({
    sellerId: sellerId,
  })
  const totalPendingOrder = await Order.countDocuments({
    sellerId: sellerId,
    paymentStatus: 'pending',
  });



  return {
    productCount,
    totalEarning,
    totalOrder,
    totalPendingOrder
  };
};

const getSingleProductQuery = async (id: string, userId:string) => {
    // console.log('userId=', userId);

  const product: any = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }

  const favoriteProducts = await FavoriteProduct.find({userId});

  const isFavoriteProduct = favoriteProducts.find(
    (favorite) => favorite.productId.equals(product._id),
  );

  const updateData = {
    ...product._doc,
    isFavorite: isFavoriteProduct ? true : false
  };

  const isOfferByProduct = await Offer.find({
    endDate: { $gte: new Date() },
  });
  const offer = isOfferByProduct.find(
    (offer) => offer.productId.equals(product._id),
  );
  if (offer) {
    updateData.isOffer = offer.offer;
  }

  return updateData;
};



const getBestSellingProductQuery = async (sellerId: string) => {
  const allProducts: any = await Product.find({ sellerId });

  if (!allProducts || allProducts.length === 0) {
    throw new AppError(404, 'Products Not Found!!');
  }

  const productsWithSales = allProducts.map((product: any) => {
    const soldAmount = product.stock - product.availableStock; 
    return { ...product.toObject(), soldAmount };
  });

  const bestSellingProduct = productsWithSales.sort(
    (a: any, b: any) => b.soldAmount - a.soldAmount,
  ).slice(0, 3); // i can controll data from here 

  if (!bestSellingProduct) {
    throw new AppError(404, 'Best Selling Product Not Found!!');
  }

  return bestSellingProduct;
};


const updateSingleProductQuery = async (id: string, payload:any, userId:string) => {
  const product: any = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }

  if (product.sellerId.toString() !== userId.toString()) {
    throw new AppError(
      404,
      'You are not valid Seller for deleted this product!!',
    );
  }

  const { remainingUrl, ...rest } = payload;
  console.log('rest==', rest);

  const differentStock = Math.abs( product.availableStock - rest.availableStock);
  console.log('differentStock', differentStock);

  if (differentStock !== 0) {
    rest.stock = product.stock + differentStock;
  }

 console.log('rest==2', rest);
  // const availableStock = rest.availableStock;
  // console.log('availableStock==', availableStock);
  const oldImages = product.images || []; 
console.log('oldImages', oldImages);
console.log('remainingUrl', remainingUrl);
  const result = await Product.findOneAndUpdate(
    {_id:id, sellerId:userId},
    { ...rest },
    { new: true },
  );

  if (!result) {
    throw new AppError(403, 'Product updated faield !!');
  }

   const newImages = result.images || [];
   const imagesToDelete = oldImages.filter(
     (oldImage: string) => !newImages.includes(oldImage),
   );
   console.log('imagesToDelete==', imagesToDelete);

    if (imagesToDelete.length > 0) {
      for (const image of imagesToDelete) {
        const imagePath = `public/${image}`; 
        try {
          await access(imagePath); 
          await unlink(imagePath);
          console.log(`Deleted image: ${imagePath}`);
        } catch (error: any) {
          console.error(`Error handling file at ${imagePath}:`, error.message);
        }
      }
    }

  return result;
};

const deletedProductQuery = async (id: string, userId: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid input parameters');
  }
   const user = await Product.findById(userId);
   if (!user) {
     throw new AppError(404, 'User Not Found!!');
   }
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'Product Not Found!!');
  }
 
  if (product.isDeleted) {
    throw new AppError(404, 'Product already deleted !!');
  }
  if (product.sellerId.toString() !== userId.toString()) {
    throw new AppError(404, 'You are not valid Seller for deleted this product!!');
  }

  const result = await Product.findOneAndUpdate(
    {_id: id, sellerId: userId}, 
    { isDeleted: true }, 
    { new: true }, 
  );

  if (!result) {
    throw new AppError(404, 'Product Not Found!');
  }

  return result;
};

export const productService = {
  createProductService,
  getAllProductQuery,
  getAllProductBySellerQuery,
  getAllProductByOfferBySellerQuery,
  getBestSellingProductQuery,
  getAllProductOverviewBySellerQuery,
  getSingleProductQuery,
  updateSingleProductQuery,
  deletedProductQuery,
};
