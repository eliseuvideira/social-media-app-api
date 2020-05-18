import { RequestHandler } from 'express';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { bucket } from '../utils/storage';

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
    const hashedPassword = await User.encryptPassword(password);
    const user = new User({
      email,
      name,
      password: hashedPassword,
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

const removePhoto = async (filename: string): Promise<void> => {
  const bucketFile = bucket.file(filename);
  await bucketFile.delete();
};

const uploadPhoto = async (
  file: Express.Multer.File,
): Promise<{ url: string; filename: string; contentType: string }> => {
  const filename = Date.now() + file.originalname;
  const contentType = file.mimetype;
  const bucketFile = bucket.file(filename);
  const stream = bucketFile.createWriteStream({
    metadata: { contentType },
    resumable: false,
  });
  return new Promise<{ url: string; filename: string; contentType: string }>(
    (resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
      });
      stream.on('finish', () => {
        bucketFile.makePublic().then(() => {
          resolve({
            url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
            filename,
            contentType,
          });
        });
      });
      stream.end(file.buffer);
    },
  );
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
    const { name, email, password, about } = req.body;
    user.name = name;
    user.email = email;
    user.about = about;
    if (password) {
      const hashedPassword = await User.encryptPassword(password);
      user.password = hashedPassword;
    }
    if (req.file) {
      if (user.photo) {
        await removePhoto(user.photo.filename);
      }
      user.photo = await uploadPhoto(req.file);
    }
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
