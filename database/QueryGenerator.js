const sql = require('sql-bricks');
const DataTypes = require('./DataTypes');
const { select, insert, update } = sql;

const QueryOperators = {
  eq: (key, value) => {
    return `${key}=${wrapValue(value)}`;
  },
  neq: (key, value) => {
    return `${key}!=${wrapValue(value)}`;
  },
  lt: (key, value) => {
    return `${key}<${wrapValue(value)}`;
  },
  lte: (key, value) => {
    return `${key}<=${wrapValue(value)}`;
  },
  gt: (key, value) => {
    return `${key}>${wrapValue(value)}`;
  },
  gte: (key, value) => {
    return `${key}>=${wrapValue(value)}`;
  },
  con: (key, value) => {
    return `${key} LIKE ${wrapValue(`%${value}%`)}`;
  },
  sw: (key, value) => {
    return `${key} LIKE ${wrapValue(`${value}%`)}`;
  },
  ew: (key, value) => {
    return `${key} LIKE ${wrapValue(`%${value}`)}`;
  },
};

function isUnique(unique) {
  return unique ? 'UNIQUE' : '';
}

function isRequired(required) {
  return required ? 'NOT NULL' : '';
}

function wrapValue(value) {
  return isNaN(value) ? `'${value}'` : value;
}

function createTable(collection) {
  const fields = collection.fields
    .map(({ name, type, unique, required }) => `${name} ${DataTypes[type]} ${isUnique(unique)} ${isRequired(required)}`)
    .join(',\n');
  return `
    CREATE TABLE IF NOT EXISTS ${collection.colName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
        ${fields}
    );
  `;
}

function dropTable(colName) {
  return `DROP TABLE IF EXISTS ${colName}`;
}

function selectAllRows(colName, query) {
  const queryEntries = Object.entries(query);
  if (queryEntries.length === 0) {
    return select().from(colName).toString();
  }

  const filters = queryEntries.map((qItem) => {
    const [key, value] = qItem;
    const [fieldName, operator] = key.split('.');
    if (operator !== undefined && operator in QueryOperators) {
      return QueryOperators[operator](fieldName, value);
    }
    return QueryOperators['eq'](fieldName, value);
  });

  return `SELECT * FROM ${colName} WHERE ${filters.join(' AND ')};`;
}

function selectRowById(colName, id) {
  return select().from(colName).where({ id }).toString();
}

function findRow(colName, values) {
  return select().from(colName).where(values).toString();
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
module.exports.findRow = findRow;
module.exports.insertRow = insertRow;
module.exports.updateRow = updateRow;
module.exports.deleteRow = deleteRow;
