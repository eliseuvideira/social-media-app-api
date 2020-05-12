import Joi from '@hapi/joi';
import { REGEX_EMAIL, REGEX_OBJECT_ID } from '../utils/constants';

export const postUsersBodySchema = Joi.object()
  .keys({
    email: Joi.string().trim().lowercase().regex(REGEX_EMAIL).required(),
    name: Joi.string().trim().min(6).required(),
    password: Joi.string().min(6).required(),
  })
  .required();

export const getUserParamsSchema = Joi.object()
  .keys({
    _id: Joi.string().lowercase().regex(REGEX_OBJECT_ID).required(),
  })
  .required();

export const putUserBodySchema = Joi.object()
  .keys({
    name: Joi.string().trim().min(6).required(),
  })
  .required();
