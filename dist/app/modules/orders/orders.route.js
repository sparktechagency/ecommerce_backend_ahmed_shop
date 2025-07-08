"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const orders_controller_1 = require("./orders.controller");
const orderRouter = express_1.default.Router();
orderRouter
    .post('/create-order', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), orders_controller_1.orderController.createOrder)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER, user_constants_1.USER_ROLE.SELLER), orders_controller_1.orderController.getAllOrderByCustomerAndSeller)
    .get('/:id', orders_controller_1.orderController.getSingleOrder)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), orders_controller_1.orderController.updateSingleOrderStatus)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), orders_controller_1.orderController.deleteSingleOrder);
exports.default = orderRouter;
