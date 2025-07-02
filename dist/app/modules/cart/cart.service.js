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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const offer_model_1 = __importDefault(require("../offer/offer.model"));
const product_model_1 = __importDefault(require("../product/product.model"));
const shop_model_1 = __importDefault(require("../shop/shop.model"));
const user_models_1 = require("../user/user.models");
const cart_model_1 = __importDefault(require("./cart.model"));
const createCartService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExist = yield product_model_1.default.findById(payload.productId);
    if (!isProductExist) {
        throw new AppError_1.default(400, 'Product is not Found!!');
    }
    console.log('isProductExist', isProductExist);
    payload.weight = Number(isProductExist.weight);
    payload.sellerId = isProductExist.sellerId;
    console.log('payload', payload);
    const shopExist = yield shop_model_1.default.findOne(isProductExist.shopId);
    if (!shopExist) {
        throw new AppError_1.default(400, 'Shop is not Found!!');
    }
    payload.shopId = shopExist._id;
    const isOfferExist = yield offer_model_1.default.findOne({
        productId: payload.productId,
        endDate: { $gte: new Date() },
    });
    if (isOfferExist) {
        const offerPercentage = Number(isOfferExist.offer);
        payload.price = Number(isProductExist.price) * (1 - offerPercentage / 100);
        payload.offer = offerPercentage;
    }
    else {
        payload.price = Number(isProductExist.price);
        payload.offer = 0;
    }
    const isUserExist = yield user_models_1.User.findById(payload.customerId);
    if (!isUserExist) {
        throw new AppError_1.default(400, 'User is not Found!!');
    }
    const isExistCartProduct = yield cart_model_1.default.findOne({
        productId: payload.productId,
        customerId: payload.customerId,
    });
    if (isExistCartProduct) {
        throw new AppError_1.default(400, 'Product is already Exist. Please check cart page!!');
    }
    const result = yield cart_model_1.default.create(payload);
    return result;
});
const getAllCartQuery = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const favoriteProductQuery = new QueryBuilder_1.default(cart_model_1.default.find({ customerId }).populate({
        path: 'productId',
        select: 'name images',
    }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield favoriteProductQuery.modelQuery;
    const meta = yield favoriteProductQuery.countTotal();
    return { meta, result };
});
const singleCartProductQuantityUpdateQuery = (id, action) => __awaiter(void 0, void 0, void 0, function* () {
    const cartProduct = yield cart_model_1.default.findById(id);
    if (!cartProduct) {
        throw new AppError_1.default(400, 'Cart Product is not found!!');
    }
    const product = yield product_model_1.default.findById(cartProduct.productId);
    if (!product) {
        throw new AppError_1.default(400, 'Product not found for this cart item');
    }
    const quantityChange = action === 'increment' ? 1 : action === 'decrement' ? -1 : 0;
    if (cartProduct.quantity + quantityChange < 1) {
        throw new AppError_1.default(400, 'Quantity cannot be less than 0');
    }
    console.log('quantityChange==', quantityChange);
    const newQuantity = cartProduct.quantity + quantityChange;
    const newTotalPrice = newQuantity * product.price;
    const newTotalWeight = newQuantity * product.weight;
    // console.log('newQuantity==', newQuantity);
    // console.log('newTotalPrice==', newTotalPrice);
    if (product.availableStock < newQuantity) {
        throw new AppError_1.default(400, 'Product is out of stock!!');
    }
    const result = yield cart_model_1.default.findByIdAndUpdate(id, {
        quantity: newQuantity,
        price: newTotalPrice,
        weight: newTotalWeight
    }, { new: true });
    if (!result) {
        throw new AppError_1.default(400, 'Failed to update the quantity');
    }
    return result;
});
const deletedCartQuery = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_model_1.default.findById(id);
    if (!cart) {
        throw new AppError_1.default(404, 'Cart Not Found !');
    }
    if (cart.customerId.toString() !== customerId.toString()) {
        throw new AppError_1.default(404, 'you are not valid Customer for deleted this cart!!');
    }
    const result = yield cart_model_1.default.findOneAndDelete({ _id: id, customerId: customerId });
    if (!result) {
        throw new AppError_1.default(404, 'Cart Not Found or Unauthorized Access!');
    }
    return result;
});
exports.cartService = {
    createCartService,
    getAllCartQuery,
    singleCartProductQuantityUpdateQuery,
    deletedCartQuery,
};
