"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const superAdminSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: [true, 'Give a First Name']
    },
    lastName: {
        type: String,
        required: [true, 'Give a Last Name']
    },
    email: {
        type: String,
        required: [true, 'Provide your email address'],
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: `Passwords are not the same`
        }
    },
    phone: {
        type: String,
        validate: {
            validator: function (el) {
                return validator_1.default.isMobilePhone(el, 'en-RW');
            },
            message: 'Enter a valid phone number'
        }
    },
    role: {
        type: String,
        default: 'superadmin'
    }
});
superAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    this.passwordConfirm = undefined;
});
superAdminSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcryptjs_1.default.compare(candidatePassword, userPassword);
};
const SuperAdmin = mongoose_1.default.model('SuperAdmin', superAdminSchema);
exports.default = SuperAdmin;
//# sourceMappingURL=superAdminModel.js.map