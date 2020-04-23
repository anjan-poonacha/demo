import express from 'express';

import * as superAdminController from '../controllers/superAdminController';
import * as authenticate from '../utils/authenticate';
import { Role } from '../utils/enums';

const router = express.Router();

router.post('/signin', superAdminController.login);
router.post('/signup', superAdminController.signup);
router.post(
  '/newaccount',
  authenticate.protect,
  authenticate.restrictTo(Role.SA),
  superAdminController.createSuperAdmin,
);

export default router;
