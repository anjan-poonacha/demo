"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const appError_1 = __importDefault(require("./utils/appError"));
const superAdminRouter_1 = __importDefault(require("./routes/superAdminRouter"));
const userAccountRouter_1 = __importDefault(require("./routes/userAccountRouter"));
const app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(cors_1.default({ origin: true }));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan_1.default('dev'));
}
app.use('/auth/api/v1/admins', superAdminRouter_1.default);
app.use('/auth/api/v1/users', userAccountRouter_1.default);
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(errorController_1.default);
exports.default = app;
