import mongoose, { Model, mongo } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import {
  MaritalStatus,
  Role,
  Ministry,
  FacilityArea,
  FacilityType,
} from '../utils/enums';
import AppError from '../utils/appError';

export interface IUserAccount extends Document {
  role: string;
  facilityType: string;
  residentialAddress?: any;
  ministry: string;
  password: string | undefined;
  passwordConfirm: string | undefined;
  facilityArea: string;
  firstName: string;
  correctPassword: Function;
  transferredBy: string;
  transferredAt: number;
  deactivatedBy: string;
  deactivatedAt: number;
  status: string;
  facilityName: string;
  facilityId: string;
  // isActive: boolean;
}

const addressSchema = new mongoose.Schema<IUserAccount>({
  village: String,
  cell: String,
  sector: String,
  district: String,
});

const residentialAddressSchema = new mongoose.Schema({
  rwanda: {
    type: addressSchema,
    required: true,
  },
  abroad: {
    type: String,
    default: null,
  },
});

const userAccountSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: {
      values: ['active', 'deactivated', 'inactive'],
      message: 'Status can only be ( active | inactive | deactivated )',
    },
    default: 'active',
  },
  // isActive: {
  //   type: Boolean,
  //   default: true,
  // },
  email: {
    type: String,
    // required: [true, 'Provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid email'],
  },
  IDType: {
    type: String,
    // required: [true, 'Provide the ID type']
  },
  IDNumber: {
    type: String,
    // required: [true, 'Provide the ID number']
  },
  role: {
    type: String,
    required: [true, 'Specify the role applying for.'],
    enum: ['ministryAdmin', 'notifier', 'cr', 'cro'],
  },
  occupiedPositon: {
    type: String,
    // required: [true, 'Provide a occupied position']
  },
  facilityName: {
    type: String,
    // required: [true, 'Provide a facilityName']
  },
  facilityType: {
    type: String,
    enum: {
      values: ['community', 'healthFacility', 'embassy'],
      message:
        'Facility type be ( community | healthFacility | embassy | ministry )',
    },
  },
  facilityArea: {
    type: String,
    enum: {
      values: ['cell', 'sector', 'district'],
      message: 'Facility type be ( cell | sector | district )',
    },
    // required: [true, 'Provide the facilityArea'],
  },
  photo: {
    type: String,
    // required: [true, 'Provide a profile']
  },
  telephone: {
    type: String,
    // required: [true, 'Provide a telephone number']
  },
  surname: {
    type: String,
    // required: [true, 'Provide a Surname']
  },
  postNames: {
    type: String,
  },
  nationality: {
    type: String,
    // required: [true, 'Provide the nationality']
  },
  dob: {
    type: Date,
    // required: [true, 'Give DOB in yyyy-mm-dd format']
  },

  sex: {
    type: String,
    // required: [true, 'Specify the gender / sex'],
    // edit
    enum: ['male', 'female', 'others'],
  },
  maritalStatus: {
    type: String,
    enum: {
      values: [
        MaritalStatus.MARRIED,
        MaritalStatus.DIVORCED,
        MaritalStatus.OTHER,
        MaritalStatus.SINGLE,
        MaritalStatus.WIDOWED,
      ],
      message:
        "maritalStatus should be either 'single', 'married', 'widowed','divorced' or 'other' ",
    },

    // required: true
  },
  vitialStatus: {
    type: String,
    // required: [true, 'Specify the vital status'],
    // Edit
    enum: {
      values: ['alive', 'incapacitated'],
      message: 'vitialStatus should be either "alive" or "incapacitated"',
    },
  },
  domicileAddress: {
    type: addressSchema,
    default: ((this as unknown) as { residentialAddress: mongoose.Schema<any> })
      .residentialAddress,
  },
  residentialAddress: {
    type: residentialAddressSchema,
    required: [true, 'Provide the Residential Address'],
  },
  // profession: { type: String, required: true },
  // occupation: { type: String, required: true },
  isConditionsAgreed: {
    type: Boolean,
    // required: [true, 'Agree with all the conditions']
  },
  ministry: {
    type: String,
    required: [true, 'Specify the ministry'],
    enum: {
      values: [Ministry.MINAFFET, Ministry.MINALOC, Ministry.MOH],
      message: 'Role can be either "MOH / MINALOC / MINAFFET"',
    },
  },
  phone: {
    type: String,
    // not sure if it is working
    validate: {
      validator: function(el: string) {
        return validator.isMobilePhone(el, 'en-RW');
      },
      message: 'Enter a valid phone number',
    },
  },
  firstName: {
    type: String,
    // required: [true, 'Please give a name']
  },
  lastName: {
    type: String,
    // required: [true, 'Please give a name']
  },
  approvedAt: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true
  },
  password: {
    type: String,
    select: false,
    // required:true
  },
  transferredAt: {
    type: Date,
  },
  transferredBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  deactivatedAt: {
    type: Date,
  },
  deactivatedAtBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

userAccountSchema.pre<IUserAccount>('save', function(next) {
  if (this.isModified('transferredAt') || !this.isNew) return next();
  if (this.facilityType) {
    if (this.facilityType === FacilityType.HF) {
      this.ministry = Ministry.MOH;
    }
    if (this.facilityType === FacilityType.EMBASSY) {
      this.ministry = Ministry.MINAFFET;
    }
    if (this.facilityType === FacilityType.COMMUNITY) {
      this.ministry = Ministry.MINALOC;
    }
  } else if (this.facilityArea) {
    if (
      this.facilityArea === FacilityArea.CELL ||
      this.facilityArea === FacilityArea.SECTOR ||
      this.facilityArea === FacilityArea.DISTRICT
    ) {
      this.facilityType = FacilityType.COMMUNITY;
      this.ministry = Ministry.MINALOC;
    }
  } else {
    return next(new AppError('Provide facilityType or facilityArea', 400));
  }

  next();
});

userAccountSchema.pre<IUserAccount>('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password!, 12);
  this.passwordConfirm = undefined;
});

userAccountSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string,
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserAccount: Model<IUserAccount> = mongoose.model<IUserAccount>(
  'UserAccount',
  userAccountSchema,
);

export default UserAccount;
