import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { TPickupAddress } from './pickupAddress.interface';
import PickupAddress from './pickupAddress.model';

const addPickupAddress = async (
  data: Partial<TPickupAddress>,
): Promise<TPickupAddress> => {
  const existingPickaddPickupAddress = await PickupAddress.findOne({});
  if (existingPickaddPickupAddress) {
    return existingPickaddPickupAddress;
  } else {
    const result = await PickupAddress.create(data);

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to add music');
    }
    return result;
  }
};

const getPickaddPickupAddress = async (
  title?: keyof TPickupAddress,
): Promise<{ content?: string } | TPickupAddress | null> => {
  const PickaddPickupAddress = await PickupAddress.findOne().select(title as string);

  if (title) {
    return { content: PickaddPickupAddress ? PickaddPickupAddress[title] : undefined }; // Check if PickaddPickupAddress exists
  } else {
    return PickaddPickupAddress;
  }
};

// Function to update PickaddPickupAddress without needing an ID
const updatePickaddPickupAddress = async (
  PickaddPickupAddressBody: Partial<TPickupAddress>,
): Promise<TPickupAddress | null> => {
  // Find the existing PickaddPickupAddress document and update it
  const PickaddPickupAddress = await PickupAddress.findOneAndUpdate({}, PickaddPickupAddressBody, {
    new: true,
  });

  return PickaddPickupAddress;
};

export const pickupAddressService = {
  addPickupAddress,
  updatePickaddPickupAddress,
  getPickaddPickupAddress,
};
