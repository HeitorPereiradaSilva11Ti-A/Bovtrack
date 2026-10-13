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

  let corpo = {};
  try { corpo = await resposta.json(); } catch (e) {}
  if (!resposta.ok) throw new Error(corpo.erro || 'Erro no servidor. Tente de novo.');
  return corpo;
}

// Guarda no navegador quem está logado (o header usa isso para mostrar "Sair").
// "Salvar senha" marcado = continua conectado mesmo fechando o navegador.
function salvarSessao(email, lembrar) {
  const sessao = JSON.stringify({ email, entrouEm: Date.now() });
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, sessao);
}
