const loginSchema = require('../schema/LoginSchema');
const Database = require('../database/db');
const generateSchema = require('../schema/SchemaGenerator');
const express = require('express');

function generateAuthRoutes(userModel) {
  const router = express.Router();

  const colName = 'users';
  const DB = new Database();

  // Checking if email and password property exists
  if (!userModel.email) userModel.email = {};
  if (!userModel.password) userModel.password = {};

  // Overwriting email and password property
  const emailField = { ...userModel.email, name: 'email', type: 'string', email: true, unique: true, required: true };
  const passwordField = { ...userModel.password, name: 'password', type: 'string', required: true };

  // Overwriting fields array
  const fields = [emailField, passwordField, ...userModel.fields];

  try {
    // Creating users table
    DB.createTable({ colName, fields });
    // Adding created collection to the collections table
    DB.insertData('collections', { name: colName });
  } catch (error) {
    if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(error);
      process.exit(1);
    }
  }

  // Generating user schema to validate requests
  const schema = generateSchema(fields, false);

  router.post('/register', (req, res, next) => {
    const { error: validationError } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).send({ status: 'BadRequest', message: validationError.message });
    }
    const result = DB.insertData(colName, req.body);
    res.status(200).send({ id: result.lastInsertRowid, ...req.body });
  });

  router.post('/login', (req, res, next) => {
    const { error: validationError } = loginSchema.validate(req.body);
    if (validationError) {
      return res.status(400).send({ status: 'BadRequest', message: validationError.message });
    }
    const user = DB.findOne(colName, { email: req.body.email });
    if (!user || user.password !== req.body.password) {
      return res.status(400).send({
        status: 'Error',
        message: 'The given email or password is incorrect',
      });
    }
    res.status(200).send({ status: 'OK', user: { ...user, password: undefined } });
  });

  return router;
}

module.exports = generateAuthRoutes;
