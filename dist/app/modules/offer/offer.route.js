"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offer_controller_1 = require("./offer.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const offerRouter = express_1.default.Router();
offerRouter
    .post('/add-offer', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), 
// validateRequest(videoValidation.VideoSchema),
offer_controller_1.offerController.createOffer)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), offer_controller_1.offerController.getAllOffer)
    .get('/:id', offer_controller_1.offerController.getSingleOffer)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.SELLER), offer_controller_1.offerController.deleteSingleOffer);
exports.default = offerRouter;
