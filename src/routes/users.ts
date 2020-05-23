import { Router } from 'express';
import {
  getUsers,
  postUsers,
  getUser,
  putUser,
  deleteUser,
  getUserPhoto,
  followUser,
  unfollowUser,
  findPeople,
  userOnlyRoute,
  getUserPosts,
  getUserFeed,
} from '../controllers/users';
import { body, params } from '../middlewares/validation';
import {
  postUsersBodySchema,
  getUserParamsSchema,
  putUserBodySchema,
} from '../validations/users';
import { isAuth } from '../middlewares/isAuth';
import { multer } from '../middlewares/multer';

const router = Router();

router.get('/users', getUsers);

router.post('/users', body(postUsersBodySchema), postUsers);

router.get('/users/:_id', isAuth, params(getUserParamsSchema), getUser);

router.put(
  '/users/:_id',
  isAuth,
  multer.single('photo'),
  params(getUserParamsSchema),
  body(putUserBodySchema),
  userOnlyRoute,
  putUser,
);

router.delete(
  '/users/:_id',
  isAuth,
  params(getUserParamsSchema),
  userOnlyRoute,
  deleteUser,
);

router.get('/users/:_id/photo', getUserPhoto);

router.post('/users/:_id/follow', isAuth, followUser);

router.post('/users/:_id/unfollow', isAuth, unfollowUser);

router.get('/users/:_id/find-people', isAuth, findPeople);

router.get('/users/:_id/posts', isAuth, getUserPosts);

router.get('/users/:_id/feed', isAuth, getUserFeed);

export default router;
