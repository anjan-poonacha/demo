import express from 'express';

import * as userController from '../controllers/userAccountController';
import * as authController from '../utils/authenticate';
import { resetPasswordForce } from '../utils/resetPassword';
import { Role } from '../utils/enums';

const router = express.Router();

router.get(
  '/',
  authController.protect,
  authController.restrictTo(Role.SA, Role.MA),
  userController.getUsers,
);
router.get(
  '/id/:id',
  authController.protect,
  authController.restrictTo(Role.SA, Role.MA),
  userController.getUserById,
);
// Internal working
router.get('/userId/:id', userController.getUserById);

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
router.patch(
  '/useraccount/deactivate',
  authController.protect,
  userController.deactivateUserAccount,
);

router.get('/email/:email', userController.getUserAccount);

router.patch(
  '/useraccount/resetPassword',
  authController.protect,
  authController.restrictTo(Role.SA, Role.MA),
  resetPasswordForce,
);

export default router;
//
