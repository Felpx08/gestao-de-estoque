// Inicializa o banco de dados "almoxarifado_db" executando o script.sql
// (localizado na raiz do repositório) contra um arquivo SQLite local.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'almoxarifado_db.sqlite');
const SQL_SCRIPT_PATH = path.join(__dirname, '..', '..', 'script.sql');

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Banco de dados existente removido para recriação.');
}

const db = new Database(DB_PATH);
const sql = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

db.exec(sql);
console.log('Banco de dados "almoxarifado_db" criado e populado com sucesso em:', DB_PATH);

db.close();
