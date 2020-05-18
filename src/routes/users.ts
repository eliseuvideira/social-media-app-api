import { Router } from 'express';
import {
  getUsers,
  postUsers,
  getUser,
  putUser,
  deleteUser,
  getUserPhoto,
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
  putUser,
);

router.delete('/users/:_id', isAuth, params(getUserParamsSchema), deleteUser);

router.get('/users/:_id/photo', getUserPhoto);

export default router;
