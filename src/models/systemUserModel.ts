import bcrypt from 'bcryptjs';
import mongoose, { Model, Schema } from 'mongoose';
import validator from 'validator';
import { Document } from 'mongoose';
import { Role } from '../utils/enums';

export interface ISystemUser extends Document {
  status: string;
  userId: string;
  role: string;
  password: string | undefined;
  passwordConfirm?: string;
  correctPassword: (
    inputPassword: string,
    expectedPassword: string,
  ) => Promise<boolean>;
}

const systemUserSchema = new mongoose.Schema<ISystemUser>({
  status: {
    type: String,
    enum: {
      values: ['active', 'deactivated', 'inactive'],
      message: 'Status can only be ( active | inactive | deactivated )',
    },
    default: 'active',
  },
  userId: { type: String, required: true },
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
  role: {
    type: String,
  },
  createdAt: { type: Date, default: new Date() },
});

systemUserSchema.pre<ISystemUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password!, 12);
  this.passwordConfirm = undefined;
});

systemUserSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string,
) {
  // userPassword -> password in the DB,
  //  candidatePassword -> to be verified
  return await bcrypt.compare(candidatePassword, userPassword);
};

const SystemUser: Model<ISystemUser> = mongoose.model<ISystemUser>(
  'SystemUser',
  systemUserSchema,
);

export default SystemUser;
