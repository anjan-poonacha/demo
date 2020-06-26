import SystemUser, { ISystemUser } from '../models/systemUserModel';
import catchAsync from '../utils/catchAsync';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { promisify } from 'util';

const signToken = (userId: string, role: string, status: string) => {
  return jwt.sign(
    { userId, role, status },
    (process.env as { JWT_SECRET: string }).JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

const createSendToken = (
  user: ISystemUser,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.userId, user.role, user.status);

  // REMOVE THE PASSWORD FROM THE OUTPUT
  user.password = undefined;
  res.status(statusCode).json({
    status: 'SUCCESS',
    token,
  });
};

export const signup = catchAsync(async (req, res, _) => {
  const { userId, password, passwordConfirm } = req.body;

  const newUser = await SystemUser.create({
    userId,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { userId, password } = req.body as { userId: string; password: string };
  //  1) Check if userId and passwod exist
  if (!userId || !password) {
    return next(
      new AppError('Please provide a valid userId and password', 400),
    );
  }

  // 2) Check if user exists && password is correct
  const user = await SystemUser.findOne({
    userId,
    status: { $eq: 'active' },
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password!))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  // 3) If everything is OK, send token to client
  createSendToken(user, 200, res);
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

  // 3. Check if user still exists
  let currentUser;
  currentUser = await SystemUser.findOne({
    userId: (decoded as { userId: string }).userId,
  });

  if (!currentUser || currentUser.status !== 'active') {
    return next(
      new AppError("The User belonging to this token doesn't exists", 401),
    );
  }
  res.status(200).json({
    status: 'SUCCESS',
    user: currentUser,
  });
});
