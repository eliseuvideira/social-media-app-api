import { RequestHandler } from 'express';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { bucket } from '../utils/storage';
import { Types } from 'mongoose';
import { Post } from '../models/Post';

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('following', '_id name photo.url')
      .populate('followers', '_id name photo.url')
      .exec();
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
    const user = await User.findById(_id)
      .populate('following', '_id name photo.url')
      .populate('followers', '_id name photo.url')
      .exec();
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

export const userOnlyRoute: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    if (!req.token) {
      throw new HttpError(401, 'Unathorized');
    }
    if (req.token.user._id !== _id) {
      throw new HttpError(403, 'Forbidden');
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const putUser: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
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

export const getUserPhoto: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user || !user.photo) {
      throw new HttpError(404, 'Not found');
    }
    const bucketFile = bucket.file(user.photo.filename);
    const stream = bucketFile.createReadStream();
    stream.pipe(res.status(200));
  } catch (err) {
    next(err);
  }
};

const addFollowing = async (userId: any, following: any): Promise<void> => {
  await User.findByIdAndUpdate(Types.ObjectId(userId), {
    $push: { following: Types.ObjectId(following) },
  });
};

const addFollower = async (userId: any, follower: any): Promise<void> => {
  await User.findByIdAndUpdate(Types.ObjectId(userId), {
    $push: { followers: Types.ObjectId(follower) },
  });
};

export const followUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    if (_id === req.token.user._id) {
      throw new HttpError(403, 'Forbidden');
    }
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    await addFollower(_id, req.token.user._id);
    await addFollowing(req.token.user._id, _id);
    const foundUser = await User.findOne({ _id });
    if (!foundUser) {
      throw new Error(`Failed to fetch user '_id=${user._id}'`);
    }
    await foundUser.populate('followers', '_id name photo.url').execPopulate();
    await foundUser.populate('following', '_id name photo.url').execPopulate();
    res.status(200).json({ user: foundUser.serialize() });
  } catch (err) {
    next(err);
  }
};

const removeFollowing = async (userId: any, following: any): Promise<void> => {
  await User.findByIdAndUpdate(Types.ObjectId(userId), {
    $pull: { following: Types.ObjectId(following) },
  });
};

const removeFollower = async (userId: any, follower: any): Promise<void> => {
  await User.findByIdAndUpdate(Types.ObjectId(userId), {
    $pull: { followers: Types.ObjectId(follower) },
  });
};

export const unfollowUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    if (_id === req.token.user._id) {
      throw new HttpError(403, 'Forbidden');
    }
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    await removeFollower(_id, req.token.user._id);
    await removeFollowing(req.token.user._id, _id);
    const foundUser = await User.findOne({ _id: user._id })
      .populate('following', '_id name photo.url')
      .populate('followers', '_id name photo.url');
    if (!foundUser) {
      throw new Error(`Failed to fetch user '_id=${user._id}'`);
    }
    res.status(200).json({ user: foundUser.serialize() });
  } catch (err) {
    next(err);
  }
};

export const findPeople: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const user = await User.findById(req.token.user._id);
    if (!user) {
      throw new HttpError(401, 'Unauthorized');
    }
    const alreadyFollowing = user.following
      .map((follower) => follower._id)
      .concat(user._id);
    const users = await User.find({ _id: { $nin: alreadyFollowing } })
      .limit(10)
      .select('_id name email photo');
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUserPosts: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    const posts = await Post.find({ postedBy: Types.ObjectId(user._id) })
      .populate('comments.postedBy', '_id name email photo')
      .populate('postedBy', '_id name email photo')
      .exec();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

export const getUserFeed: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id);
    if (!user) {
      throw new HttpError(404, 'Not found');
    }
    const posts = await Post.find({
      postedBy: { $in: user.following },
    })
      .populate('comments.postedBy', '_id name email photo')
      .populate('postedBy', '_id name email photo')
      .sort('-created')
      .exec();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};
