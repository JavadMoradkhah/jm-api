const Joi = require('joi');
const { fieldSchema, collectionSchema } = require('./CollectionSchema');

const Schema = Joi.object({
  port: Joi.number().integer().min(3000).max(9999).default(5000),
  userModel: Joi.object({
    fields: Joi.array().min(1).items(fieldSchema).required(),
  }),
  collections: Joi.array().items(collectionSchema).required(),
});

module.exports = Schema;
