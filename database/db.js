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
const path = require('path');
const DB_PATH = path.resolve(process.cwd(), 'jm-api.db');
const DB = require('better-sqlite3')(DB_PATH);

class Database {
  constructor() {
    // Creating a collections table to store the list of created collections
    this.createTable({
      colName: 'collections',
      fields: [{ name: 'name', type: 'string', unique: true, required: true }],
    });
  }

  createTable(collection) {
    DB.prepare(createTable(collection)).run();
  }

  dropTable(collName) {
    DB.prepare(dropTable(collName)).run();
  }

  selectAll(collName, query) {
    const sqlQuery = selectAllRows(collName, query);
    return DB.prepare(sqlQuery).all();
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
