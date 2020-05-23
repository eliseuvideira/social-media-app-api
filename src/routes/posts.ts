import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  checkPostedByUser,
  likePost,
  dislikePost,
} from '../controllers/posts';
import { body, params } from '../middlewares/validation';
import {
  createPostBodySchema,
  getPostParamsSchema,
  updatePostBodySchema,
} from '../validations/posts';

const router = Router();

router.get('/posts', isAuth, getPosts);

router.post('/posts', isAuth, body(createPostBodySchema), createPost);

router.get('/posts/:_id', isAuth, params(getPostParamsSchema), getPost);

router.put(
  '/posts/:_id',
  isAuth,
  params(getPostParamsSchema),
  body(updatePostBodySchema),
  checkPostedByUser,
  updatePost,
);

router.delete(
  '/posts/:_id',
  isAuth,
  params(getPostParamsSchema),
  checkPostedByUser,
  deletePost,
);

router.post('/posts/:_id/like', isAuth, params(getPostParamsSchema), likePost);

router.post(
  '/posts/:_id/dislike',
  isAuth,
  params(getPostParamsSchema),
  dislikePost,
);

export default router;
