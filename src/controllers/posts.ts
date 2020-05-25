import { RequestHandler } from 'express';
import { HttpError } from '../utils/HttpError';
import { Post, IPostDocument } from '../models/Post';
import { bucket } from '../utils/storage';
import { Types } from 'mongoose';
import { Comment } from '../models/Comment';

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('postedBy', '_id name email photo')
      .populate({
        path: 'comments',
        select: '_id content postedBy createdAt',
        populate: {
          path: 'postedBy',
          select: '_id name email photo',
        },
      })
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
      .populate({
        path: 'comments',
        select: '_id content postedBy createdAt',
        populate: {
          path: 'postedBy',
          select: '_id name email photo',
        },
      })
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

export const postComments: RequestHandler = async (req, res, next) => {
  try {
    if (!req.token) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { _id } = req.params;
    const post = await Post.findById(_id);
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    const { content } = req.body;
    const comment = new Comment({
      content,
      postedBy: Types.ObjectId(req.token.user._id),
    });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    await post
      .populate('comments', '_id content postedBy createdAt')
      .execPopulate();
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const { _id, commentId } = req.params;
    const post = await Post.findById(_id);
    if (!post) {
      throw new HttpError(404, 'Not found');
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new HttpError(404, 'Not found');
    }
    post.comments = post.comments.filter(
      (comment) => comment.toString() === comment._id.toString(),
    );
    await post.save();
    await comment.remove();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
