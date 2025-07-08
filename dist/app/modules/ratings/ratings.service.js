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
exports.reviewService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const ratings_model_1 = require("./ratings.model");
const createReviewService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield user_models_1.User.findById(payload.customerId);
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Customer not found!');
        }
        const seller = yield user_models_1.User.findById(payload.sellerId);
        if (!seller) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Seller not found!');
        }
        const result = yield ratings_model_1.Review.create(payload);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to add the review!!');
        }
        return result;
    }
    catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An unexpected error occurred while creating the review.');
    }
});
const getAllReviewByCustomerAndSellerQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    const updateUserId = user.role === 'customer' ? 'customerId' : 'sellerId';
    const reviewQuery = new QueryBuilder_1.default(ratings_model_1.Review.find({ [updateUserId]: userId }).populate('sellerId').populate('customerId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { meta, result };
});
const getSingleReviewQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield ratings_model_1.Review.findById(id);
    if (!review) {
        throw new AppError_1.default(404, 'Review Not Found!!');
    }
    const result = yield ratings_model_1.Review.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
        {
            $lookup: {
                from: "users",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "customerId",
                foreignField: "_id",
                as: "customer"
            }
        },
        {
            $project: {
                review: 1,
                rating: 1,
                customer: { $arrayElemAt: ["$customer", 0] },
                seller: { $arrayElemAt: ["$seller", 0] },
                createdAt: 1,
                updatedAt: 1
            },
        }
    ]);
    // console.log('single review', result);
    if (result.length === 0) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return result[0];
});
const updateReviewQuery = (id, payload, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id || !customerId) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const result = yield ratings_model_1.Review.findOneAndUpdate({ _id: id, customerId: customerId }, payload, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(404, 'Review Not Found or Unauthorized Access!');
    }
    return result;
});
const deletedReviewQuery = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id || !customerId) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const customer = yield user_models_1.User.findOne({ _id: id, customerId: customerId });
    if (!customer) {
        throw new AppError_1.default(404, 'You are not valid Customer for deleted this review!!');
    }
    const result = yield ratings_model_1.Review.findOneAndDelete({
        _id: id,
        customerId: customerId,
    });
    if (!result) {
        throw new AppError_1.default(404, 'Review Not Found!');
    }
    return result;
});
exports.reviewService = {
    createReviewService,
    getAllReviewByCustomerAndSellerQuery,
    getSingleReviewQuery,
    updateReviewQuery,
    deletedReviewQuery,
};
