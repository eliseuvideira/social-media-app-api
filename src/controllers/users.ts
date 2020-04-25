import { RequestHandler } from 'express';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users: users.map((user) => user.serialize()) });
  } catch (err) {
    next(err);
  }
};

export const postUsers: RequestHandler = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const salt = await User.makeSalt();
    const hashedPassword = await User.encryptPassword(password, salt);
    const user = new User({
      email,
      name,
      password: hashedPassword,
      salt,
    });
    await user.save();
    res.status(201).json({ user: user.serialize() });
  } catch (err) {
    next(err);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    res.status(200).json({ user: user.serialize() });
  } catch (err) {
    next(err);
  }
};

export const putUser: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    if (!req.token) {
      throw new HttpError(401, 'Unathorized');
    }
    if (!req.token.user || req.token.user._id !== _id) {
      throw new HttpError(403, 'Forbidden');
    }
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    const { name } = req.body;
    user.name = name;
    await user.save();
    res.status(200).json({ user: user.serialize() });
  } catch (err) {
    next(err);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    if (!req.token) {
      throw new HttpError(401, 'Unathorized');
    }
    if (!req.token.user || req.token.user._id !== _id) {
      throw new HttpError(403, 'Forbidden');
    }
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    await user.remove();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
