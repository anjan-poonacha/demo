"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const jwt = __importStar(require("jsonwebtoken"));
const appError_1 = __importDefault(require("./appError"));
const catchAsync_1 = __importDefault(require("./catchAsync"));
const superAdminModel_1 = __importDefault(require("../models/superAdminModel"));
const userAccountModel_1 = __importDefault(require("../models/userAccountModel"));
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new appError_1.default('You dont have permission to perform this action', 403));
        }
        next();
    };
};
exports.protectResponse = catchAsync_1.default(async (req, res, next) => {
    let token;
    const { headers } = req;
    if (headers.authorization && headers.authorization.startsWith('Bearer')) {
        token = headers.authorization.split(' ')[1];
    }
    const decoded = await util_1.promisify(jwt.verify)(token, process.env.JWT_SECRET);
    let currentUser;
    if (decoded.role === 'superadmin') {
        currentUser = await superAdminModel_1.default.findById(decoded.id);
    }
    else {
        currentUser = await userAccountModel_1.default.findById(decoded.id);
    }
    if (!currentUser) {
        return next(new appError_1.default("The User belonging to this token doesn't exists", 401));
    }
    req.user = currentUser;
    res.status(200).json({
        status: 'SUCCESS',
        user: currentUser,
    });
});
exports.protect = catchAsync_1.default(async (req, res, next) => {
    let token;
    const { headers } = req;
    if (headers.authorization && headers.authorization.startsWith('Bearer')) {
        token = headers.authorization.split(' ')[1];
    }
    const decoded = await util_1.promisify(jwt.verify)(token, process.env.JWT_SECRET);
    let currentUser;
    if (decoded.role === 'superadmin') {
        currentUser = await superAdminModel_1.default.findById(decoded.id);
    }
    else {
        currentUser = await userAccountModel_1.default.findById(decoded.id);
    }
    if (!currentUser) {
        return next(new appError_1.default("The User belonging to this token doesn't exists", 401));
    }
    req.user = currentUser;
    next();
});
//# sourceMappingURL=authenticate.js.map