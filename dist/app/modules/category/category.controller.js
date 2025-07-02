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
exports.categoryController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const category_service_1 = require("./category.service");
const createCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit hoise');
    const uploadedFiles = req.files;
    const categoryData = req.body;
    console.log({ categoryData });
    console.log({ uploadedFiles });
    console.log(req.files);
    if (!uploadedFiles ||
        !uploadedFiles.image ||
        uploadedFiles.image.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Image is required');
    }
    categoryData.image = uploadedFiles.image[0].path.replace(/^public[\\/]/, '');
    console.log({ categoryData });
    const result = yield category_service_1.categoryService.createCategory(categoryData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Category create successful',
    });
}));
// const getAllCategory = catchAsync(async (req, res) => {
//   const result = await categoryService.getAllCategoryQuery(req.query);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     meta: result.meta,
//     data: result.result,
//     message: 'Category All are requered successful!!',
//   });
// });
const getAllCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.categoryService.getAllCategoryQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Category All are requered successful!!',
    });
}));
const getSingleCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.categoryService.getSingleCategory(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Category get successful',
    });
}));
const updateCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request received:', req.body, req.files);
    console.log('hit hoise');
    const categoryData = req.body;
    console.log({ categoryData });
    // Handle uploaded image if it exists
    const uploadedImage = req.files;
    console.log('uploadedImage11', uploadedImage);
    if ((uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.image) && uploadedImage.image.length > 0) {
        // Remove 'public/' or 'public\' from the start of the path
        categoryData.image = uploadedImage.image[0].path.replace(/^public[\\/]/, '');
    }
    console.log('uploadedImage', uploadedImage);
    console.log('category data=2', categoryData);
    console.log('id', req.params.id);
    // Call update service with updated data
    const result = yield category_service_1.categoryService.updateCategory(req.params.id, categoryData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Category updated successfully',
    });
}));
const categoryActiveDeactive = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { result, message } = yield category_service_1.categoryService.categoryActiveDeactiveService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: message,
    });
}));
const deletedCategory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_service_1.categoryService.deleteCategory(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'deleted successful',
    });
}));
exports.categoryController = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    categoryActiveDeactive,
    deletedCategory,
};
