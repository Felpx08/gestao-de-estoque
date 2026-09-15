const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// Armazena tokens de sessão válidos em memória: token -> usuario
const sessions = new Map();

function gerarToken() {
  return crypto.randomBytes(24).toString('hex');
}

// POST /api/auth/login
// Recebe { email, senha } e retorna um token de sessão + dados do usuário
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ sucesso: false, mensagem: 'Informe e-mail e senha.' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta.' });
  }

  const token = gerarToken();
  sessions.set(token, { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo });

  res.json({
    sucesso: true,
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ sucesso: true });
});

// Middleware exportado para proteger rotas privadas
function autenticar(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  const usuario = sessions.get(token);

  if (!usuario) {
    return res.status(401).json({ sucesso: false, mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  req.usuario = usuario;
  next();
}

module.exports = { router, autenticar };
