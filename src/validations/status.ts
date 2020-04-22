import Joi from '@hapi/joi';

export const getStatusQuerySchema = Joi.object()
  .keys({
    results: Joi.boolean().default(false),
  })
  .required();
