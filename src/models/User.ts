import { Schema, model, Document, Model } from 'mongoose';
import { Regexes } from '../utils/Regexes';
import { compare, hash } from 'bcryptjs';
import uuid from 'uuid/v4';

interface IUser {
  name: string;
  email: string;
  password: string;
  salt: string;
  verifyPassword: (password: string, salt: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: Regexes.email,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.statics.encryptPassword = async (
  password: string,
  salt: string,
): Promise<string> => {
  return hash(password, salt);
};

userSchema.statics.makeSalt = async (): Promise<string> => {
  return uuid();
};

userSchema.methods.verifyPassword = async function (
  password: string,
): Promise<boolean> {
  return compare(password, this.password);
};

interface IUserDocument extends Document, IUser {}

interface IUserModel extends Model<IUserDocument> {
  encryptPassword: (password: string) => Promise<string>;
  makeSalt: () => Promise<string>;
}

export const User = model<IUserDocument, IUserModel>('User', userSchema);
