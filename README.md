# Sistema de Gestão de Estoque — Indústria de Embalagens

Atividade prática: desenvolvimento de um sistema web para controle de entrada e saída de produtos (embalagens) em um almoxarifado, com alerta de estoque mínimo e histórico de movimentações.

## Estrutura do repositório

```
.
├── script.sql                # Entrega 3 — criação e população do banco "almoxarifado_db"
├── der.png                   # Entrega 2 — Diagrama Entidade-Relacionamento
├── der.dot                   # Fonte do DER (Graphviz), mantido para referência
├── documentacao.docx         # Entregas 1, 8 e 9 — Requisitos funcionais, casos de teste e infraestrutura (ANEXO III)
├── README.md                 # Este arquivo
└── sistema/                  # Entregas 4, 5, 6 e 7 — código-fonte do sistema
    ├── backend/               # API REST (Node.js + Express + SQLite)
    │   ├── server.js
    │   ├── db.js
    │   ├── init_db.js
    │   ├── package.json
    │   └── routes/
    │       ├── auth.js        # login/logout (Entrega 4)
    │       ├── produtos.js    # cadastro de produto (Entrega 6)
    │       └── estoque.js     # gestão de estoque (Entrega 7)
    └── frontend/               # Interfaces web (HTML/CSS/JS puro)
        ├── login.html          # Entrega 4 — autenticação
        ├── principal.html      # Entrega 5 — interface principal
        ├── produtos.html       # Entrega 6 — cadastro de produto
        ├── estoque.html        # Entrega 7 — gestão de estoque
        ├── css/style.css
        └── js/api.js
```

## Como executar o sistema

Pré-requisito: [Node.js](https://nodejs.org/) versão 18 ou superior instalado.

```bash
# 1. Entrar na pasta do backend
cd sistema/backend

# 2. Instalar as dependências
npm install

# 3. Criar e popular o banco de dados "almoxarifado_db"
#    (lê e executa o script.sql da raiz do repositório)
npm run init-db

# 4. Iniciar o servidor
npm start
```

O servidor sobe em `http://localhost:3000`. Acesse `http://localhost:3000/login.html` no navegador.

## Usuários de teste (criados pelo script.sql)

| E-mail                           | Senha  |
|----------------------------------|--------|
| felipe.silva@embalatech.com      | 123456 |
| felipe.santos@embalatech.com     | 123456 |
| felp.silva@embalatech.com        | 123456 |

## Principais funcionalidades

- **Login** com validação de credenciais e mensagem de erro específica em caso de falha (Entrega 4).
- **Tela principal** com nome do usuário logado, logout e acesso às demais telas (Entrega 5).
- **Cadastro de Produto**: listagem automática, busca, criação, edição, exclusão e validação de formulário (Entrega 6).
- **Gestão de Estoque**: listagem de produtos em ordem alfabética (algoritmo Insertion Sort implementado manualmente), registro de movimentações de entrada/saída com data, alerta automático de estoque abaixo do mínimo e histórico completo de movimentações com responsável e data (Entrega 7).

## Banco de dados

Banco `almoxarifado_db`, com as tabelas `usuarios`, `categorias`, `produtos` e `movimentacoes`, todas com pelo menos 3 registros de exemplo. Veja o diagrama em `der.png` e o script completo em `script.sql`.

## Infraestrutura utilizada

- SGBD: SQLite 3 (via `better-sqlite3`)
- Linguagem: JavaScript / Node.js
- Backend: Express
- Frontend: HTML5, CSS3 e JavaScript puro (sem frameworks)

Detalhes completos de requisitos funcionais, casos de teste e infraestrutura estão em `documentacao.docx`.
