const defaults = require('../config/defaults');
const uploadRoutes = require('../routes/UploadRoutes');
const generateAuthRoutes = require('../routes/AuthRoutes');
const generateRoutes = require('../routes/routes');
const figlet = require('figlet');
const { createSpinner } = require('nanospinner');
const path = require('path');
const express = require('express');
const app = express();

function startServer(CLIENT_DIR, CONFIG) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const uploadPath = CONFIG.upload.path || defaults.upload.path;

  app.use('/api', uploadRoutes);
  app.use('/api', generateAuthRoutes(CONFIG.userModel, CONFIG.jwtKey));
  app.use('/api', generateRoutes(CONFIG.collections));
  app.use('/uploads', express.static(path.resolve(CLIENT_DIR, uploadPath)));

  const PORT = CONFIG.port || defaults.port;
  const serverSpinner = createSpinner('Starting server...').start();
  app.listen(PORT, () => {
    serverSpinner.success();
    console.log(`Server is listening: http://localhost:${PORT}/api/`);
    figlet('JM API', function (err, data) {
      if (!err) {
        console.log(data);
      }
    });
  });
}

module.exports = startServer;
