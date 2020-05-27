import { RequestHandler, Request } from 'express';
import axios, { AxiosError } from 'axios';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import UserAccount from '../models/userAccountModel';
import { createSendToken } from '../utils/authenticate';
import { Status } from '../utils/enums';
import APIFeatures from '../utils/APIFeatures';

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //  1) Check if email and passwod exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await UserAccount.findOne({
    email,
    status: { $eq: Status.ACTIVE },
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 403));
  }

  // 3) If everything is OK, send token to client
  createSendToken(user, 200, res);
});

export const disableUserAccount = catchAsync(
  async (req: Request, res, next) => {
    if (!req.user) {
      return next(new AppError('Something went wrong, Not Authorized', 401));
    }

    const { application } = req.body;

    const userAccount = await UserAccount.findById(application.userId);

    if (!userAccount) {
      return next(
        new AppError(
          `Couldn\'t find the user with id ${application.userId}`,
          400,
        ),
      );
    }

    userAccount.status = Status.DISABLED;

    userAccount.deactivatedAt = Date.now();

    userAccount.deactivatedBy = req.user._id;

    const updatedUserAccount = await userAccount.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      status: 'SUCCESS',
      userAccount: updatedUserAccount,
    });
  },
);

export const deactivateUserAccount = catchAsync(
  async (req: Request, res, next) => {
    if (!req.user) {
      return next(new AppError('Something went wrong, Not Authorized', 401));
    }

    const { application } = req.body;

    const userAccount = await UserAccount.findById(application.userId);

    if (!userAccount) {
      return next(
        new AppError(
          `Couldn\'t find the user with id ${application.userId}`,
          400,
        ),
      );
    }

    userAccount.status = Status.DEACTIVATED;

    userAccount.deactivatedAt = Date.now();

    userAccount.deactivatedBy = req.user._id;

    const updatedUserAccount = await userAccount.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      status: 'SUCCESS',
      userAccount: updatedUserAccount,
    });
  },
);

export const updateUserAccount = catchAsync(async (req: Request, res, next) => {
  if (!req.user)
    return next(new AppError('Something went wrong, Not Authorized', 401));

  const { application } = req.body;

  const userAccount = await UserAccount.findById(application.createdBy);

  if (!userAccount) {
    return next(
      new AppError(
        `Couldn't find the user with id ${application.createdBy}`,
        400,
      ),
    );
  }

  userAccount.facilityArea = application.facilityAreaApplied;

  userAccount.facilityType = application.facilityTypeApplied;

  userAccount.transferredBy = req.user._id;
  userAccount.transferredAt = Date.now();

  const updatedUserAccount = await userAccount.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    status: 'SUCCESS',
    userAccount: updatedUserAccount,
  });
});

export const createUserAccount = catchAsync(async (req: Request, res, next) => {
  if (!req.user)
    return next(
      new AppError("Something went wrong, Couldn't find `req.user`", 401),
    );
  const { application } = req.body;
  application.status = 'active';
  application.approvedBy = req.user._id;
  application.password = 'CRVS2020';
  application.approvedAt = Date.now();

  // duplicate field bug
  application._id = undefined;

  const userAccount = await UserAccount.create(application);

  res.status(201).json({
    status: 'SUCCESS',
    userAccount,
  });
});

export const getUserAccount = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  const user = await UserAccount.findOne({
    email,
    status: { $eq: Status.ACTIVE },
  });

  const exist = user ? true : false;

  res.status(200).json({
    status: 'SUCCESS',
    exist,
  });
});

export const statusCheck: RequestHandler = (req, res, next) => {
  res.status(200).json({
    status: 'ACTIVE',
  });
};

export const getMe = catchAsync(async (req: Request, res, next) => {
  res.status(200).json({
    status: 'SUCCESS',
    data: {
      user: req.user,
    },
  });
});

export const getUserById = catchAsync(async (req: Request, res, next) => {
  const _id = req.params.id;
  const user = await UserAccount.findOne({ _id }).select('-password -__v');
  res.status(200).json({
    status: 'SUCCESS',
    data: {
      user,
    },
  });
});
export const getUsers = catchAsync(async (req: Request, res, next) => {
  const query = UserAccount.find().select('-password -__v');
  let features = new APIFeatures(query, req.query as any).filter();
  const count = await (await features.query).length;
  features = features
    .limitFields()
    .paginate()
    .sort();
  const user = await features.query;

  res.status(200).json({
    status: 'SUCCESS',
    count,
    data: {
      user,
    },
  });
});
