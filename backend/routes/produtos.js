const express = require('express');
const db = require('../db');
const { autenticar } = require('./auth');

const router = express.Router();
router.use(autenticar);

// GET /api/produtos?busca=termo  -> lista produtos (com filtro opcional de busca)
router.get('/', (req, res) => {
  const { busca } = req.query;

  let produtos;
  if (busca && busca.trim() !== '') {
    const termo = `%${busca.trim()}%`;
    produtos = db.prepare(`
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.nome LIKE ? OR c.nome LIKE ? OR p.descricao LIKE ?
      ORDER BY p.nome ASC
    `).all(termo, termo, termo);
  } else {
    produtos = db.prepare(`
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      JOIN categorias c ON c.id = p.categoria_id
      ORDER BY p.nome ASC
    `).all();
  }

  res.json({ sucesso: true, produtos });
});

// GET /api/produtos/categorias -> lista categorias para preencher formulário
router.get('/categorias', (req, res) => {
  const categorias = db.prepare('SELECT * FROM categorias ORDER BY nome ASC').all();
  res.json({ sucesso: true, categorias });
});

function validarProduto(body) {
  const erros = [];
  if (!body.nome || body.nome.trim() === '') erros.push('Nome é obrigatório.');
  if (!body.categoria_id) erros.push('Categoria é obrigatória.');
  if (body.quantidade_atual === undefined || body.quantidade_atual === null || body.quantidade_atual === '' || isNaN(Number(body.quantidade_atual)) || Number(body.quantidade_atual) < 0) {
    erros.push('Quantidade atual deve ser um número válido maior ou igual a zero.');
  }
  if (body.estoque_minimo === undefined || body.estoque_minimo === null || body.estoque_minimo === '' || isNaN(Number(body.estoque_minimo)) || Number(body.estoque_minimo) < 0) {
    erros.push('Estoque mínimo deve ser um número válido maior ou igual a zero.');
  }
  return erros;
}

// POST /api/produtos -> cadastra novo produto
router.post('/', (req, res) => {
  const erros = validarProduto(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.', erros });
  }

  const {
    nome, categoria_id, descricao, unidade_medida,
    gramatura, dimensoes, capacidade_volumetrica, tipo_tampa,
    quantidade_atual, estoque_minimo
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO produtos (nome, categoria_id, descricao, unidade_medida, gramatura, dimensoes, capacidade_volumetrica, tipo_tampa, quantidade_atual, estoque_minimo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    nome.trim(), categoria_id, descricao || null, unidade_medida || 'UN',
    gramatura || null, dimensoes || null, capacidade_volumetrica || null, tipo_tampa || null,
    Number(quantidade_atual), Number(estoque_minimo)
  );

  res.status(201).json({ sucesso: true, id: info.lastInsertRowid });
});

// PUT /api/produtos/:id -> edita produto existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
  if (!existente) {
    return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
  }

  const erros = validarProduto(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.', erros });
  }

  const {
    nome, categoria_id, descricao, unidade_medida,
    gramatura, dimensoes, capacidade_volumetrica, tipo_tampa,
    quantidade_atual, estoque_minimo
  } = req.body;

  db.prepare(`
    UPDATE produtos SET
      nome = ?, categoria_id = ?, descricao = ?, unidade_medida = ?,
      gramatura = ?, dimensoes = ?, capacidade_volumetrica = ?, tipo_tampa = ?,
      quantidade_atual = ?, estoque_minimo = ?
    WHERE id = ?
  `).run(
    nome.trim(), categoria_id, descricao || null, unidade_medida || 'UN',
    gramatura || null, dimensoes || null, capacidade_volumetrica || null, tipo_tampa || null,
    Number(quantidade_atual), Number(estoque_minimo), id
  );

  res.json({ sucesso: true });
});

// DELETE /api/produtos/:id -> exclui produto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
  if (!existente) {
    return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
  }

  db.prepare('DELETE FROM movimentacoes WHERE produto_id = ?').run(id);
  db.prepare('DELETE FROM produtos WHERE id = ?').run(id);

  res.json({ sucesso: true });
});

module.exports = router;
