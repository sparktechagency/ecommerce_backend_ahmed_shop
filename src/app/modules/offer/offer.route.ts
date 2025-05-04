import express from 'express';
import { offerController } from './offer.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const offerRouter = express.Router();

offerRouter
  .post(
    '/add-offer',
    auth(USER_ROLE.SELLER),
    // validateRequest(videoValidation.VideoSchema),
    offerController.createOffer,
  )
  .get('/', auth(USER_ROLE.SELLER), offerController.getAllOffer)
  .get('/:id', offerController.getSingleOffer)
  .delete('/:id', auth(USER_ROLE.SELLER), offerController.deleteSingleOffer);

export default offerRouter;
