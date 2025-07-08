import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { offerService } from './offer.service';

const createOffer = catchAsync(async (req, res) => {
  console.log('hit hoise');
  const {userId} = req.user;
  const offerData = req.body;
  offerData.sellerId = userId;
  offerData.offer = Number(offerData.offer);


  const result = await offerService.createOfferService(offerData);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer added successfully!',
    data: result,
  });
});

const getAllOffer = catchAsync(async (req, res) => {
    const {userId} = req.user;
  const { meta, result } = await offerService.getAllOfferQuery(req.query, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Offer are requered successful!!',
  });
});

const getSingleOffer = catchAsync(async (req, res) => {
  const result = await offerService.getSingleOfferQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Offer are requered successful!!',
  });
});

const deleteSingleOffer = catchAsync(async (req, res) => {
    const {userId} = req.user;
  const result = await offerService.deletedOfferQuery(req.params.id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Single Offer are successful!!',
  });
});

export const offerController = {
  createOffer,
  getAllOffer,
  getSingleOffer,
  deleteSingleOffer,
};
