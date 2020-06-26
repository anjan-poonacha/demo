import express from 'express';

import { signup, login, protect } from '../controllers/systemUserController';

const router = express.Router();

router.post('/claimToken', login);
router.post('/new', signup);
router.post('/protect', protect);

export default router;
