// Mini "base de datos" en JSON para el prototipo.
// En producción esto se reemplaza por Postgres/MySQL/SQLite real,
// pero la forma de leer/escribir (getDB/saveDB) queda igual.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");

function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { orders: [], invitations: [], rsvps: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function uid(prefix) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

module.exports = { getDB, saveDB, uid };
