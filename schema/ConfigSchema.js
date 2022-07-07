const Joi = require('joi');
const { fieldSchema, collectionSchema } = require('./CollectionSchema');
const defaults = require('../config/defaults');

const Schema = Joi.object({
  port: Joi.number().integer().min(3000).max(9999).default(defaults.port),
  jwtKey: Joi.string().required(),
  upload: Joi.object({
    path: Joi.string(),
    maxUploadSize: Joi.number().integer().min(1024),
  }),
  userModel: Joi.object({
    email: Joi.object({
      min: Joi.number().integer(),
      max: Joi.number().integer().max(255),
    }),
    password: Joi.object({
      min: Joi.number().integer(),
      max: Joi.number().integer().max(255),
    }),
    fields: Joi.array().items(fieldSchema),
  }),
  collections: Joi.array().items(collectionSchema).required(),
});

module.exports = Schema;
