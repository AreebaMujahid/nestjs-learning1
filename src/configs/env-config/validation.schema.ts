import * as Joi from 'joi';
export const validationSchema = Joi.object({
  //db modules validation

  DB_SYNC: Joi.boolean().truthy('true').falsy('false').required(),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').required(),
  DATABASE_URL: Joi.string().uri().required(),
});
