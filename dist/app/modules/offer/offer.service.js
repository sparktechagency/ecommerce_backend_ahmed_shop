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
exports.offerService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const product_model_1 = __importDefault(require("../product/product.model"));
const offer_model_1 = __importDefault(require("./offer.model"));
const user_models_1 = require("../user/user.models");
const createOfferService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield offer_model_1.default.findOne({
        productId: payload.productId,
        endDate: { $gte: new Date() },
    });
    if (isExist) {
        throw new AppError_1.default(400, 'Offer already exist for this product');
    }
    const isProductExist = yield product_model_1.default.findById(payload.productId);
    if (!isProductExist) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Product not found!');
    }
    const result = yield offer_model_1.default.create(payload);
    return result;
});
const getAllOfferQuery = (query, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const OfferQuery = new QueryBuilder_1.default(offer_model_1.default.find({ sellerId }).populate({ path: 'productId' }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield OfferQuery.modelQuery;
    console.log('=======result', result);
    const offerExpair = result.map((offer) => {
        var _a, _b;
        const today = new Date();
        const offerEndDate = new Date(offer.endDate);
        const isActive = today <= offerEndDate;
        const firstMaterialName = (_a = offer === null || offer === void 0 ? void 0 : offer.productId) === null || _a === void 0 ? void 0 : _a.name;
        return {
            _id: offer === null || offer === void 0 ? void 0 : offer._id,
            sellerId: offer === null || offer === void 0 ? void 0 : offer.sellerId,
            productId: (_b = offer === null || offer === void 0 ? void 0 : offer.productId) === null || _b === void 0 ? void 0 : _b._id,
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
    const meta = yield OfferQuery.countTotal();
    return { meta, result: offerExpair };
});
const getSingleOfferQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const productOffer = yield offer_model_1.default.findById(id);
    if (!productOffer) {
        throw new AppError_1.default(404, 'Offer Not Found!!');
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
});
const deletedOfferQuery = (id, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const seller = yield user_models_1.User.findById(sellerId);
    if (!seller) {
        throw new AppError_1.default(404, 'Seller is Not Found!!');
    }
    const productOffer = yield offer_model_1.default.findById(id);
    if (!productOffer) {
        throw new AppError_1.default(404, 'Offer Not Found!!');
    }
    if (productOffer.sellerId.toString() !== sellerId.toString()) {
        throw new AppError_1.default(404, 'You are not valid Seller for deleted this offer!!');
    }
    const result = yield offer_model_1.default.findOneAndDelete({
        _id: id,
        sellerId: sellerId,
    });
    if (!result) {
        throw new AppError_1.default(404, 'Offer deleted is failed!!');
    }
    return result;
});
exports.offerService = {
    createOfferService,
    getAllOfferQuery,
    getSingleOfferQuery,
    deletedOfferQuery,
};
