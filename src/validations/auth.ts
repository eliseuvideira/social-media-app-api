import Joi from '@hapi/joi';
import { Regexes } from '../utils/Regexes';

export const postSignInBodySchema = Joi.object()
  .keys({
    email: Joi.string().trim().lowercase().regex(Regexes.email).required(),
    password: Joi.string().min(6).required(),
  })
  .required();
