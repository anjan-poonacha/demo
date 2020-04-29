import { RequestHandler, Request } from 'express';
import axios, { AxiosError } from 'axios';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import UserAccount from '../models/userAccountModel';
import { createSendToken } from '../utils/authenticate';
import Token from '../models/tokenModel';

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //  1) Check if email and passwod exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await UserAccount.findOne({
    email,
    status: { $eq: 'active' },
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

    userAccount.status = 'deactivated';

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

  const user = await UserAccount.findOne({ email, status: { $eq: 'active' } });

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

// TODO Request the token from the Database and update the token

export const getCitizen: RequestHandler = async (req, res, next) => {
  try {
    const token = await Token.findOne();
    if (!token) {
      return next(
        new AppError(
          'Something went wrong, Token Not Found, Please try again later',
          404,
        ),
      );
    }
    const { nid } = req.query as { nid: string };
    if (!nid) {
      throw new Error(
        'No NID found in the request. Please pass a valid NID in the url params!',
      );
    }
    axios
      .post(
        'https://uat.nida.gov.rw:8081/onlineauthentication/getcitizen',
        {
          documentNumber: nid,
          keyPhrase:
            'A-ABJ0yPnq8vyiH!m-yPTV-ELHi?kx31FmDcnvwMzP$19LK@4@$@2!$W-@6bSBE5Ch5nVEX6U2peZpL-_niqA8-LpXdsEv!_kgy2VwqApgs-W7?1A7cEspFKiv?_BFBy',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token.token}`,
          },
        },
      )
      .then((result: { data: any }) => {
        console.log({ data: result.data });
        res.status(200).json({ data: result.data });
      })
      .catch((err: AxiosError) => {
        console.log('Error : ' + err);
        console.log('Error : ' + err.toJSON());
        res.status(400).send(err);
      });
  } catch (error) {
    console.log({ error });
    next(error);
  }
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
  const user = await UserAccount.findOne({ _id });
  res.status(200).json({
    status: 'SUCCESS',
    data: {
      user,
    },
  });
});
