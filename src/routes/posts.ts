import { Router } from 'express';
import { isAuth } from '../middlewares/isAuth';
import {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  checkPostedByUser,
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

export default router;
