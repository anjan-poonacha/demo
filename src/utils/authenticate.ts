import { promisify } from 'util';
import { Response, Request, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

import AppError from './appError';
import catchAsync from './catchAsync';
import SuperAdmin, { ISuperAdmin } from '../models/superAdminModel';
import UserAccount, { IUserAccount } from '../models/userAccountModel';

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403)
      );
    }
    next();
  };
};

declare module 'express' {
  export interface Request {
    user?: any;
  }
}

export interface IUserRequest extends Request {
  user?: any;
}

export const protect = catchAsync(async (req: IUserRequest, res, next) => {
  let token;
  const { headers } = req;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Token not found', 401));
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    (process.env as { JWT_SECRET: string }).JWT_SECRET
  );
  // console.log(decoded);

  // 3. Check if user still exists

  let currentUser;
  if ((decoded as { role: string }).role === 'superadmin') {
    currentUser = await SuperAdmin.findById((decoded as { id: string }).id);
  } else {
    currentUser = await UserAccount.findById((decoded as { id: string }).id);
  }

  if (!currentUser) {
    return next(
      new AppError("The User belonging to this token doesn't exists", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.status(200).json({
    user: currentUser
  });
  // next();
});
