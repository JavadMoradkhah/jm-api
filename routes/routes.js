const express = require('express');

function generateRoutes(collections) {
  const router = express.Router();
  collections.forEach((collection) => {
    const { colName, singularName, fields } = collection;

    router.get(`/${colName}`, (req, res) => {
      res.send(colName);
    });

    router.get(`/${colName}/:id`, (req, res) => {
      res.send(colName);
    });

    router.post(`/${colName}`, (req, res) => {
      res.send(colName);
    });

    router.put(`/${colName}/:id`, (req, res) => {
      res.send(colName);
    });

    router.delete(`/${colName}/:id`, (req, res) => {
      res.send(colName);
    });
  });
  return router;
}

module.exports = generateRoutes;
