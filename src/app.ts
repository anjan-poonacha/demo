import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import { Request, RequestHandler } from 'express';
import globalErrorHandler from './controllers/errorController';
import AppError from './utils/appError';
import superAdminRouter from './routes/superAdminRouter';
import userRouter from './routes/userAccountRouter';

const app = express();

// BODY PARSER

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  CORS
app.use(cors({ origin: true }));

// 1) GLOBAL MIDDLEWARE
// DEVELOPMENT LOGGING MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/auth/api/v1/admins', superAdminRouter);
app.use('/auth/api/v1/users', userRouter);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

export default app;
