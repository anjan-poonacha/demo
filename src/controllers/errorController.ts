import AppError from '../utils/appError';
import { ErrorRequestHandler, Request, Response } from 'express';
import { CastError, Error } from 'mongoose';

interface SendError {
  (err: AppError, req: Request, res: Response): Response;
}

const handleJWTError = () =>
  new AppError('Invalid Token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Invalid Token. Please login again.', 401);

const handleCastErrorDB = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err: unknown) => {
  const value = (err as { errmsg: string }).errmsg.match(/(["'])(\\?.)*?\1/);

  const message = `Can't have duplicate field of ${
    value![0]
  }. Please choose another field.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev: SendError = (err, req, res) => {
  console.error(err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const sendErrorProd: SendError = (err, req, res) => {
  if (err.isOperational) {
    console.error(err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // LOG THE ERROR IN THE PLATFORM
  console.error('ERROR 💥', err);

  return res.status(500).json({
    status: 'ERROR',
    message: `Something went wrong!`,
  });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'FAIL' : 'ERROR';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;
