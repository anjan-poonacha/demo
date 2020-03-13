import express from 'express';

import * as userController from '../controllers/userAccountController';
import * as authController from '../utils/authenticate';

const router = express.Router();

router.get('/statusCheck', userController.statusCheck);

router.get('/protect', authController.protect);
router.post('/login', userController.login);

router.post(
  '/userAccount',
  authController.protectUserAccount,
  userController.createUserAccount,
);
router.get('/nid/getCitizen', userController.getCitizen);

router.get('/:email', userController.getUserAccount);

export default router;
