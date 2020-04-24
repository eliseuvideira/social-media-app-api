import { Schema, model, Document, Model } from 'mongoose';
import { Regexes } from '../utils/Regexes';
import { compare, hash, genSalt } from 'bcryptjs';

interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  salt: string;
  verifyPassword: (password: string, salt: string) => Promise<boolean>;
  serialize: () => object;
}

const userSchema = new Schema<IUserDocument>(
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

userSchema.statics.makeSalt = (): Promise<string> => {
  return genSalt(12);
};

userSchema.methods.verifyPassword = async function (
  password: string,
): Promise<boolean> {
  return compare(password, this.password);
};

userSchema.methods.serialize = function (): object {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
  };
};

interface IUserModel extends Model<IUserDocument> {
  encryptPassword: (password: string, salt: string) => Promise<string>;
  makeSalt: () => Promise<string>;
}

export const User = model<IUserDocument, IUserModel>('User', userSchema);
