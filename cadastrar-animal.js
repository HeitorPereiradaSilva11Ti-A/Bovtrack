// Tela "Cadastrar animal": carrega as raças e envia o formulário ao servidor.
// Com ?id=5 na URL, a mesma tela edita (e pode excluir) o animal 5.

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

  // Modo edição: preenche o formulário com os dados do animal
  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    let a;
    try {
      a = await buscarDoServidor('api/bovinos.php?id=' + encodeURIComponent(id));
    } catch (e) {
      return mostrarErro(e.message);
    }
    document.title = 'Editar animal - Bovtrack';
    document.getElementById('titulo').textContent = 'Editar animal';
    document.getElementById('voltar').href = `animal.html?id=${a.id}`;
    botao.textContent = 'Salvar alterações';

    form.numero.value = a.numero;
    form.nome.value = a.nome;
    form.raca_id.value = a.raca_id;
    form.nascimento.value = a.nascimento || '';
    form.sexo.value = a.sexo === 'Fêmea' ? 'femea' : a.sexo === 'Macho' ? 'macho' : '';
    form.categoria.value = (a.categoria || '').toLowerCase();
    form.altura.value = a.altura ?? '';
    form.peso.value = a.peso ?? '';
    const radio = form.querySelector(`input[name="imagem"][value="${a.imagem}"]`);
    if (radio) radio.checked = true;

    const excluir = document.getElementById('btn-excluir');
    excluir.hidden = false;
    excluir.addEventListener('click', async () => {
      if (!confirm(`Excluir ${a.nome}? As leituras e vacinas desse animal também serão apagadas.`)) return;
      excluir.disabled = true;
      try {
        await enviarParaServidor('api/bovinos.php', { id: a.id, excluir: true });
      } catch (err) {
        excluir.disabled = false;
        return mostrarErro(err.message);
      }
      window.location.href = 'registros.html';
    });
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
    if (id) dados.id = id;
    if (!dados.numero.trim()) return mostrarErro('Digite o número do animal.');
    if (!dados.nome.trim()) return mostrarErro('Digite o nome do animal.');
    if (!dados.raca_id) return mostrarErro('Escolha a raça.');

    try {
      await enviarParaServidor('api/bovinos.php', dados);
    } catch (err) {
      if (/login/i.test(err.message)) return window.location.replace('login.html');
      return mostrarErro(err.message);
    }
    window.location.href = id ? `animal.html?id=${id}` : 'registros.html';
  });
});
