"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const addressSchema = new mongoose_1.default.Schema({
    village: String,
    cell: String,
    sector: String,
    district: String
});
const residentialAddressSchema = new mongoose_1.default.Schema({
    rwanda: {
        type: addressSchema,
        required: true
    },
    abroad: {
        type: String,
        default: null
    }
});
const userAccountSchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        enum: ['approved', 'unapproved', 'rejected'],
        default: 'approved'
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Provide a valid email']
    },
    IDType: {
        type: String
    },
    IDNumber: {
        type: String
    },
    role: {
        type: String,
        required: [true, 'Specify the role applying for.'],
        enum: ['ministryAdmin', 'notifier', 'cr', 'cro']
    },
    occupiedPositon: {
        type: String
    },
    facilityName: {
        type: String
    },
    facilityType: {
        type: String,
        enum: {
            values: ['community', 'healthFacility', 'embassy', 'ministry'],
            message: 'Facility type be ( community | healthFacility | embassy | ministry )'
        }
    },
    facilityArea: {
        type: String,
        enum: {
            values: ['cell', 'sector', 'district'],
            message: 'Facility type be ( cell | sector | district )'
        }
    },
    photo: {
        type: String
    },
    telephone: {
        type: String
    },
    surname: {
        type: String
    },
    postNames: {
        type: String
    },
    nationality: {
        type: String
    },
    dob: {
        type: Date
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'others']
    },
    martitialStatus: {
        type: String,
        enum: ['married', 'single', 'others']
    },
    vitialStatus: {
        type: String,
        enum: {
            values: ['alive', 'incapacitated'],
            message: 'vitialStatus should be either "alive" or "incapacitated"'
        }
    },
    domicileAddress: {
        type: addressSchema,
        default: this
            .residentialAddress
    },
    residentialAddress: {
        type: residentialAddressSchema,
        required: [true, 'Provide the Residential Address']
    },
    isConditionsAgreed: {
        type: Boolean
    },
    ministry: {
        type: String,
        required: [true, 'Specify the ministry'],
        enum: {
            values: ['MOH', 'MINALOC', 'MINAFFET'],
            message: 'Role can be either "MOH / MINALOC / MINAFFET"'
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
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    approvedOn: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId
    },
    password: {
        type: String,
        select: false
    }
});
userAccountSchema.pre('save', function (next) {
    if (this.facilityType === 'community' ||
        this.facilityType === 'healthFacility') {
        this.ministry = 'MOH';
    }
    if (this.facilityType === 'embassy') {
        this.ministry = 'MINAFFET';
    }
    if (this.facilityType === 'ministry') {
        this.ministry = 'MINALOC';
    }
    next();
});
userAccountSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    this.passwordConfirm = undefined;
});
userAccountSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcryptjs_1.default.compare(candidatePassword, userPassword);
};
const UserAccount = mongoose_1.default.model('UserAccount', userAccountSchema);
exports.default = UserAccount;
