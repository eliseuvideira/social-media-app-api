import { RequestHandler } from 'express';
import { HttpError } from '../utils/HttpError';
import { Post, IPostDocument } from '../models/Post';
import { bucket } from '../utils/storage';
import { Types } from 'mongoose';

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('postedBy', '_id name email photo')
      .exec();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
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

export const createPost: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { content } = req.body;
    const post = new Post({ content });
    if (req.file) {
      post.photo = await uploadPhoto(req.file);
    }
    post.postedBy = Types.ObjectId(req.token.user._id);
    post.likes = [];
    post.comments = [];
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const post = await Post.findById(_id)
      .populate('postedBy', '_id name email photo')
      .exec();
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

export const checkPostedByUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    const post = await Post.findById(_id);
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    if (post.postedBy.toString() !== req.token.user._id) {
      throw new HttpError(403, 'Forbidden');
    }
    (req as any).post = post;
    next();
  } catch (err) {
    next(err);
  }
};

export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    const post: IPostDocument = (req as any).post;
    const { content } = req.body;
    post.content = content;
    await post.save();
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const post: IPostDocument = (req as any).post;
    await post.remove();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const likePost: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    const post = await Post.findById(_id);
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    if (
      !post.likes
        .map((userId) => userId.toString())
        .includes(req.token.user._id)
    ) {
      post.likes.push(Types.ObjectId(req.token.user._id));
    }
    await post.save();
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

export const dislikePost: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    const post = await Post.findById(_id);
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    const userId = req.token.user._id;
    post.likes = post.likes.filter((id) => id.toString() !== userId);
    await post.save();
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};
