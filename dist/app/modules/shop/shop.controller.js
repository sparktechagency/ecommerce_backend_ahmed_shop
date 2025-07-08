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
exports.shopController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const shop_service_1 = require("./shop.service");
const createShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit hoise');
    const { userId } = req.user;
    const shopData = req.body;
    shopData.sellerId = userId;
    const imageFiles = req.files;
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.image) && imageFiles.image.length > 0) {
        shopData.image = imageFiles.image[0].path.replace(/^public[\\/]/, '');
    }
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.document) && imageFiles.document.length > 0) {
        shopData.document = imageFiles.document[0].path.replace(/^public[\\/]/, '');
    }
    const result = yield shop_service_1.shopService.createShopService(shopData);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Shop added successfully!',
        data: result,
    });
}));
const getAllShopbyAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meta, result } = yield shop_service_1.shopService.getAllShopByAdminQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Shop by admin are requered successful!!',
    });
}));
const getShopBySeller = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield shop_service_1.shopService.getShopBySellerQuery(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: ' Seller Shop are requered successful!!',
    });
}));
const getSingleShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.getSingleShopQuery(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Shop are requered successful!!',
    });
}));
const verifySingleShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shop_service_1.shopService.shopVerifyByAdmin(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Verify Single Shop are successful!!',
    });
}));
const updateSingleShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const shopData = req.body;
    const imageFiles = req.files;
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.image) && imageFiles.image.length > 0) {
        shopData.image = imageFiles.image[0].path.replace(/^public[\\/]/, '');
    }
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.document) && imageFiles.document.length > 0) {
        shopData.document = imageFiles.document[0].path.replace(/^public[\\/]/, '');
    }
    const result = yield shop_service_1.shopService.updateShopQuery(req.params.id, shopData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Update Single Shop are successful!!',
    });
}));
exports.shopController = {
    createShop,
    getAllShopbyAdmin,
    getShopBySeller,
    verifySingleShop,
    getSingleShop,
    updateSingleShop
};
