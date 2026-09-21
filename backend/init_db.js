// Inicializa o banco de dados "almoxarifado_db" executando o script.sql
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'almoxarifado_db.sqlite');

// Caminhos possíveis do script.sql (pasta aninhada ou normal)
const candidatos = [
  path.join(__dirname, '..', 'script.sql'),
  path.join(__dirname, '..', '..', 'script.sql'),
];
const SQL_SCRIPT_PATH = candidatos.find((p) => fs.existsSync(p));

if (!SQL_SCRIPT_PATH) {
  console.error('script.sql não encontrado. Coloque o arquivo na pasta do projeto (um nível acima de backend).');
  process.exit(1);
}

// Tenta remover o banco antigo de forma mais segura no Windows
if (fs.existsSync(DB_PATH)) {
  try {
    // Fecha possível conexão residual e tenta apagar
    try {
      const tmp = new Database(DB_PATH);
      tmp.close();
    } catch (_) {}

    fs.unlinkSync(DB_PATH);
    console.log('Banco de dados existente removido para recriação.');
  } catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      // Fallback: renomeia e usa um arquivo novo
      const backup = DB_PATH + '.old.' + Date.now();
      try {
        fs.renameSync(DB_PATH, backup);
        console.log('Arquivo antigo estava bloqueado. Renomeado para:', backup);
        console.log('Depois você pode apagar o .old manualmente.');
      } catch (err2) {
        console.error('Não foi possível apagar nem renomear o banco.');
        console.error('Feche TODOS os terminais Node, VS Code e ferramentas de SQLite.');
        console.error('Depois apague manualmente:');
        console.error('  ' + DB_PATH);
        process.exit(1);
      }
    } else {
      throw err;
    }
  }
}

const db = new Database(DB_PATH);
const sql = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');
db.exec(sql);
console.log('Banco de dados criado e populado com sucesso em:', DB_PATH);
db.close();
