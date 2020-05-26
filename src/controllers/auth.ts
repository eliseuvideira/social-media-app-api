import { RequestHandler } from 'express';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { sign } from 'jsonwebtoken';

let key: Buffer | null = null;
const getPrivateKey = async (): Promise<Buffer> => {
  if (!key) {
    if (!process.env.JWT_PRIVATE_KEY) {
      throw new Error('environment variable "JWT_PRIVATE_KEY" not set');
    }
    key = Buffer.from(process.env.JWT_PRIVATE_KEY, 'utf-8');
  }
  return key;
};

export const signIn: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      throw new HttpError(401, 'Invalid credentials');
    }
    const privateKey = await getPrivateKey();
    const token = sign({ user: user.serialize() }, privateKey, {
      algorithm: 'RS256',
    });
    res.cookie('token', token, { maxAge: 10 * 60 * 1000 });
    res.status(200).json({
      token,
      user: user.serialize(),
    });
  } catch (err) {
    next(err);
  }
};

export const signOut: RequestHandler = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
