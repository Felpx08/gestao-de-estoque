const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'almoxarifado_db.sqlite');

if (!fs.existsSync(DB_PATH)) {
  console.error('Banco de dados não encontrado. Execute "npm run init-db" antes de iniciar o servidor.');
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

module.exports = db;
