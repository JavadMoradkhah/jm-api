const DataTypes = require('./DataTypes');
const sql = require('sql-bricks');
const { select, insert, update } = sql;

function isUnique(unique) {
  return unique ? 'UNIQUE' : '';
}

function isRequired(required) {
  return required ? 'NOT NULL' : '';
}

function createTable(collection) {
  const fields = collection.fields
    .map(
      ({ name, type, unique, required }) =>
        `${name} ${DataTypes[type]} ${isUnique(unique)} ${isRequired(required)}`
    )
    .join(',\n');
  return `
    CREATE TABLE IF NOT EXISTS ${collection.name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
        ${fields}
    );
  `;
}

function dropTable(colName) {
  return `DROP TABLE IF EXISTS ${colName}`;
}

function selectAllRows(colName) {
  return select().from(colName).toString();
}

function selectRowById(colName, id) {
  return select().from(colName).where({ id }).toString();
}

function insertRow(colName, values) {
  return insert(colName, values).toString();
}

function updateRow(colName, id, values) {
  return update(colName, values).where({ id }).toString();
}

function deleteRow(colName, id) {
  return sql.delete(colName).where({ id }).toString();
}

module.exports.createTable = createTable;
module.exports.dropTable = dropTable;
module.exports.selectAllRows = selectAllRows;
module.exports.selectRowById = selectRowById;
module.exports.insertRow = insertRow;
module.exports.updateRow = updateRow;
module.exports.deleteRow = deleteRow;
