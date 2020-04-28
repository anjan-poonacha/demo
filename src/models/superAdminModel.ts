import bcrypt from 'bcryptjs';
import mongoose, { Model, Schema } from 'mongoose';
import validator from 'validator';
import { Document } from 'mongoose';
import { Role } from '../utils/enums';

export interface ISuperAdmin extends Document {
  status: string;
  role: string;
  password: string;
  passwordConfirm?: string;
  passwordChanged: Date;
  lastLoggedAt: Date | string;
  correctPassword: (
    inputPassword: string,
    expectedPassword: string,
  ) => Promise<boolean>;

  passwordChangedAfter: (JWTTimeStamp: number) => boolean;
}

const superAdminSchema = new mongoose.Schema<ISuperAdmin>({
  status: {
    type: String,
    enum: {
      values: ['active', 'deactivated', 'inactive'],
      message: 'Status can only be ( active | inactive | deactivated )',
    },
    default: 'active',
  },
  firstName: {
    type: String,
    required: [true, 'Give a First Name'],
  },

  lastName: {
    type: String,
    required: [true, 'Give a Last Name'],
  },
  email: {
    type: String,
    required: [true, 'Provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid email'],
  },

  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm your password'],
    validate: {
      validator: function(el: string): boolean {
        return el === (this as { password: string }).password;
      },
      message: `Passwords are not the same`,
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
  role: {
    type: String,
    default: Role.SA,
  },
  createdBy: Schema.Types.ObjectId,
  createdAt: Date,
  passwordChanged: Date,
  lastLoggedAt: Date,
});

superAdminSchema.pre<ISuperAdmin>('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password!, 12);
  this.passwordConfirm = undefined;
});

superAdminSchema.methods.passwordChangedAfter = function(JWTTimeStamp: number) {
  if (this.passwordChanged) {
    const changedTimeStamp = this.passwordChanged.getTime() / 1000;

    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

superAdminSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string,
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>(
  'SuperAdmin',
  superAdminSchema,
);

export default SuperAdmin;
