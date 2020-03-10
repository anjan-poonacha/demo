import express from 'express';

import * as userController from '../controllers/userAccountController';
import * as authController from '../utils/authenticate';

const router = express.Router();

router.get('/statusCheck', userController.statusCheck);

router.get('/:email', userController.getUserAccount);

router.post('/login', userController.login);
router.post('/userAccount', userController.createUserAccount);

router.get('/nid/getCitizen', userController.getCitizen);

router.get('/protect', authController.protect);

export default router;
