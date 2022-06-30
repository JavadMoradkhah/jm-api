const Joi = require('joi');
const DataTypes = require('../database/DataTypes');

const fieldSchema = {
  name: Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[a-z|A-Z|_|-]+$/)
    .required(),
  type: Joi.string()
    .valid(...Object.keys(DataTypes))
    .required(),
  min: Joi.number().integer(),
  max: Joi.alternatives().conditional('type', {
    is: 'string',
    then: Joi.number().integer().max(255),
    otherwise: Joi.number().integer(),
  }),
  email: Joi.boolean().default(false),
  unique: Joi.boolean().default(false),
  required: Joi.boolean().default(false),
};

const collectionSchema = Joi.object({
  colName: Joi.string()
    .min(2)
    .max(30)
    .pattern(/^[a-z|A-Z|_|-]+$/)
    .required(),
  fields: Joi.array().min(1).items(fieldSchema).required(),
});

module.exports = collectionSchema;
