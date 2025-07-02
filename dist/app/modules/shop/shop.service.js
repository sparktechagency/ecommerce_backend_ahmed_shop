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
exports.shopService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const shop_model_1 = __importDefault(require("./shop.model"));
const notification_service_1 = require("../notification/notification.service");
const createShopService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield shop_model_1.default.findOne({
        sellerId: payload.sellerId,
    });
    if (isExist) {
        throw new AppError_1.default(400, 'Shop already exist for this seller!!');
    }
    const result = yield shop_model_1.default.create(payload);
    return result;
});
const getAllShopByAdminQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const ShopQuery = new QueryBuilder_1.default(shop_model_1.default.find({}).populate('sellerId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield ShopQuery.modelQuery;
    console.log('=======result', result);
    const meta = yield ShopQuery.countTotal();
    return { meta, result };
});
const getShopBySellerQuery = (sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const seller = yield user_models_1.User.findById(sellerId);
    if (!seller) {
        throw new AppError_1.default(404, 'Seller is Not Found!!');
    }
    const shop = yield shop_model_1.default.findOne({ sellerId: sellerId }).populate('sellerId');
    if (!shop) {
        throw new AppError_1.default(404, 'Shop Not Found!!');
    }
    return shop;
});
const getSingleShopQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield shop_model_1.default.findById(id).populate('sellerId');
    if (!shop) {
        throw new AppError_1.default(404, 'Shop Not Found!!');
    }
    return shop;
});
const shopVerifyByAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield shop_model_1.default.findById(id).populate('sellerId');
    if (!shop) {
        throw new AppError_1.default(404, 'Shop Not Found!!');
    }
    if (shop.status === 'verify') {
        throw new AppError_1.default(403, 'Shop already verified!!');
    }
    const verifyShop = yield shop_model_1.default.findOneAndUpdate({ _id: id }, { status: 'verify' }, {
        new: true
    });
    if (!verifyShop) {
        throw new AppError_1.default(403, 'Shop verify failed!!');
    }
    if (verifyShop) {
        const notificationData = {
            userId: shop.sellerId._id,
            message: 'Your Shop is verified now!!',
            type: 'success',
        };
        const notification = yield notification_service_1.notificationService.createNotification(notificationData);
        if (!notification) {
            throw new AppError_1.default(403, 'Notification create failed!!');
        }
    }
    return verifyShop;
});
const updateShopQuery = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('id', id);
    console.log('payload', payload);
    const result = yield shop_model_1.default.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    if (!result) {
        throw new AppError_1.default(404, 'Shop Not Found!!');
    }
    return result;
});
exports.shopService = {
    createShopService,
    getAllShopByAdminQuery,
    getShopBySellerQuery,
    updateShopQuery,
    shopVerifyByAdmin,
    getSingleShopQuery
};
