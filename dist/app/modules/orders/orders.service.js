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
exports.orderService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const orders_model_1 = require("./orders.model");
const cart_model_1 = __importDefault(require("../cart/cart.model"));
const user_models_1 = require("../user/user.models");
const orderCreateService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('payload==', payload);
    const user = yield user_models_1.User.findById(payload.customerId);
    if (!user) {
        throw new AppError_1.default(400, 'Customer is not found!');
    }
    if (user.role !== 'customer') {
        throw new AppError_1.default(400, 'User is not authorized as a User!!');
    }
    const cartItems = yield cart_model_1.default.find({ customerId: payload.customerId });
    console.log(' cartItems==', cartItems);
    if (cartItems.length === 0) {
        throw new AppError_1.default(404, 'Cart items is not Found!!');
    }
    console.log('cartItems==', cartItems);
    const groupedOrders = {};
    cartItems.forEach((item) => {
        const sellerId = item.sellerId;
        if (!groupedOrders[sellerId]) {
            groupedOrders[sellerId] = [];
        }
        groupedOrders[sellerId].push(item);
    });
    console.log('groupedOrders==', groupedOrders);
    const separateOrders = Object.entries(groupedOrders).map(([sellerId, items]) => {
        return {
            sellerId,
            shopId: items[0].shopId,
            customerId: items[0].customerId,
            productList: items,
            totalAmount: items.reduce((sum, item) => sum + item.price, 0),
            orderDate: new Date(),
            status: 'completed',
            phone_number: payload.phone_number,
            zip_code: payload.zip_code,
            street_name: payload.street_name,
            state_code: payload.state_code,
            locality: payload.locality,
            house_number: payload.house_number,
            country: payload.country,
            address: payload.address,
            history: [
                {
                    status: 'completed',
                    date: new Date(),
                },
                {
                    status: 'recived',
                    date: '',
                },
                {
                    status: 'ongoing',
                    date: '',
                },
                {
                    status: 'delivery',
                    date: '',
                },
                {
                    status: 'finished',
                    date: '',
                },
            ]
        };
    });
    console.log('separateOrders', separateOrders);
    const order = yield orders_model_1.Order.create(separateOrders);
    console.log('order created', order);
    const cartDeleteData = yield cart_model_1.default.deleteMany({
        customerId: payload.customerId,
    });
    if (!cartDeleteData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Cart deleted Failed!!');
    }
    return order;
});
const getAllOrderByCustomerAndSellerQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User is not found!');
    }
    const updateRole = user.role === 'customer' ? 'customerId' : 'sellerId';
    const OrderQuery = new QueryBuilder_1.default(orders_model_1.Order.find({ [updateRole]: userId }).populate('productList.productId'), query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield OrderQuery.modelQuery;
    const meta = yield OrderQuery.countTotal();
    return { meta, result };
});
const getSingleOrderQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield orders_model_1.Order.findById(id).populate('productList.productId');
    if (!order) {
        throw new AppError_1.default(404, 'Order Not Found!!');
    }
    return order;
});
const updateSingleOrderStatusQuery = (id, status, sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const orderProduct = yield orders_model_1.Order.findById(id);
    if (!orderProduct) {
        throw new AppError_1.default(404, 'Order Product is not found!');
    }
    const seller = yield user_models_1.User.findById(sellerId);
    if (!seller) {
        throw new AppError_1.default(404, 'Seller User is not found!');
    }
    if (orderProduct.sellerId.toString() !== sellerId.toString()) {
        throw new AppError_1.default(404, 'You are not valid Seller for update this order!!');
    }
    const statusSequence = {
        completed: ['recived', 'cancelled'],
        recived: ['ongoing'],
        ongoing: ['delivery'],
        delivery: ['finished'],
    };
    const currentStatus = orderProduct.status;
    if (!((_a = statusSequence[currentStatus]) === null || _a === void 0 ? void 0 : _a.includes(status))) {
        throw new AppError_1.default(400, `Invalid status update! You cannot change the status from ${currentStatus} to ${status}.`);
    }
    const updateHistory = orderProduct.history.find((oldHis) => oldHis.status === status);
    if (updateHistory) {
        updateHistory.date = new Date();
    }
    orderProduct.status = status;
    yield orderProduct.save();
    return orderProduct;
});
const deletedOrderQuery = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const customer = yield user_models_1.User.findById(customerId);
    if (!customer) {
        throw new AppError_1.default(404, 'Customer Not Found!!');
    }
    const order = yield orders_model_1.Order.findById(id);
    if (!order) {
        throw new AppError_1.default(404, 'Order Not Found!!');
    }
    if (order.customerId.toString() !== customerId.toString()) {
        throw new AppError_1.default(404, 'You are not valid Customer for deleted this order!!');
    }
    const result = yield orders_model_1.Order.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(404, 'Failed to delete order!');
    }
    return result;
});
exports.orderService = {
    orderCreateService,
    getAllOrderByCustomerAndSellerQuery,
    getSingleOrderQuery,
    updateSingleOrderStatusQuery,
    deletedOrderQuery,
};
