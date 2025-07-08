"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/category');
const categoryRoutes = (0, express_1.Router)();
categoryRoutes
    .post('/create-category', 
// auth(USER_ROLE.ADMIN),
upload.fields([{ name: 'image' }]), 
// upload.single('image'),
//   validateRequest(paymnetValidation),
category_controller_1.categoryController.createCategory)
    .get('', category_controller_1.categoryController.getAllCategory)
    .get('/:id', category_controller_1.categoryController.getSingleCategory)
    .patch('/:id', 
// auth(USER_ROLE.ADMIN),
// upload.fields([{ name: 'image' }]),
upload.fields([{ name: 'image', maxCount: 1 }]), category_controller_1.categoryController.updateCategory)
    .patch('/isActive/:id', 
// auth(USER_ROLE.ADMIN),
category_controller_1.categoryController.categoryActiveDeactive)
    .delete('/:id', 
//  auth(USER_ROLE.ADMIN),
category_controller_1.categoryController.deletedCategory);
exports.default = categoryRoutes;
