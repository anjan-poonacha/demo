import express from 'express';
import Token from '../models/tokenModel';
const router = express.Router();

router.get('/', (req, res, next) => {
  Token.find()
    .then(data => res.status(200).json({ status: 'SUCCESS', data }))
    .catch(next);
});

export default router;
