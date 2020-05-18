import { Schema, model, Document, Model } from 'mongoose';
import { REGEX_EMAIL } from '../utils/constants';
import { compare, hash } from 'bcryptjs';

interface IUser {
  name: string;
  email: string;
  password: string;
  verifyPassword: (password: string) => Promise<boolean>;
  serialize: () => object;
  createdAt: Date;
  updatedAt: Date;
  about?: string;
  photo?: {
    url: string;
    filename: string;
    contentType: string;
  };
}

interface IUserSerialized {
  _id: any;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  about?: string;
  photo?: {
    url: string;
    filename: string;
    contentType: string;
  };
}

const userSchema = new Schema<IUser & Document>(
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
      match: REGEX_EMAIL,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    photo: {
      type: {
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
  },
  { timestamps: true },
);

userSchema.statics.encryptPassword = async (
  password: string,
): Promise<string> => {
  return hash(password, 12);
};

userSchema.methods.verifyPassword = async function (
  password: string,
): Promise<boolean> {
  return compare(password, this.password);
};

userSchema.methods.serialize = function (): IUserSerialized {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    about: this.about,
    photo: this.photo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

interface IUserModel extends Model<IUser & Document> {
  encryptPassword: (password: string) => Promise<string>;
}

export const User = model<IUser & Document, IUserModel>('User', userSchema);
