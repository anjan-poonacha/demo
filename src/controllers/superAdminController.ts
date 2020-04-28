import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

import catchAsync from '../utils/catchAsync';
import SuperAdmin, { ISuperAdmin } from '../models/superAdminModel';
import { IUserAccount } from '../models/userAccountModel';
import AppError from '../utils/appError';

const signToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    (process.env as { JWT_SECRET: string }).JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

const createSendToken = (
  user: ISuperAdmin | IUserAccount,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user._id, user.role);

  // REMOVE THE PASSWORD FROM THE OUTPUT
  user.password = undefined;
  res.status(statusCode).json({
    status: 'SUCCESS',
    token,
    data: { user },
  });
};

export const createSuperAdmin = catchAsync(async (req: Request, res, next) => {
  if (!req.user) {
    return next(new AppError('Something went wrong, Not Authorized', 400));
  }

  const reqBody = { ...req.body };
  reqBody.createdBy = req.user._id;
  reqBody.createdAt = Date.now();

  const newUser = await SuperAdmin.create(reqBody);

  res.status(201).json({
    status: 'SUCCESS',
    data: {
      user: newUser,
    },
  });
});

export const signup = catchAsync(async (req, res, _) => {
  const {
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    phone,
  } = req.body;

  const newUser = await SuperAdmin.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    phone,
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string };
  //  1) Check if email and passwod exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await SuperAdmin.findOne({
    email,
    status: { $eq: 'active' },
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password!))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  // 3) If everything is OK, send token to client
  createSendToken(user, 200, res);
});
