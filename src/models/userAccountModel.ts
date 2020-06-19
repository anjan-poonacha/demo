import crypto from 'crypto';
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
  Status,
} from '../utils/enums';
import AppError from '../utils/appError';
import { sendEmail } from '../utils/email';

export interface IUserAccount extends Document {
  email: string;
  role: string;
  facilityType: string;
  residentialAddress?: any;
  ministry: string;
  password: string | undefined;
  passwordConfirm: string | undefined;
  facilityArea: string;
  firstName: string;
  transferredBy: any;
  transferredAt: number;
  deactivatedBy: string;
  deactivatedAt: number;
  reactivatedBy: any;
  reactivatedAt: Date;
  status:
    | Status.ACTIVE
    | Status.DEACTIVATED
    | Status.INACTIVE
    | Status.DISABLED;
  facilityName: string;
  facilityId: string;
  passwordChangedAt: Date;
  OTPExpiresAt: Date | undefined;
  OTPToken: string | undefined;
  lastLoggedAt: Date | string;
  isFirstLogin: boolean | string;
  correctPassword: Function;
  createPasswordResetToken: () => string;
  passwordChangedAfter: (JWTTimeStamp: number) => boolean;
  // isActive: boolean;
  surname: string;
  postNames: string;
  nin: string;
}

export interface IFacility extends Document {
  label: string;
  code: string;
}
const facilitySchema = new mongoose.Schema<IFacility>({
  label: String,
  code: String,
});

export interface IAreaCode extends mongoose.Document {
  code: string;
  label: string;
}
const areaCodeSchema = new mongoose.Schema<IAreaCode>({
  code: String,
  label: String,
});

const addressSchema = new mongoose.Schema<IUserAccount>({
  village: areaCodeSchema,
  cell: areaCodeSchema,
  sector: areaCodeSchema,
  district: areaCodeSchema,
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
      values: [
        Status.ACTIVE,
        Status.INACTIVE,
        Status.DEACTIVATED,
        Status.DISABLED,
      ],
      message: `Status can only be ( ${Status.ACTIVE} | ${Status.DEACTIVATED} | ${Status.INACTIVE} | ${Status.DISABLED} )`,
    },
    default: Status.ACTIVE,
  },
  createdAt: { type: Date, default: Date.now },
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
  documentType: {
    type: String,
    // required: [true, 'Provide the id type']
  },
  documentNumber: {
    type: String,
    trim: true,
    // required: [true, 'Provide the id number']
  },
  role: {
    type: String,
    required: [true, 'Specify the role applying for.'],
    enum: {
      values: [Role.MA, Role.CR, Role.CRO, Role.NOTIFIER, Role.LAUNCHER],
      message: `Options for ( ${Role.MA} | ${Role.CR} | ${Role.CRO} | ${Role.NOTIFIER} | ${Role.LAUNCHER} )`,
    },
  },
  position: {
    type: String,
    // required: [true, 'Provide a position']
  },
  facilityName: {
    type: String,
    // required: [true, 'Provide a facilityName'],
  },
  facilityType: {
    type: String,
    enum: {
      values: [FacilityType.HF, FacilityType.COMMUNITY, FacilityType.EMBASSY],
      message: `facilityType options -> ( ${FacilityType.HF} | ${FacilityType.COMMUNITY} | ${FacilityType.EMBASSY} )`,
    },
    // required: [true, 'Provide a facilityType'],
  },
  facilityArea: {
    type: String,
    enum: {
      values: [
        FacilityArea.CELL,
        FacilityArea.SECTOR,
        FacilityArea.DISTRICT,
        FacilityArea.VILLAGE,
        FacilityArea.HF,
        FacilityArea.PROVINCE,
        FacilityArea.EMBASSY,
      ],
      message: `Facility type can be ( ${FacilityArea.HF} | ${FacilityArea.SECTOR} | ${FacilityArea.CELL} | ${FacilityArea.PROVINCE} | ${FacilityArea.DISTRICT} | ${FacilityArea.EMBASSY} | ${FacilityArea.VILLAGE})`,
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
  dateOfBirth: {
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
    // required: [true, 'Specify the marital status'],
    // Edit
    enum: {
      values: [
        MaritalStatus.DIVORCED,
        MaritalStatus.SINGLE,
        MaritalStatus.WIDOWED,
        MaritalStatus.OTHER,
        MaritalStatus.MARRIED,
      ],
      message: `maritalStatus can be ( ${MaritalStatus.DIVORCED} | ${MaritalStatus.SINGLE} | ${MaritalStatus.WIDOWED} | ${MaritalStatus.OTHER} | ${MaritalStatus.MARRIED} )`,
    },
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
    // required: [true, 'Provide the Residential Address'],
  },
  // profession: { type: String, required: true },
  // occupation: { type: String, required: true },
  isConditionsAgreed: {
    type: Boolean,
    // required: [true, 'Agree with all the conditions']
  },
  ministry: {
    type: String,
    // required: [true, 'Specify the ministry'],
    enum: {
      values: [Ministry.MINAFFET, Ministry.MINALOC, Ministry.MOH],
      message: `Role can be either "${Ministry.MINAFFET} / ${Ministry.MINALOC} / ${Ministry.MOH}"`,
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
    required: [true, 'Provide the password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [
      function(this: IUserAccount) {
        return this.password !== 'CRVS2020'; /* CRVS2020 use config variable */
      },
      'Provide the passwordConfirm',
    ],
    validate: {
      validator: function(this: IUserAccount, el: string) {
        return el === this.password;
      },
      message: `Passwords are not the same`,
    },
  },
  transferredAt: {
    type: Date,
  },
  transferredBy: JSON,
  deactivatedAt: {
    type: Date,
  },
  deactivatedAtBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  facilityId: {
    type: String,
    // required: [
    //   true,
    //   'Provide the facilityId (HF_ID | Cell_ID | Sector_ID | Province_ID | District_ID | Embassy_ID)',
    // ],
  },
  passwordChangedAt: Date,
  OTPExpiresAt: Date,
  OTPToken: String,
  lastLoggedAt: Date,
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  disabledAt: Date,
  disabledBy: mongoose.Schema.Types.ObjectId,
  activatedAt: Date,
  activatedBy: mongoose.Schema.Types.ObjectId,
  institutionName: String,
  nin: String,
  facilityCell: { type: facilitySchema },
  facilitySector: { type: facilitySchema },
  facilityCity: { type: facilitySchema },
  facilityState: { type: facilitySchema },
});

userAccountSchema.pre<IUserAccount>('save', function(next) {
  if (!this.isModified('transferredAt') && !this.isNew) return next();
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

userAccountSchema.pre<IUserAccount>('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userAccountSchema.methods.createPasswordResetToken = function() {
  const OTP = ('' + Math.random()).substring(2, 8);
  console.log(OTP);

  this.OTPToken = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');
  this.OTPExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return OTP;
};

userAccountSchema.methods.passwordChangedAfter = function(
  JWTTimeStamp: number,
) {
  if (this.passwordChanged) {
    const changedTimeStamp = this.passwordChanged.getTime() / 1000;

    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

userAccountSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string,
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

userAccountSchema.pre<IUserAccount>('save', async function(next) {
  if (this.isNew || !this.isModified('status')) {
    return next();
  }
  let data: {
    email: string;
    message: string;
    subject: string;
    user: { email: string };
    secret: string;
    [index: string]: any;
  } = {
    secret: process.env.SECRET_KEY_EMAIL as string,
    email: this.email,
    user: {
      email: this.email,
    },
    info: {
      id: this._id,
      status: this.status,
    },
    subject: '',
    message: '',
  };
  if (this.status === Status.ACTIVE) {
    data.subject = 'Your account is activated.';
    data.message = `Welcome back.
    Your account has been activated.`;
  }

  if (this.status === Status.DEACTIVATED) {
    data.subject = 'Your account is deactivated.';
    data.message = `Your account has been deactivated.
    Contact admin to reactivate the account`;
  }
  if (!data.user.email || !data.secret || !data.subject) {
    return next();
  }
  await sendEmail(data);

  next();
});

const UserAccount: Model<IUserAccount> = mongoose.model<IUserAccount>(
  'UserAccount',
  userAccountSchema,
);

export default UserAccount;
