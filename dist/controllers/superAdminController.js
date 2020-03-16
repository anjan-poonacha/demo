"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const superAdminModel_1 = __importDefault(require("../models/superAdminModel"));
const appError_1 = __importDefault(require("../utils/appError"));
const signToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'SUCCESS',
        token,
        data: { user },
    });
};
exports.createSuperAdmin = catchAsync_1.default(async (req, res, next) => {
    if (!req.user) {
        return next(new appError_1.default('Something went wrong, Not Authorized', 400));
    }
    const reqBody = { ...req.body };
    reqBody.createdBy = req.user._id;
    reqBody.createdAt = Date.now();
    console.log(req);
    const newUser = await superAdminModel_1.default.create(reqBody);
    res.status(201).json({
        status: 'SUCCESS',
        data: {
            user: newUser,
        },
    });
});
exports.signup = catchAsync_1.default(async (req, res, _) => {
    const { firstName, lastName, email, password, passwordConfirm, phone, } = req.body;
    const newUser = await superAdminModel_1.default.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        phone,
    });
    createSendToken(newUser, 201, res);
});
exports.login = catchAsync_1.default(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default('Please provide a valid email and password', 400));
    }
    const user = await superAdminModel_1.default.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect username or password', 401));
    }
    createSendToken(user, 200, res);
});
//# sourceMappingURL=superAdminController.js.map