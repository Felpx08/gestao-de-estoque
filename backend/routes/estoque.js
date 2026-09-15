const express = require('express');
const db = require('../db');
const { autenticar } = require('./auth');

const router = express.Router();
router.use(autenticar);

// Algoritmo de ordenação (Insertion Sort) implementado manualmente para
// atender ao requisito 7.1.1 - listar produtos em ordem alfabética.
function insertionSortPorNome(lista) {
  const arr = [...lista];
  for (let i = 1; i < arr.length; i++) {
    const atual = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j].nome.localeCompare(atual.nome, 'pt-BR', { sensitivity: 'base' }) > 0) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = atual;
  }
  return arr;
}

// GET /api/estoque/produtos -> produtos ordenados alfabeticamente (insertion sort)
router.get('/produtos', (req, res) => {
  const produtos = db.prepare(`
    SELECT p.*, c.nome AS categoria_nome
    FROM produtos p
    JOIN categorias c ON c.id = p.categoria_id
  `).all();

  const ordenados = insertionSortPorNome(produtos);
  res.json({ sucesso: true, produtos: ordenados });
});

// GET /api/estoque/movimentacoes -> histórico completo de movimentações
router.get('/movimentacoes', (req, res) => {
  const movimentacoes = db.prepare(`
    SELECT m.*, p.nome AS produto_nome, u.nome AS usuario_nome
    FROM movimentacoes m
    JOIN produtos p ON p.id = m.produto_id
    JOIN usuarios u ON u.id = m.usuario_id
    ORDER BY m.data_registro DESC
  `).all();

  res.json({ sucesso: true, movimentacoes });
});

// POST /api/estoque/movimentacoes -> registra entrada ou saída de estoque
// body: { produto_id, tipo ('ENTRADA'|'SAIDA'), quantidade, data_movimentacao, observacao }
router.post('/movimentacoes', (req, res) => {
  const { produto_id, tipo, quantidade, data_movimentacao, observacao } = req.body;
  const usuario_id = req.usuario.id;

  const erros = [];
  if (!produto_id) erros.push('Selecione um produto.');
  if (!tipo || !['ENTRADA', 'SAIDA'].includes(tipo)) erros.push('Selecione o tipo de movimentação (entrada ou saída).');
  if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) erros.push('Informe uma quantidade válida (maior que zero).');
  if (!data_movimentacao) erros.push('Informe a data da movimentação.');

  if (erros.length > 0) {
    return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.', erros });
  }

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(produto_id);
  if (!produto) {
    return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
  }

  const qtd = Number(quantidade);

  if (tipo === 'SAIDA' && qtd > produto.quantidade_atual) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Estoque insuficiente. Quantidade disponível: ${produto.quantidade_atual}.`
    });
  }

  const novaQuantidade = tipo === 'ENTRADA'
    ? produto.quantidade_atual + qtd
    : produto.quantidade_atual - qtd;

  const registrar = db.transaction(() => {
    db.prepare(`
      INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(produto_id, usuario_id, tipo, qtd, data_movimentacao, observacao || null);

    db.prepare('UPDATE produtos SET quantidade_atual = ? WHERE id = ?').run(novaQuantidade, produto_id);
  });
  registrar();

  // Requisito 7.1.4: verificação automática após saída, gera alerta se abaixo do mínimo
  const alerta = (tipo === 'SAIDA' && novaQuantidade < produto.estoque_minimo)
    ? {
        alerta: true,
        mensagem: `Alerta de estoque mínimo: "${produto.nome}" está com ${novaQuantidade} unidades, abaixo do mínimo configurado (${produto.estoque_minimo}).`
      }
    : { alerta: false };

  res.status(201).json({
    sucesso: true,
    quantidade_atual: novaQuantidade,
    ...alerta
  });
});

module.exports = router;
