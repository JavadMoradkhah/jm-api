const CLIENT_DIR = process.cwd();
const DB_PATH = `${CLIENT_DIR}\\jm-api.db`;
const DB = require('better-sqlite3')(DB_PATH);

module.exports = DB;
