const express = require('express');
const cors = require('cors');
const path = require('path');

const { router: authRouter } = require('./routes/auth');
const produtosRouter = require('./routes/produtos');
const estoqueRouter = require('./routes/estoque');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Serve o frontend estático
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/estoque', estoqueRouter);

app.listen(PORT, () => {
  console.log(`Servidor do Sistema de Gestão de Estoque rodando em http://localhost:${PORT}`);
  console.log('Página de login: http://localhost:' + PORT + '/login.html');
});
