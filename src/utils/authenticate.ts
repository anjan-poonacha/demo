import crypto from 'crypto';
import { promisify } from 'util';
import { Response, Request, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

import AppError from './appError';
import catchAsync from './catchAsync';
import SuperAdmin from '../models/superAdminModel';
import UserAccount, { IUserAccount } from '../models/userAccountModel';
import { Role } from './enums';
import { Schema } from 'mongoose';
import { sendEmail } from './email';

export const signToken = (
  id: Schema.Types.ObjectId,
  role: string,
  ministry: string,
  firstName: string,
  facilityType: string,
  facilityArea: string,
  facilityName: string,
  facilityId: string,
) => {
  return jwt.sign(
    {
      id,
      role,
      ministry,
      firstName,
      facilityArea,
      facilityType,
      facilityName,
      facilityId,
    },
    (process.env as { JWT_SECRET: string }).JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

export const createSendToken = (
  user: IUserAccount,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(
    user._id,
    user.role,
    user.ministry,
    user.firstName,
    user.facilityType,
    user.facilityArea,
    user.facilityName,
    user.facilityId,
  );

  // REMOVE THE PASSWORD FROM THE OUTPUT
  user.password = undefined;
  res.status(statusCode).json({
    status: 'SUCCESS',
    token,
  });
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403),
      );
    }
    next();
  };
};

export const protectResponse = catchAsync(async (req: Request, res, next) => {
  let token: string;
  const { headers } = req;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(
    token!,
    (process.env as { JWT_SECRET: string }).JWT_SECRET,
  );
  // console.log(decoded);

  // 3. Check if user still exists

  let currentUser;
  if ((decoded as { role: string }).role === Role.SA) {
    currentUser = await SuperAdmin.findById((decoded as { id: string }).id);
  } else {
    currentUser = await UserAccount.findById((decoded as { id: string }).id);
  }

  if (!currentUser || currentUser.status !== 'active') {
    return next(
      new AppError("The User belonging to this token doesn't exists", 401),
    );
  }

  if (currentUser.passwordChangedAfter((decoded as { iat: number }).iat)) {
    return next(
      new AppError(
        'User changed the password recently. Please login again!',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.status(200).json({
    status: 'SUCCESS',
    user: currentUser,
  });
  // next();
});

export const protect = catchAsync(async (req: Request, res, next) => {
  let token: string;
  const { headers } = req;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(
    token!,
    (process.env as { JWT_SECRET: string }).JWT_SECRET,
  );
  // console.log(decoded);

  // 3. Check if user still exists

  let currentUser;
  if ((decoded as { role: string }).role === Role.SA) {
    currentUser = await SuperAdmin.findById((decoded as { id: string }).id);
  } else {
    currentUser = await UserAccount.findById((decoded as { id: string }).id);
  }

  if (!currentUser || currentUser.status !== 'active') {
    return next(
      new AppError("The User belonging to this token doesn't exists", 401),
    );
  }

  if (currentUser.passwordChangedAfter((decoded as { iat: number }).iat)) {
    return next(
      new AppError(
        'User changed the password recently. Please login again!',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
});

export const updatePassword = catchAsync(async (req: Request, res, next) => {
  if (!req.user) {
    return next(new AppError('Something went wrong, Not Authenticated', 401));
  }
  const { email, currentPassword, newPassword, passwordConfirm } = req.body;
  const user = await UserAccount.findOne({ email }).select('+password');
  console.log(user!.password);
  if (!user) {
    return next(
      new AppError("Couldn't find the user with email " + email, 404),
    );
  }
  if (!(await user?.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Your password is wrong', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  const userNewPassword = await user.save();
  res.status(200).json({
    status: 'SUCCESS',
    data: {
      user: userNewPassword,
    },
  });
});

export const forgotPassword = catchAsync(async (req: Request, res, next) => {
  const { email } = req.body;
  const user = await UserAccount.findOne({ email });
  if (!user) {
    return next(
      new AppError(
        'There is no user associated with this email:_ ' + email,
        404,
      ),
    );
  }

  const resetOTP = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL =
    process.env.AUTH_SERVICE_HOST +
    ':' +
    process.env.AUTH_SERVICE_PORT +
    '/auth/api/v1/users/resetPassword';

  const message = `Forgot Password? Submit PATCH request with your new password and passwordConfirm to ${resetURL} with the OTP.\nYour One time password is valid for 10 minutes.\nOTP:${resetOTP}`;

  try {
    await sendEmail({
      secret: process.env.EMAIL_SECRETKEY,
      email: user.email,
      subject: `Your password reset token (Valid for 10 mins)`,
      message,
    });
    res
      .status(200)
      .json({ status: `SUCCESS`, message: `Your token is sent via email!` });
  } catch (err) {
    user.OTPToken = undefined;
    user.OTPExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was error trying to send an email. Try again later!',
        500,
      ),
    );
  }
});

export const resetPassword = catchAsync(async (req: Request, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.otp)
    .digest('hex');

  const user = await UserAccount.findOne({
    OTPToken: hashedToken,
    OTPExpiresAt: { $gt: new Date(Date.now()) },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 500));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.OTPToken = undefined;
  user.OTPExpiresAt = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
