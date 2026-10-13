// Funções do site para conversar com o servidor PHP (pasta api/).

const CHAVE_SESSAO = 'bovtrack_sessao';

// Envia JSON para uma rota do servidor e devolve a resposta.
// Em caso de erro, lança um Error com a mensagem que o servidor mandou.
async function enviarParaServidor(rota, dados) {
  let resposta;
  try {
    resposta = await fetch(rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(dados)
    });
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }

  return lerResposta(resposta);
}

// Lê a resposta do servidor. Se não vier JSON (por exemplo, numa
// hospedagem sem PHP, como a Vercel), mostra um erro claro.
async function lerResposta(resposta) {
  let corpo;
  try {
    corpo = await resposta.json();
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor.');
  }
  if (!resposta.ok) throw new Error((corpo && corpo.erro) || 'Erro no servidor. Tente de novo.');
  return corpo;
}

// Tem login salvo neste navegador?
function estaLogado() {
  return !!(localStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_SESSAO));
}

// Para páginas que só quem está logado pode ver: sem login salvo,
// vai direto para a tela de login (sem nem precisar do servidor).
function exigirLogin(paginaLogin = 'login.html') {
  if (!estaLogado()) window.location.replace(paginaLogin);
}

// Busca dados do servidor (GET). Se a pessoa não estiver logada,
// manda para a tela de login.
async function buscarDoServidor(rota, paginaLogin = 'login.html') {
  let resposta;
  try {
    resposta = await fetch(rota, { credentials: 'same-origin' });
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  }
  if (resposta.status === 401) {
    sessionStorage.removeItem(CHAVE_SESSAO);
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.replace(paginaLogin);
    throw new Error('Faça login novamente.');
  }
  return lerResposta(resposta);
}

// Guarda no navegador quem está logado (o header usa isso para mostrar "Sair").
// "Salvar senha" marcado = continua conectado mesmo fechando o navegador.
function salvarSessao(email, lembrar) {
  const sessao = JSON.stringify({ email, entrouEm: Date.now() });
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, sessao);
}
