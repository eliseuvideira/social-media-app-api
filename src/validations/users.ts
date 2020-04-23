import Joi from '@hapi/joi';
import { Regexes } from '../utils/Regexes';

export const postUsersBodySchema = Joi.object()
  .keys({
    email: Joi.string().trim().lowercase().regex(Regexes.email).required(),
    name: Joi.string().trim().min(6).required(),
    password: Joi.string().min(6).required(),
  })
  .required();

export const getUserParamsSchema = Joi.object()
  .keys({
    _id: Joi.string().lowercase().regex(Regexes.objectId).required(),
  })
  .required();

export const putUserBodySchema = Joi.object()
  .keys({
    name: Joi.string().trim().min(6).required(),
  })
  .required();
