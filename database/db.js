const {
  createTable,
  dropTable,
  selectAllRows,
  insertRow,
  selectRowById,
  findRow,
  updateRow,
  deleteRow,
} = require('./QueryGenerator');
const CLIENT_DIR = process.cwd();
const DB_PATH = `${CLIENT_DIR}\\jm-api.db`;
const DB = require('better-sqlite3')(DB_PATH);

class Database {
  createTable(collection) {
    DB.prepare(createTable(collection)).run();
  }

  dropTable(collName) {
    DB.prepare(dropTable(collName)).run();
  }

  selectAll(collName) {
    return DB.prepare(selectAllRows(collName)).all();
  }

  selectById(collName, id) {
    return DB.prepare(selectRowById(collName, id)).get();
  }

  findOne(collName, values) {
    return DB.prepare(findRow(collName, values)).get();
  }

  insertData(collName, values) {
    return DB.prepare(insertRow(collName, values)).run();
  }

  updateById(collName, id, values) {
    return DB.prepare(updateRow(collName, id, values)).run();
  }

  deleteById(collName, id) {
    return DB.prepare(deleteRow(collName, id)).run();
  }
}

module.exports = Database;
