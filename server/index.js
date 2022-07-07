const configSchema = require('../schema/ConfigSchema');
const startServer = require('./server');
const { createSpinner } = require('nanospinner');
const path = require('path');

try {
  const CLIENT_DIR = process.cwd();
  const CONFIG = require(path.resolve(CLIENT_DIR, 'jm-api.js'));

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

  startServer(CLIENT_DIR, CONFIG);
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.group('MODULE_NOT_FOUND:');
    console.log('The "jm-api.js" file does not exist!\n');
    console.groupEnd();
  } else {
    console.log(error);
  }
}
