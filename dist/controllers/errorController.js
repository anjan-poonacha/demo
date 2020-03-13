"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const handleJWTError = () => new appError_1.default('Invalid Token. Please login again.', 401);
const handleJWTExpiredError = () => new appError_1.default('Invalid Token. Please login again.', 401);
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new appError_1.default(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const message = `Can't have duplicate field of ${value[0]}. Please choose another field.`;
    return new appError_1.default(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new appError_1.default(message, 400);
};
const sendErrorDev = (err, req, res) => {
    console.error(err);
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err: err,
        stack: err.stack,
    });
};
const sendErrorProd = (err, req, res) => {
    if (err.isOperational) {
        console.error(err);
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'ERROR',
        message: `Something went wrong!`,
    });
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = `${err.statusCode}`.startsWith('4') ? 'FAIL' : 'ERROR';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }
};
exports.default = errorHandler;
//# sourceMappingURL=errorController.js.map