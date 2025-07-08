"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const product_controller_1 = require("./product.controller");
const upload = (0, fileUpload_1.default)('./public/uploads/products');
const productRouter = express_1.default.Router();
productRouter
    .post('/create-product', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), upload.fields([{ name: 'images', maxCount: 5 }]), 
// validateRequest(videoValidation.VideoSchema),
product_controller_1.productController.createProduct)
    .get('/', product_controller_1.productController.getAllProduct)
    .get('/seller', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), product_controller_1.productController.getAllProductBySeller)
    .get('/best-selling', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), product_controller_1.productController.getBestSellingProduct)
    .get('/overview', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), product_controller_1.productController.getAllProductOverviewBySeller)
    .get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER, user_constants_1.USER_ROLE.SELLER), product_controller_1.productController.getSingleProduct)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), upload.fields([{ name: 'images', maxCount: 5 }]), product_controller_1.productController.updateSingleProduct)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), product_controller_1.productController.deleteSingleProduct);
exports.default = productRouter;
