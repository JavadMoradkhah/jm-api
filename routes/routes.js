const express = require('express');
const collectionSchema = require('../schema/CollectionSchema');
const generateSchema = require('../schema/SchemaGenerator');
const Database = require('../database/db');

function generateRoutes(collections) {
  const router = express.Router();
  const DB = new Database();

  collections.forEach((collection) => {
    const { colName, fields } = collection;

    // Validating collection
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
    const schema = generateSchema(fields);

    // Create table if not exists
    DB.createTable(collection);

    console.log(`Generating "${colName}" routes...`);

    router.get(`/${colName}`, (req, res) => {
      res.send(DB.selectAll(colName));
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
        DB.updateById(colName, id, req.body);
        res.status(200).send(req.body);
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
