import Joi from '@hapi/joi';
import { REGEX_OBJECT_ID } from '../utils/constants';

export const createPostBodySchema = Joi.object()
  .keys({ content: Joi.string().required() })
  .required();

export const getPostParamsSchema = Joi.object()
  .keys({
    _id: Joi.string().lowercase().regex(REGEX_OBJECT_ID).required(),
  })
  .required();

export const updatePostBodySchema = Joi.object()
  .keys({ content: Joi.string().required() })
  .required();
