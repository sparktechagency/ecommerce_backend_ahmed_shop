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
exports.categoryService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const category_model_1 = require("./category.model");
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield category_model_1.Category.findOne({ name: payload.name });
    if (exist) {
        throw new AppError_1.default(400, 'Category already exist');
    }
    const result = yield category_model_1.Category.create(payload);
    return result;
});
const getAllCategoryQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('query==', query);
    // query.isActive = JSON.parse(query.isActive as string);
    // console.log('query==', query);
    const CategoryQuery = new QueryBuilder_1.default(category_model_1.Category.find({}), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield CategoryQuery.modelQuery;
    const meta = yield CategoryQuery.countTotal();
    return { meta, result };
});
const getSingleCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
    ]);
    mongoose_1.default;
    if (category.length === 0) {
        throw new AppError_1.default(404, 'Category not found!');
    }
    // Return the single category document
    return category[0];
});
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('id ', id);
    // console.log('payload ', payload);
    const category = yield category_model_1.Category.findById(id);
    if (!category) {
        throw new AppError_1.default(404, 'Category is not found!');
    }
    console.log({ payload });
    if (Object.keys(payload).length === 0) {
        throw new AppError_1.default(404, 'Payload is not found!');
    }
    const result = yield category_model_1.Category.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(500, 'Error deleting SaveStory!');
    }
    return result;
});
const categoryActiveDeactiveService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findById(id);
    if (!category) {
        throw new AppError_1.default(404, 'Category is not found!');
    }
    let status;
    if (category.isActive) {
        status = false;
    }
    else {
        status = true;
    }
    const result = yield category_model_1.Category.findByIdAndUpdate(id, { isActive: status }, { new: true });
    let message;
    if (result === null || result === void 0 ? void 0 : result.isActive) {
        message = 'Category actived successful';
    }
    else {
        message = 'Category deactive successful';
    }
    return { result, message };
});
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findById(id);
    if (!category) {
        throw new AppError_1.default(404, 'Category is not found!');
    }
    // Delete the SaveStory
    const result = yield category_model_1.Category.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(500, 'Error deleting SaveStory!');
    }
    return result;
});
exports.categoryService = {
    createCategory,
    getAllCategoryQuery,
    getSingleCategory,
    updateCategory,
    categoryActiveDeactiveService,
    deleteCategory,
};
