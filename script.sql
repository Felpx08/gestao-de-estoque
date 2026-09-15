-- =========================================================
-- Script de Criação e População do Banco de Dados
-- Banco: almoxarifado_db
-- Sistema de Gestão de Estoque - Indústria de Embalagens
-- SGBD: SQLite 3 (compatível com adaptação simples p/ MySQL/PostgreSQL)
-- =========================================================

PRAGMA foreign_keys = ON;

-- Caso o banco já exista, remove as tabelas para permitir reexecução do script
DROP TABLE IF EXISTS movimentacoes;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- =========================================================
-- TABELA: usuarios
-- Armazena os usuários que podem acessar o sistema (almoxarifes)
-- =========================================================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,              -- senha em texto plano apenas para fins didáticos da atividade
    cargo TEXT NOT NULL DEFAULT 'Almoxarife',
    data_cadastro TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================================================
-- TABELA: categorias
-- Classifica os tipos de embalagem (caixas de papelão, frascos plásticos, etc.)
-- =========================================================
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);

-- =========================================================
-- TABELA: produtos
-- Cadastro de produtos/embalagens controlados no estoque
-- =========================================================
CREATE TABLE produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria_id INTEGER NOT NULL,
    descricao TEXT,
    unidade_medida TEXT NOT NULL DEFAULT 'UN',   -- UN, KG, L, etc.
    gramatura TEXT,                              -- ex: "250g/m²" (aplicável a caixas de papelão)
    dimensoes TEXT,                              -- ex: "30x20x15 cm" (aplicável a caixas de papelão)
    capacidade_volumetrica TEXT,                 -- ex: "500ml" (aplicável a frascos plásticos)
    tipo_tampa TEXT,                              -- ex: "Rosca", "Flip-top" (aplicável a frascos plásticos)
    quantidade_atual INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    data_cadastro TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- =========================================================
-- TABELA: movimentacoes
-- Histórico de entradas e saídas de estoque, com responsável e data
-- =========================================================
CREATE TABLE movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    data_movimentacao TEXT NOT NULL,   -- data informada pelo usuário no formulário
    data_registro TEXT NOT NULL DEFAULT (datetime('now')), -- data/hora real do registro no sistema
    observacao TEXT,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =========================================================
-- POPULAÇÃO: usuarios (mínimo 3 registros)
-- =========================================================
INSERT INTO usuarios (nome, email, senha, cargo) VALUES
    ('felipe Silva',    'felipe.silva@embalatech.com',    '123456', 'Administrador'),
    ('felipe Santos',  'felipe.santos@embalatech.com',  '123456', 'Almoxarife'),
    ('felp silva','felp.silva@embalatech.com','123456', 'Almoxarife');

-- =========================================================
-- POPULAÇÃO: categorias (mínimo 3 registros)
-- =========================================================
INSERT INTO categorias (nome, descricao) VALUES
    ('Caixa de Papelão',  'Embalagens de papelão em diferentes gramaturas e dimensões'),
    ('Frasco Plástico',   'Embalagens plásticas com variação de capacidade e tipo de tampa'),
    ('Rótulo Adesivo',    'Rótulos e etiquetas adesivas para identificação de produtos');

-- =========================================================
-- POPULAÇÃO: produtos (mínimo 3 registros)
-- =========================================================
INSERT INTO produtos (nome, categoria_id, descricao, unidade_medida, gramatura, dimensoes, capacidade_volumetrica, tipo_tampa, quantidade_atual, estoque_minimo) VALUES
    ('Caixa Papelão P',   1, 'Caixa de papelão pequena para transporte',  'UN', '150g/m²', '20x15x10 cm', NULL, NULL, 120, 30),
    ('Frasco Plástico 500ml', 2, 'Frasco plástico com tampa rosca',       'UN', NULL, NULL, '500ml', 'Rosca', 45, 50),
    ('Rótulo Adesivo Padrão', 3, 'Rótulo adesivo branco padrão 10x5cm',  'UN', NULL, '10x5 cm', NULL, NULL, 800, 200);

-- =========================================================
-- POPULAÇÃO: movimentacoes (mínimo 3 registros)
-- =========================================================
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
    (1, 2, 'ENTRADA', 100, '2026-08-01', 'Recebimento de fornecedor - NF 1023'),
    (2, 3, 'SAIDA',    55, '2026-08-05', 'Envio para linha de produção 2'),
    (3, 1, 'ENTRADA', 500, '2026-08-10', 'Recebimento de fornecedor - NF 1031');
