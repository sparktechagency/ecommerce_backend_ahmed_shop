import { Model } from 'mongoose';

import { USER_ROLE } from './user.constants';

interface IAddress {
  house: string;
  area: string;
  city: string;
  state: string;
  country: string;
}

export interface TUserCreate {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
  postal_code: string;
  state_code: string;
  city: string;
  address_line1: string;
  country_code: string;
  address_line2: string;
}

export interface TUser extends TUserCreate {
  _id: string;
  image: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  isUserActive(email: string): Promise<TUser>;
  IsUserExistById(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
