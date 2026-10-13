// Tela "Cadastrar animal": carrega as raças e envia o formulário ao servidor.

exigirLogin();

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-animal');
  const erro = document.getElementById('erro');
  const botao = form.querySelector('.form-animal__btn');
  const selectRaca = document.getElementById('raca');

  // Imagem sugerida para cada raça (a pessoa pode trocar)
  const IMAGEM_DA_RACA = { 'Nelore': 'boi-nelore.png', 'Gir': 'boi-nelore.png', 'Angus': 'boi-angus.png',
                           'Holandesa': 'boi-angus.png', 'Senepol': 'boi-senepol.png', 'Guzerá': 'boi-guzera.png' };

  function mostrarErro(msg) {
    erro.textContent = msg;
    erro.hidden = false;
    botao.disabled = false;
  }

  try {
    const racas = await buscarDoServidor('api/racas.php');
    if (!Array.isArray(racas)) throw new Error('Não foi possível conectar ao servidor.');
    selectRaca.innerHTML = '<option value="">Escolha a raça</option>' +
      racas.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
  } catch (e) {
    selectRaca.innerHTML = '<option value="">Erro ao carregar</option>';
    return mostrarErro(e.message);
  }

  // A mensagem de erro some quando a pessoa volta a preencher
  form.addEventListener('input', () => { erro.hidden = true; });

  selectRaca.addEventListener('change', () => {
    const nome = selectRaca.options[selectRaca.selectedIndex].text;
    const radio = form.querySelector(`input[name="imagem"][value="${IMAGEM_DA_RACA[nome]}"]`);
    if (radio) radio.checked = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erro.hidden = true;
    botao.disabled = true;

    const dados = Object.fromEntries(new FormData(form));
    if (!dados.numero.trim()) return mostrarErro('Digite o número do animal.');
    if (!dados.nome.trim()) return mostrarErro('Digite o nome do animal.');
    if (!dados.raca_id) return mostrarErro('Escolha a raça.');

    try {
      await enviarParaServidor('api/bovinos.php', dados);
    } catch (err) {
      if (/login/i.test(err.message)) return window.location.replace('login.html');
      return mostrarErro(err.message);
    }
    window.location.href = 'registros.html';
  });
});
