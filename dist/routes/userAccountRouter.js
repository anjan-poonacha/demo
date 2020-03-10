"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/userAccountController"));
const authController = __importStar(require("../utils/authenticate"));
const router = express_1.default.Router();
router.get('/statusCheck', userController.statusCheck);
router.get('/:email', userController.getUserAccount);
router.post('/login', userController.login);
router.post('/userAccount', userController.createUserAccount);
router.get('/nid/getCitizen', userController.getCitizen);
router.get('/protect', authController.protect);
exports.default = router;
