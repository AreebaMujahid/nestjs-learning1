import * as Joi from 'joi';
export const validationSchema = Joi.object({
  //db modules validation
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow(''),
  DB_SYNC: Joi.boolean().truthy('true').falsy('false').required(),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').required(),
  DATABASE_URL: Joi.string().uri().required(),
});
