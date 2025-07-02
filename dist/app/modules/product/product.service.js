"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const product_model_1 = __importDefault(require("./product.model"));
const favorite_model_1 = __importDefault(require("../favorite/favorite.model"));
const promises_1 = require("fs/promises");
const promises_2 = require("fs/promises");
const category_model_1 = require("../category/category.model");
const offer_model_1 = __importDefault(require("../offer/offer.model"));
const payment_model_1 = require("../payment/payment.model");
const orders_model_1 = require("../orders/orders.model");
const shop_model_1 = __importDefault(require("../shop/shop.model"));
// import PickupAddress from '../pickupAddress/pickupAddress.model';
const createProductService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // const isPickupAddressExist = await PickupAddress.findOne({});
    // if (!isPickupAddressExist) {  
    //   throw new AppError(400, 'Pickup Address is not Found!!');
    // }
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
    const isExistShop = yield shop_model_1.default.findOne({ sellerId: payload.sellerId });
    if (!isExistShop) {
        throw new AppError_1.default(400, 'Shop is not Found!!');
    }
    if (isExistShop.status !== 'verify') {
        throw new AppError_1.default(400, 'Your shop is not verified yet. Until the verification process is complete, you cannot add any products. Please complete the verification and try again. Thank you.');
    }
    payload.shopId = isExistShop._id;
    const categoryExist = yield category_model_1.Category.findOne({
        _id: payload.categoryId,
        isActive: true,
    });
    if (!categoryExist) {
        throw new AppError_1.default(400, 'Category is not Found!!');
    }
    payload.categoryName = categoryExist.name;
    const result = yield product_model_1.default.create(payload);
    if (!result) {
        const imagePaths = payload.images.map((image) => `public/${image}`);
        try {
            yield Promise.all(imagePaths.map((imagePath) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield (0, promises_1.access)(imagePath);
                    yield (0, promises_2.unlink)(imagePath);
                }
                catch (error) {
                    console.error(`Error handling file at ${imagePath}:`, error.message);
                }
            })));
        }
        catch (error) {
            console.error('Error deleting images:', error.message);
        }
    }
    return result;
});
const getAllProductQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('query==', query);
    const productQuery = new QueryBuilder_1.default(product_model_1.default.find({ isDeleted: false }).populate('sellerId'), query)
        .search(['name', 'details'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield productQuery.modelQuery;
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
    const isOfferByProduct = yield offer_model_1.default.find({
        endDate: { $gte: new Date() },
        productId: { $in: result.map((product) => product._id) },
    });
    console.log('isOfferByProduct==', isOfferByProduct);
    // Creating a map for faster lookup of offers by productId
    const offerMap = isOfferByProduct.reduce((map, offer) => {
        map[offer.productId.toString()] = offer.offer; // Store offer by productId as key (convert to string)
        return map;
    }, {});
    console.log('offerMap==', offerMap);
    const offerProductList = result.map((product) => {
        // Convert Mongoose document to a plain JavaScript object
        // This is important to allow adding new properties like 'isOffer'
        const productObject = product.toObject();
        const offerForProduct = offerMap[product._id.toString()];
        console.log('offerForProduct==', offerForProduct);
        if (offerForProduct) {
            console.log('Found offer for product:', offerForProduct);
            productObject.isOffer = offerForProduct;
        }
        else {
            console.log('No offer found for product:', product._id);
            productObject.isOffer = null; // Or false, depending on your desired default
        }
        return productObject;
    });
    console.log('offerProductList==', offerProductList);
    const meta = yield productQuery.countTotal();
    return { meta, result: offerProductList };
});
const getAllProductBySellerQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('query==', query);
    const productQuery = new QueryBuilder_1.default(product_model_1.default.find({ isDeleted: false, sellerId: userId }), query)
        .search(['name', 'details'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield productQuery.modelQuery;
    const isOfferByProduct = yield offer_model_1.default.find({
        endDate: { $gte: new Date() },
        productId: { $in: result.map((product) => product._id) },
    });
    console.log('isOfferByProduct==', isOfferByProduct);
    // Creating a map for faster lookup of offers by productId
    const offerMap = isOfferByProduct.reduce((map, offer) => {
        map[offer.productId.toString()] = offer.offer; // Store offer by productId as key (convert to string)
        return map;
    }, {});
    console.log('offerMap==', offerMap);
    const offerProductList = result.map((product) => {
        // Convert Mongoose document to a plain JavaScript object
        // This is important to allow adding new properties like 'isOffer'
        const productObject = product.toObject();
        const offerForProduct = offerMap[product._id.toString()];
        console.log('offerForProduct==', offerForProduct);
        if (offerForProduct) {
            console.log('Found offer for product:', offerForProduct);
            productObject.isOffer = offerForProduct;
        }
        else {
            console.log('No offer found for product:', product._id);
            productObject.isOffer = null; // Or false, depending on your desired default
        }
        return productObject;
    });
    const meta = yield productQuery.countTotal();
    return { meta, result: offerProductList };
});
const getAllProductOverviewBySellerQuery = (query, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('query==', query);
    const productCount = yield product_model_1.default.countDocuments({
        sellerId: sellerId,
    });
    const payments = yield payment_model_1.Payment.find({ sellerId });
    const totalEarning = payments.reduce((acc, payment) => {
        acc += Number(payment.amount);
        return acc;
    }, 0);
    console.log('productCount', productCount);
    console.log('totalEarning', totalEarning);
    const totalOrder = yield orders_model_1.Order.countDocuments({
        sellerId: sellerId,
    });
    const totalPendingOrder = yield orders_model_1.Order.countDocuments({
        sellerId: sellerId,
        paymentStatus: 'pending',
    });
    return {
        productCount,
        totalEarning,
        totalOrder,
        totalPendingOrder
    };
});
const getSingleProductQuery = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('userId=', userId);
    const product = yield product_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(404, 'Product Not Found!!');
    }
    const favoriteProducts = yield favorite_model_1.default.find({ userId });
    const isFavoriteProduct = favoriteProducts.find((favorite) => favorite.productId.equals(product._id));
    const updateData = Object.assign(Object.assign({}, product._doc), { isFavorite: isFavoriteProduct ? true : false });
    const isOfferByProduct = yield offer_model_1.default.find({
        endDate: { $gte: new Date() },
    });
    const offer = isOfferByProduct.find((offer) => offer.productId.equals(product._id));
    if (offer) {
        updateData.isOffer = offer.offer;
    }
    return updateData;
});
const getBestSellingProductQuery = (sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const allProducts = yield product_model_1.default.find({ sellerId });
    if (!allProducts || allProducts.length === 0) {
        throw new AppError_1.default(404, 'Products Not Found!!');
    }
    const productsWithSales = allProducts.map((product) => {
        const soldAmount = product.stock - product.availableStock;
        return Object.assign(Object.assign({}, product.toObject()), { soldAmount });
    });
    const bestSellingProduct = productsWithSales.sort((a, b) => b.soldAmount - a.soldAmount).slice(0, 1); // i can controll data from here 
    if (!bestSellingProduct) {
        throw new AppError_1.default(404, 'Best Selling Product Not Found!!');
    }
    return bestSellingProduct;
});
const updateSingleProductQuery = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(404, 'Product Not Found!!');
    }
    if (product.sellerId.toString() !== userId.toString()) {
        throw new AppError_1.default(404, 'You are not valid Seller for deleted this product!!');
    }
    const { remainingUrl } = payload, rest = __rest(payload, ["remainingUrl"]);
    console.log('rest==', rest);
    const differentStock = Math.abs(product.availableStock - rest.availableStock);
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
    const result = yield product_model_1.default.findOneAndUpdate({ _id: id, sellerId: userId }, Object.assign({}, rest), { new: true });
    if (!result) {
        throw new AppError_1.default(403, 'Product updated faield !!');
    }
    const newImages = result.images || [];
    const imagesToDelete = oldImages.filter((oldImage) => !newImages.includes(oldImage));
    console.log('imagesToDelete==', imagesToDelete);
    if (imagesToDelete.length > 0) {
        for (const image of imagesToDelete) {
            const imagePath = `public/${image}`;
            try {
                yield (0, promises_1.access)(imagePath);
                yield (0, promises_2.unlink)(imagePath);
                console.log(`Deleted image: ${imagePath}`);
            }
            catch (error) {
                console.error(`Error handling file at ${imagePath}:`, error.message);
            }
        }
    }
    return result;
});
const deletedProductQuery = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const user = yield product_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User Not Found!!');
    }
    const product = yield product_model_1.default.findById(id);
    if (!product) {
        throw new AppError_1.default(404, 'Product Not Found!!');
    }
    if (product.isDeleted) {
        throw new AppError_1.default(404, 'Product already deleted !!');
    }
    if (product.sellerId.toString() !== userId.toString()) {
        throw new AppError_1.default(404, 'You are not valid Seller for deleted this product!!');
    }
    const result = yield product_model_1.default.findOneAndUpdate({ _id: id, sellerId: userId }, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(404, 'Product Not Found!');
    }
    return result;
});
exports.productService = {
    createProductService,
    getAllProductQuery,
    getAllProductBySellerQuery,
    getBestSellingProductQuery,
    getAllProductOverviewBySellerQuery,
    getSingleProductQuery,
    updateSingleProductQuery,
    deletedProductQuery,
};
