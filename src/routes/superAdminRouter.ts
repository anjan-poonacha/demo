import express from 'express';

import * as superAdminController from '../controllers/superAdminController';
import * as authenticate from '../utils/authenticate';

const router = express.Router();

router.post('/signin', superAdminController.login);
router.post('/signup', superAdminController.signup);
router.post(
  '/newaccount',
  authenticate.protect,
  authenticate.restrictTo('superadmin'),
  superAdminController.createSuperAdmin,
);

export default router;
