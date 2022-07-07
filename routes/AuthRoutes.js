const loginSchema = require('../schema/LoginSchema');
const Database = require('../database/db');
const generateSchema = require('../schema/SchemaGenerator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');

function generateAuthRoutes(CONFIG) {
  const router = express.Router();

  const colName = 'users';
  const DB = new Database();
  const { jwtKey, userModel } = CONFIG;
  const saltRounds = 10;

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

  router.post('/register', async (req, res, next) => {
    try {
      const requestBody = { ...req.body };

      const { error: validationError } = schema.validate(requestBody);
      if (validationError) {
        return res.status(400).send({ status: 'BadRequest', message: validationError.message });
      }

      const hash = await bcrypt.hash(requestBody.password, saltRounds);
      requestBody.password = hash;

      const result = DB.insertData(colName, requestBody);
      const id = result.lastInsertRowid;
      const user = { id, ...requestBody };
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

  router.post('/login', async (req, res, next) => {
    const { error: validationError } = loginSchema.validate(req.body);
    if (validationError) {
      return res.status(400).send({ status: 'BadRequest', message: validationError.message });
    }

    const user = DB.findOne(colName, { email: req.body.email });
    if (!user) {
      return res.status(400).send({
        status: 'BadRequest',
        message: 'The given email or password is incorrect',
      });
    }

    const passwordIsMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordIsMatch) {
      return res.status(400).send({
        status: 'BadRequest',
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
