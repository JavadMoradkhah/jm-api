#!/usr/bin/env node

const configSchema = require('./schema/ConfigSchema');
const uploadRoutes = require('./routes/UploadRoutes');
const generateRoutes = require('./routes/routes');
const figlet = require('figlet');
const { createSpinner } = require('nanospinner');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

try {
  const CLIENT_DIR = process.cwd();
  const CONFIG = require(`${CLIENT_DIR}\\jm-api.js`);

  const configValidationSpinner = createSpinner('Validating configuration settings...').start();
  const configValidationResult = configSchema.validate(CONFIG);
  if (configValidationResult.error) {
    configValidationSpinner.error();
    console.group('The configuration settings are not set correctly!');
    console.log(configValidationResult.error.message);
    console.groupEnd();
    process.exit(1);
  }
  configValidationSpinner.success();

  app.use('/uploads', express.static(`${CLIENT_DIR}\\uploads`));

  app.use('/api', uploadRoutes);
  app.use('/api', generateRoutes(CONFIG.collections));

  app.get('/api', (req, res) => {
    res.send('Hello World');
  });

  const PORT = CONFIG.port || 5000;
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
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('The "jm-api.js" file does not exist!');
  } else {
    console.log(error);
  }
}
