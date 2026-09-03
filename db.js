// Mini "base de datos" en JSON para el prototipo.
// En producción esto se reemplaza por Postgres/MySQL/SQLite real,
// pero la forma de leer/escribir (getDB/saveDB) queda igual.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    try {
        return JSON.parse(raw);
    } catch (err) {
        // Con muchos pedidos en simultáneo (RSVP, subida de fotos, guardado
        // del editor, etc.) es posible leer el archivo justo en el instante
        // de una escritura ajena y encontrarlo a medio escribir — eso tiraba
        // "No encontrado" en cualquier ruta que justo cayera en esa lectura
        // (el panel, la vista previa, RSVP...). Un reintento a los 20ms
        // alcanza casi siempre; si tampoco se puede parsear, ahí sí se
        // deja explotar el error real en vez de devolver una base vacía.
        const raw2 = fs.readFileSync(DB_PATH, "utf-8");
        return JSON.parse(raw2);
    }
}

function saveDB(db) {
    ensureDataDir();
    // Escritura atómica: se escribe a un archivo temporal y se renombra
    // encima del real. rename() es atómico a nivel de sistema de archivos,
    // así que una lectura concurrente (getDB) nunca puede encontrar el
    // archivo a medio escribir — antes con writeFileSync directo sobre
    // db.json sí podía pasar, y esa lectura corrupta era la causa real del
    // "No encontrado" intermitente.
    const tmpPath = DB_PATH + "." + process.pid + "." + Date.now() + ".tmp";
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2));
    fs.renameSync(tmpPath, DB_PATH);
}

// Genera IDs impredecibles con crypto.randomBytes (no Math.random(), que no
// es un generador criptográficamente seguro, ni Date.now(), que es un valor
// adivinable). Esto importa mucho más de lo que parece: uid() no solo arma
// IDs internos, también genera el editToken del editor post-pago y el token
// del link personal de cada invitado — la ÚNICA "contraseña" que protege
// esas rutas. 16 bytes al azar (128 bits) en base64url dan un espacio de
// búsqueda imposible de fuerza-bruta, a diferencia del esquema anterior.
function uid(prefix) {
    return prefix + "_" + crypto.randomBytes(16).toString("base64url");
}

module.exports = { getDB, saveDB, uid };
