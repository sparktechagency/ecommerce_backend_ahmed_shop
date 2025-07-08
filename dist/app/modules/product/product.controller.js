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
exports.productController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const product_service_1 = require("./product.service");
const product_model_1 = __importDefault(require("./product.model"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const createProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productData = req.body;
    const { userId } = req.user;
    productData.sellerId = userId;
    console.log('hit hoise');
    const isExist = yield product_model_1.default.findOne({
        name: productData.name,
        sellerId: productData.sellerId,
    });
    if (isExist) {
        throw new AppError_1.default(400, 'Product already exist !');
    }
    productData.availableStock = Number(productData.stock);
    productData.stock = Number(productData.stock);
    productData.price = Number(productData.price);
    const imageFiles = req.files;
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.images) && imageFiles.images.length > 0) {
        productData.images = imageFiles.images.map((file) => file.path.replace(/^public[\\/]/, ''));
    }
    console.log('productData', productData);
    const result = yield product_service_1.productService.createProductService(productData);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Product added successfully!',
        data: result,
    });
}));
const getAllProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meta, result } = yield product_service_1.productService.getAllProductQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Product are requered successful!!',
    });
}));
const getAllProductBySeller = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { meta, result } = yield product_service_1.productService.getAllProductBySellerQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Product are requered successful!!',
    });
}));
const getAllProductOverviewBySeller = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield product_service_1.productService.getAllProductOverviewBySellerQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Seller Overview are requered successful!!',
    });
}));
const getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield product_service_1.productService.getSingleProductQuery(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Product are requered successful!!',
    });
}));
const getBestSellingProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield product_service_1.productService.getBestSellingProductQuery(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Best Selling Product are requered successful!!',
    });
}));
const updateSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const updateData = req.body;
    let remainingUrl = (updateData === null || updateData === void 0 ? void 0 : updateData.remainingUrl) || null;
    const imageFiles = req.files;
    if ((imageFiles === null || imageFiles === void 0 ? void 0 : imageFiles.images) && imageFiles.images.length > 0) {
        updateData.images = imageFiles.images.map((file) => file.path.replace(/^public[\\/]/, ''));
    }
    if (remainingUrl) {
        if (!updateData.images) {
            updateData.images = [];
        }
        updateData.images = [...updateData.images, remainingUrl];
    }
    if (updateData.images && !remainingUrl) {
        updateData.images = [...updateData.images];
    }
    updateData.price = Number(updateData.price);
    updateData.availableStock = Number(updateData.availableStock);
    console.log('updateData', updateData);
    const result = yield product_service_1.productService.updateSingleProductQuery(id, updateData, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Product are updated successful!!',
    });
}));
const deleteSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield product_service_1.productService.deletedProductQuery(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Deleted Single Product are successful!!',
    });
}));
exports.productController = {
    createProduct,
    getAllProduct,
    getAllProductBySeller,
    getAllProductOverviewBySeller,
    getSingleProduct,
    getBestSellingProduct,
    updateSingleProduct,
    deleteSingleProduct,
};
