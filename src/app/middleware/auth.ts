import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../error/AppError';
import config from '../config/index';
import { User } from '../modules/user/user.models';
import { verifyToken } from '../utils/tokenManage';
import { NextFunction, Request, Response } from 'express';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req:Request, res:Response, next:NextFunction) => {
    const token = req?.headers?.authorization?.split(' ')[1];                 
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
    }

    const decodeData = verifyToken({
      token,
      access_secret: config.jwt_access_secret as string,
    });

    const { role, userId } = decodeData;
    const isUserExist = await User.IsUserExistById(userId);

    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'user not found');
    }

    if (userRoles && !userRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    req.user = decodeData;
    next();
  });
};

export default auth;
