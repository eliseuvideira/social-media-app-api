import Joi from '@hapi/joi';
import { REGEX_EMAIL } from '../utils/constants';

export const postSignInBodySchema = Joi.object()
  .keys({
    email: Joi.string().trim().lowercase().regex(REGEX_EMAIL).required(),
    password: Joi.string().min(6).required(),
  })
  .required();
