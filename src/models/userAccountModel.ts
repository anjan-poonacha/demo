import mongoose, { Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { Document } from 'mongoose';

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
}

const addressSchema = new mongoose.Schema<IUserAccount>({
  village: String,
  cell: String,
  sector: String,
  district: String
});

const residentialAddressSchema = new mongoose.Schema({
  rwanda: {
    type: addressSchema,
    required: true
  },
  abroad: {
    type: String,
    default: null
  }
});

const userAccountSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['approved', 'unapproved', 'rejected'],
    default: 'approved'
  },
  email: {
    type: String,
    // required: [true, 'Provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid email']
  },
  IDType: {
    type: String
    // required: [true, 'Provide the ID type']
  },
  IDNumber: {
    type: String
    // required: [true, 'Provide the ID number']
  },
  role: {
    type: String,
    required: [true, 'Specify the role applying for.'],
    enum: ['ministryAdmin', 'notifier', 'cr', 'cro']
  },
  occupiedPositon: {
    type: String
    // required: [true, 'Provide a occupied position']
  },
  facilityName: {
    type: String
    // required: [true, 'Provide a facilityName']
  },
  facilityType: {
    type: String,
    enum: {
      values: ['community', 'healthFacility', 'embassy', 'ministry'],
      message:
        'Facility type be ( community | healthFacility | embassy | ministry )'
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
    // required: [true, 'Provide a profile']
  },
  telephone: {
    type: String
    // required: [true, 'Provide a telephone number']
  },
  surname: {
    type: String
    // required: [true, 'Provide a Surname']
  },
  postNames: {
    type: String
  },
  nationality: {
    type: String
    // required: [true, 'Provide the nationality']
  },
  dob: {
    type: Date
    // required: [true, 'Give DOB in yyyy-mm-dd format']
  },

  sex: {
    type: String,
    // required: [true, 'Specify the gender / sex'],
    // edit
    enum: ['male', 'female', 'others']
  },
  martitialStatus: {
    type: String,
    // required: [true, 'Specify the martial status'],
    // Edit
    enum: ['married', 'single', 'others']
  },
  vitialStatus: {
    type: String,
    // required: [true, 'Specify the vital status'],
    // Edit
    enum: {
      values: ['alive', 'incapacitated'],
      message: 'vitialStatus should be either "alive" or "incapacitated"'
    }
  },
  domicileAddress: {
    type: addressSchema,
    default: ((this as unknown) as { residentialAddress: mongoose.Schema<any> })
      .residentialAddress
  },
  residentialAddress: {
    type: residentialAddressSchema,
    required: [true, 'Provide the Residential Address']
  },
  // profession: { type: String, required: true },
  // occupation: { type: String, required: true },
  isConditionsAgreed: {
    type: Boolean
    // required: [true, 'Agree with all the conditions']
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
    // not sure if it is working
    validate: {
      validator: function(el: string) {
        return validator.isMobilePhone(el, 'en-RW');
      },
      message: 'Enter a valid phone number'
    }
  },
  firstName: {
    type: String
    // required: [true, 'Please give a name']
  },
  lastName: {
    type: String
    // required: [true, 'Please give a name']
  },
  approvedOn: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId
    // required: true
  },
  password: {
    type: String,
    select: false
    // required:true
  }
});

userAccountSchema.pre<IUserAccount>('save', function(next) {
  if (
    this.facilityType === 'community' ||
    this.facilityType === 'healthFacility'
  ) {
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

userAccountSchema.pre<IUserAccount>('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password!, 12);
  this.passwordConfirm = undefined;
});

userAccountSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserAccount: Model<IUserAccount> = mongoose.model<IUserAccount>(
  'UserAccount',
  userAccountSchema
);

export default UserAccount;
