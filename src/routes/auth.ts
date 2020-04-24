import { Router } from 'express';
import { signIn, signOut } from '../controllers/auth';
import { body } from '../middlewares/validation';
import { postSignInBodySchema } from '../validations/auth';
import { isAuth } from '../middlewares/isAuth';

const router = Router();

router.post('/sign-in', body(postSignInBodySchema), signIn);

router.post('/sign-out', isAuth, signOut);

export default router;
