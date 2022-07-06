const express = require('express');
const collectionSchema = require('../schema/CollectionSchema');
const generateSchema = require('../schema/SchemaGenerator');
const Database = require('../database/db');

function generateRoutes(collections) {
  const router = express.Router();
  const DB = new Database();

  // Creating a collections table to store the list of created collections
  DB.createTable({
    colName: 'collections',
    fields: [{ name: 'name', type: 'string', unique: true, required: true }],
  });

  collections.forEach((collection) => {
    const { colName, fields } = collection;

    // Validating the collection
    console.log(`Validating "${colName}" collection...`);
    const { error: validationError } = collectionSchema.validate(collection);
    if (validationError) {
      console.group(`The "${colName}" Collection validation failed!`);
      console.log('Error: ', validationError.message);
      console.groupEnd();
      return;
    }

    // Generating schema for input validation
    console.log(`Generating "${colName}" schema...`);
    const schema = generateSchema(fields, false);
    const updateSchema = generateSchema(fields, true);

    try {
      // Creating table if not exists
      DB.createTable(collection);
      // Adding created collection to the collections table
      DB.insertData('collections', { name: colName });
    } catch (error) {
      if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(error);
        return;
      }
    }

    console.log(`Generating "${colName}" routes...`);

    router.get(`/${colName}`, (req, res) => {
      res.status(200).send(DB.selectAll(colName));
    });

    router.get(`/${colName}/:id`, (req, res) => {
      const id = parseInt(req.params.id);
      const result = DB.selectById(colName, id);
      if (result === undefined) {
        return res.status(404).send({
          status: 'NotFound',
          message: '',
        });
      }
      res.status(200).send(result);
    });

    router.post(`/${colName}`, (req, res) => {
      try {
        // Validating request
        const validationResult = schema.validate(req.body);
        if (validationResult.error) {
          return res.status(400).send({
            status: 'BadRequest',
            message: validationResult.error.message,
          });
        }
        const result = DB.insertData(colName, req.body);
        res.status(201).send({ id: result.lastInsertRowid, ...req.body });
      } catch (error) {
        return res.status(400).send({
          status: 'BadRequest',
          message: error.message,
        });
      }
    });

    router.put(`/${colName}/:id`, (req, res) => {
      try {
        const id = parseInt(req.params.id);
        // Checking if request body is empty
        if (Object.entries(req.body).length === 0) {
          return res.status(400).send({
            status: 'BadRequest',
            message: '',
          });
        }
        // Validating request
        const validationResult = updateSchema.validate(req.body);
        if (validationResult.error) {
          return res.status(400).send({
            status: 'BadRequest',
            message: validationResult.error.message,
          });
        }
        // Updating data
        DB.updateById(colName, id, req.body);
        res.status(200).send({ status: 'OK', message: '' });
      } catch (error) {
        return res.status(400).send({
          status: 'BadRequest',
          message: error.message,
        });
      }
    });

    router.delete(`/${colName}/:id`, (req, res) => {
      try {
        const id = parseInt(req.params.id);
        DB.deleteById(colName, id);
        res.send({ status: 'OK', message: '' });
      } catch (error) {
        return res.status(400).send({
          status: 'BadRequest',
          message: error.message,
        });
      }
    });
  });
  return router;
}

module.exports = generateRoutes;
