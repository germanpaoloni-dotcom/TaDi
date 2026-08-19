// Mini "base de datos" en JSON para el prototipo.
// En producción esto se reemplaza por Postgres/MySQL/SQLite real,
// pero la forma de leer/escribir (getDB/saveDB) queda igual.
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDataDir() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getDB() {
    ensureDataDir();
    if (!fs.existsSync(DB_PATH)) {
          const initial = { orders: [], invitations: [], rsvps: [] };
          fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db) {
    ensureDataDir();
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
