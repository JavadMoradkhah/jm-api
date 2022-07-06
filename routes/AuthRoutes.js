const loginSchema = require('../schema/LoginSchema');
const Database = require('../database/db');
const generateSchema = require('../schema/SchemaGenerator');
const jwt = require('jsonwebtoken');
const express = require('express');

function generateAuthRoutes(CONFIG) {
  const router = express.Router();

  const colName = 'users';
  const DB = new Database();
  const { jwtKey, userModel } = CONFIG;

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
    try {
      const { error: validationError } = schema.validate(req.body);
      if (validationError) {
        return res.status(400).send({ status: 'BadRequest', message: validationError.message });
      }
      const result = DB.insertData(colName, req.body);
      const id = result.lastInsertRowid;
      const user = { id, ...req.body };
      delete user.password;
      const token = jwt.sign(user, jwtKey);
      res.status(200).send({ status: 'OK', token, user });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).send({
          status: 'BadRequest',
          message: 'A user already exists with the given email!',
        });
      }
      return res.status(400).send({
        status: 'BadRequest',
        message: error.message,
      });
    }
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
    delete user.password;
    const token = jwt.sign(user, jwtKey);
    res.status(200).send({ status: 'OK', token, user });
  });

  return router;
}

module.exports = generateAuthRoutes;
