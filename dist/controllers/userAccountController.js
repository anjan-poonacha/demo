"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const userAccountModel_1 = __importDefault(require("../models/userAccountModel"));
const signToken = (id, role, ministry, firstName, facilityType, facilityArea) => {
    return jsonwebtoken_1.default.sign({ id, role, ministry, firstName, facilityArea, facilityType }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role, user.ministry, user.firstName, user.facilityType, user.facilityArea);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'SUCCESS',
        token
    });
};
exports.login = catchAsync_1.default(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default('Please provide a valid email and password', 400));
    }
    const user = await userAccountModel_1.default.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect username or password', 403));
    }
    createSendToken(user, 200, res);
});
exports.createUserAccount = catchAsync_1.default(async (req, res, next) => {
    const reqBody = { ...req.body };
    reqBody.approvedBy = req.user._id;
    reqBody.password = 'CRVS2020';
    const userAccount = await userAccountModel_1.default.create(reqBody);
    res.status(201).json({
        status: 'SUCCESS',
        data: {
            user: userAccount
        }
    });
});
exports.getUserAccount = catchAsync_1.default(async (req, res, next) => {
    const { email } = req.params;
    const user = await userAccountModel_1.default.findOne({ email });
    const exist = user ? true : false;
    res.status(200).json({
        status: 'SUCCESS',
        exist
    });
});
exports.statusCheck = (req, res, next) => {
    res.status(200).json({
        status: 'ACTIVE'
    });
};
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFYnBJZCI6IjI4IiwiRWJwTmFtZSI6IkNSVlNfUVQiLCJPdGsiOiJtU0tSQWxDTVNIakNkVEdZeHNQVWhLY213UWlXMldhdUJPZjArM052aDhDditUSVZSYjUxdUdSVTFDbHdOZTVYYldJTmhWcFhnU1N3WWlxT3h3ZXQzUT09IiwianRpIjoiMjhhZTZjYzMtNGVjMC00OGJlLTlkMmEtYjEzZDQ1NzgyNmFlIiwibmJmIjoxNTgyNzgxMTQwLCJleHAiOjE1ODI3OTU1NDAsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDI4Ni8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjQyODYvIn0.IgDl3Wml2Z5rJ10Oxm3GWYEt8DYkmR0v7uKYnZ72ryY';
exports.getCitizen = async (req, res, next) => {
    try {
        const { nid } = req.query;
        if (!nid) {
            throw new Error('No NID found in the request. Please pass a valid NID in the url params!');
        }
        axios_1.default
            .post('https://uat.nida.gov.rw:8081/onlineauthentication/getcitizen', {
            documentNumber: nid,
            keyPhrase: 'A-ABJ0yPnq8vyiH!m-yPTV-ELHi?kx31FmDcnvwMzP$19LK@4@$@2!$W-@6bSBE5Ch5nVEX6U2peZpL-_niqA8-LpXdsEv!_kgy2VwqApgs-W7?1A7cEspFKiv?_BFBy'
        }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${TOKEN}`
            }
        })
            .then((result) => {
            console.log({ data: result.data });
            res.status(200).json({ data: result.data });
        })
            .catch((err) => {
            console.log('Error : ' + err);
            console.log('Error : ' + err.toJSON());
        });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
};
//# sourceMappingURL=userAccountController.js.map