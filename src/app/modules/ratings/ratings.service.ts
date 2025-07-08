import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TReview } from './ratings.interface';
import { Review } from './ratings.model';
import { create } from 'domain';

const createReviewService = async (payload: TReview) => {
  try {
    const customer = await User.findById(payload.customerId);
    if (!customer) {
      throw new AppError(httpStatus.NOT_FOUND, 'Customer not found!');
    }
    const seller = await User.findById(payload.sellerId);
    if (!seller) {
      throw new AppError(httpStatus.NOT_FOUND, 'Seller not found!');
    }
   
    const result = await Review.create(payload);

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to add the review!!',
      );
    }

    return result;
  } catch (error) {
    console.error('Error creating review:', error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred while creating the review.',
    );
  }
};

const getAllReviewByCustomerAndSellerQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const updateUserId = user.role === 'customer' ? 'customerId' : 'sellerId';

  const reviewQuery = new QueryBuilder(
    Review.find({ [updateUserId]: userId }).populate('sellerId').populate('customerId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};

const getSingleReviewQuery = async (id: string) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(404, 'Review Not Found!!');
  }
  const result = await Review.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup:{
        from:"users",
        localField:"sellerId",
        foreignField:"_id",
        as:"seller"
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"customerId",
        foreignField:"_id",
        as:"customer"
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
    throw new AppError(404, 'Review not found!');
  }

  return result[0];
};

const updateReviewQuery = async (
  id: string,
  payload: Partial<TReview>,
  customerId: string,
) => {
  if (!id || !customerId) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const result = await Review.findOneAndUpdate(
    { _id: id, customerId: customerId },
    payload,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, 'Review Not Found or Unauthorized Access!');
  }
  return result;
};

const deletedReviewQuery = async (id: string, customerId: string) => {
  if (!id || !customerId) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const customer = await User.findOne({ _id: id, customerId: customerId });
  if (!customer) {
    throw new AppError(404, 'You are not valid Customer for deleted this review!!');
  }

  const result = await Review.findOneAndDelete({
    _id: id,
    customerId: customerId,
  });

  if (!result) {
    throw new AppError(404, 'Review Not Found!');
  }

  return result;
};

export const reviewService = {
  createReviewService,
  getAllReviewByCustomerAndSellerQuery,
  getSingleReviewQuery,
  updateReviewQuery,
  deletedReviewQuery,
};
