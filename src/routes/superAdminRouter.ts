import express from 'express';

import * as superAdminController from '../controllers/superAdminController';

const router = express.Router();

router.post('/signin', superAdminController.login);
router.post('/signup', superAdminController.signup);

export default router;
