import { Router } from 'express';
import { getStatus } from '../controllers/status';
import { query } from '../middlewares/validation';
import { getStatusQuerySchema } from '../validations/status';

const router = Router();

router.get('/status', query(getStatusQuerySchema), getStatus);

export default router;
