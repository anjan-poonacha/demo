import catchAsync from './catchAsync';
import { Request } from 'express';
import UserAccount from '../models/userAccountModel';
import AppError from './appError';

export const resetPasswordForce = catchAsync(
  async (req: Request, res, next) => {
    const { email } = req.body as { email: string };

    const doc = await UserAccount.findOne({ email });
    if (!doc) {
      return next(
        new AppError("Couldn't find the user with email: " + email, 404),
      );
    }
    doc.password = 'CRVS2020';
    await doc.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'SUCCESS' });
  },
);
