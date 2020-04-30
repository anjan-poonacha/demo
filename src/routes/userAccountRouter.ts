import express from 'express';

import * as userController from '../controllers/userAccountController';
import * as authController from '../utils/authenticate';

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/id/:id', userController.getUserById);

router.get('/me', authController.protect, userController.getMe);

router.get('/statusCheck', userController.statusCheck);

router.get('/protect', authController.protectResponse);
router.post('/login', userController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.post(
  '/userAccount',
  authController.protect,
  userController.createUserAccount,
);

router.patch(
  '/userAccount',
  authController.protect,
  userController.updateUserAccount,
);

router.patch(
  '/useraccount/disable',
  authController.protect,
  userController.disableUserAccount,
);

router.get('/nid/getCitizen', userController.getCitizen);

router.get('/email/:email', userController.getUserAccount);

export default router;
//
