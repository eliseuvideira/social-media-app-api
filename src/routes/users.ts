import { Router } from 'express';
import {
  getUsers,
  postUsers,
  getUser,
  putUser,
  deleteUser,
} from '../controllers/users';
import { body, params } from '../middlewares/validation';
import {
  postUsersBodySchema,
  getUserParamsSchema,
  putUserBodySchema,
} from '../validations/users';

const router = Router();

router.get('/users', getUsers);

router.post('/users', body(postUsersBodySchema), postUsers);

router.get('/users/:_id', params(getUserParamsSchema), getUser);

router.put(
  '/users/:_id',
  params(getUserParamsSchema),
  body(putUserBodySchema),
  putUser,
);

router.delete('/users/:_id', params(getUserParamsSchema), deleteUser);

export default router;
