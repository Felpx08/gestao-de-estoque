// Módulo comum: comunicação com a API e controle de sessão do usuário logado.

const API_BASE = '/api';

function salvarSessao(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function obterToken() {
  return localStorage.getItem('token');
}

function obterUsuario() {
  const dados = localStorage.getItem('usuario');
  return dados ? JSON.parse(dados) : null;
}

function encerrarSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

// Garante que existe uma sessão ativa; caso contrário, redireciona ao login.
function exigirAutenticacao() {
  if (!obterToken() || !obterUsuario()) {
    window.location.href = 'login.html';
  }
}

async function chamarApi(caminho, opcoes = {}) {
  const token = obterToken();
  const resposta = await fetch(API_BASE + caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opcoes.headers || {})
    }
  });

  const dados = await resposta.json().catch(() => ({}));

  if (resposta.status === 401) {
    encerrarSessao();
    window.location.href = 'login.html';
    return Promise.reject(dados);
  }

  return { status: resposta.status, ok: resposta.ok, dados };
}

async function fazerLogout() {
  try {
    await chamarApi('/auth/logout', { method: 'POST' });
  } finally {
    encerrarSessao();
    window.location.href = 'login.html';
  }
}
