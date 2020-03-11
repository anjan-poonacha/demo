import bcrypt from 'bcryptjs';
import mongoose, { Model } from 'mongoose';
import validator from 'validator';
import { Document } from 'mongoose';

export interface ISuperAdmin extends Document {
  role: string;
  password: string | undefined;
  passwordConfirm: string | undefined;
  correctPassword: Function;
}

const superAdminSchema = new mongoose.Schema<ISuperAdmin>({
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
    validate: [validator.isEmail, 'Provide a valid email']
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
      validator: function(el: string): boolean {
        return el === (this as { password: string }).password;
      },
      message: `Passwords are not the same`
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
  role: {
    type: String,
    default: 'superadmin'
  }
});

superAdminSchema.pre<ISuperAdmin>('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password!, 12);
  this.passwordConfirm = undefined;
});

superAdminSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>(
  'SuperAdmin',
  superAdminSchema
);

export default SuperAdmin;
