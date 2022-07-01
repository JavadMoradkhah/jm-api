const Joi = require('joi');

function generateSchema(collectionFields, isUpdateSchema) {
  const schema = {};
  collectionFields.forEach((field) => {
    schema[field.name] = getFieldSchema(field, isUpdateSchema);
  });
  return Joi.object(schema);
}

function getFieldSchema(field, isUpdateSchema) {
  let schema = Joi.string();

  const { type, min, max, email, required } = field;

  switch (type) {
    case 'integer':
      schema = Joi.number().integer();
      break;
    case 'float':
      schema = Joi.number();
      break;
    case 'boolean':
      schema = Joi.boolean();
      break;
    default:
      schema = Joi.string();
  }

  if (min !== undefined) schema = schema.min(min);

  if (max !== undefined) schema = schema.max(max);

  if (email) schema = schema.email();

  if (required && !isUpdateSchema) schema = schema.required();

  return schema;
}

module.exports = generateSchema;
