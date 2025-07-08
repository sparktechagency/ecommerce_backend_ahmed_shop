"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const shop_controller_1 = require("./shop.controller");
const shopRouter = express_1.default.Router();
const upload = (0, fileUpload_1.default)('./public/uploads/shop');
shopRouter
    .post('/create-shop', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 },
]), 
// validateRequest(videoValidation.VideoSchema),
shop_controller_1.shopController.createShop)
    .get('/all-admin', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), shop_controller_1.shopController.getAllShopbyAdmin)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), shop_controller_1.shopController.getShopBySeller)
    .get('/:id', shop_controller_1.shopController.getSingleShop)
    .patch('/verify/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), shop_controller_1.shopController.verifySingleShop)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 },
]), shop_controller_1.shopController.updateSingleShop);
exports.default = shopRouter;
