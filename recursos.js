// Monta as páginas de Recursos a partir do BovDados (recursos-dados.js).
// Cada página diz qual é no <body data-pagina="...">.

const ICONES = {
  // carbon:temperature-max (espelhado como no Figma)
  temperatura: '<svg class="ico-temp" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M20 10h7v2h-7zm0 6h10v2H20zm0 6h7v2h-7zm-10-1.816V7H8v13.184a3 3 0 1 0 2 0"/><path fill="currentColor" d="M30 4H12.974A4.983 4.983 0 0 0 4 7v11.11a7 7 0 1 0 10 0V7a5 5 0 0 0-.101-1H30ZM9 28a4.993 4.993 0 0 1-3.332-8.718L6 18.983V7a3 3 0 0 1 6 0v11.983l.332.299A4.993 4.993 0 0 1 9 28"/></svg>',
  // mingcute:voice-line
  vocalizacao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4 10v4m4-7v10m4-13v16m4-13v10m4-7v4"/></svg>',
  // material-symbols-light:mode-fan
  ventilador: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.716 20.808q-.968 0-1.476-.58q-.51-.58-.51-1.305q0-.496.211-.974t.676-.782q.57-.388.945-1.044t.56-1.454q-.247-.094-.484-.217q-.236-.123-.457-.32l-2.339.845q-.367.13-.7.211t-.68.081q-1.287 0-2.278-1.163t-.992-3.39q0-.968.57-1.477q.57-.508 1.29-.508q.515 0 .996.21q.48.211.785.676q.388.57 1.044.945t1.454.56q.094-.247.217-.484q.123-.236.32-.457l-.845-2.339q-.13-.348-.212-.69q-.08-.343-.08-.666q0-1.523 1.327-2.408q1.326-.886 3.226-.886q.968 0 1.476.57q.51.57.51 1.29q0 .477-.211.967t-.676.794q-.57.389-.946 1.054q-.376.666-.558 1.464q.265.113.502.236q.236.123.438.3l2.339-.869q.367-.13.687-.199t.668-.068q1.66 0 2.477 1.405q.818 1.406.818 3.148q0 .968-.608 1.476q-.608.51-1.352.51q-.471 0-.924-.211t-.757-.676q-.388-.57-1.044-.946t-1.454-.558q-.094.246-.217.473t-.32.467l.845 2.339q.13.342.211.656q.081.315.081.619q-.013 1.298-1.167 2.336q-1.154 1.039-3.387 1.039m1.285-7q.76 0 1.284-.524q.524-.525.524-1.284t-.524-1.284T12 10.192t-1.284.524T10.192 12t.524 1.284t1.284.524"/></svg>',
  // meteor-icons:wind
  vento: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5a3 3 0 1 1 3 3H2m2 11a3 3 0 1 0 3-3H2m14-1a3 3 0 1 0 3-3H2"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="m15 5-7 7 7 7"/></svg>',
  busca: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  mais: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"/></svg>'
};

// ---------- Ajudantes ----------
function el(id) {
  return document.getElementById(id);
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function numero(valor, casas = 1) {
  return valor.toFixed(casas).replace('.', ',');
}

// "1 som", "2 sons", "1,5 sons"
function sons(valor, casas = 0) {
  return `${numero(valor, casas)} ${Number(valor) === 1 ? 'som' : 'sons'}`;
}

function parametro(nome) {
  return new URLSearchParams(location.search).get(nome);
}

function idade(nascimento) {
  const n = new Date(nascimento + 'T00:00:00');
  const hoje = new Date();
  let meses = (hoje.getFullYear() - n.getFullYear()) * 12 + hoje.getMonth() - n.getMonth();
  if (hoje.getDate() < n.getDate()) meses--;
  if (meses < 12) return meses === 1 ? '1 mês' : `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const txtAnos = anos === 1 ? '1 ano' : `${anos} anos`;
  return resto ? `${txtAnos} e ${resto === 1 ? '1 mês' : resto + ' meses'}` : txtAnos;
}

// Card de um animal. "rodape" decide o que aparece embaixo:
// 'estado' = Regular/Irregular, 'temperatura' ou 'vocalizacao' = Agora/Média
function cardAnimal(a, rodape, href) {
  let base;
  if (rodape === 'estado') {
    const e = BovDados.estado(a.id);
    base = `
      <span class="boi-card__estado ${e.temperatura === 'Irregular' ? 'is-irregular' : ''}">${ICONES.temperatura}${e.temperatura}</span>
      <span class="boi-card__estado ${e.vocalizacao === 'Irregular' ? 'is-irregular' : ''}">${ICONES.vocalizacao}${e.vocalizacao}</span>`;
  } else {
    const r = BovDados.resumo(a.id);
    const agora = !r ? '--' : rodape === 'temperatura' ? numero(r.tempAgora) + '°' : r.sonsAgora;
    const media = !r ? '--' : rodape === 'temperatura' ? numero(r.tempMedia) + '°' : numero(r.sonsMedia);
    base = `
      <span class="boi-card__valor"><small>Agora</small>${agora}</span>
      <span class="boi-card__valor"><small>Média</small>${media}</span>`;
  }

  const tag = href ? 'a' : 'div';
  return `
    <${tag} class="boi-card" ${href ? `href="${href}"` : ''}>
      <img class="boi-card__img" src="assetsbovtrack/recursos/${a.imagem}" alt="">
      <div class="boi-card__info">
        <p class="boi-card__num">N° ${escapar(a.numero)}</p>
        <p class="boi-card__nome">${escapar(a.nome)}</p>
        <p class="boi-card__raca">${escapar(a.raca)}</p>
        <div class="boi-card__rodape">${base}</div>
      </div>
    </${tag}>`;
}

// ---------- Páginas ----------
const PAGINAS = {
  // Recursos: gráfico com a situação dos animais
  inicio() {
    const contagem = { regular: 0, vocalizacao: 0, temperatura: 0, total: 0 };
    BovDados.animais().forEach(a => {
      const e = BovDados.estado(a.id);
      if (e.temperatura === 'Sem dados') return;  // animal ainda sem leituras
      const t = e.temperatura === 'Irregular';
      const v = e.vocalizacao === 'Irregular';
      if (t && v) contagem.total++;
      else if (t) contagem.temperatura++;
      else if (v) contagem.vocalizacao++;
      else contagem.regular++;
    });

    const series = [
      { nome: 'Estado regular', valor: contagem.regular, cor: 'regular' },
      { nome: 'Vocalização irregular', valor: contagem.vocalizacao, cor: 'voc' },
      { nome: 'Temperatura irregular', valor: contagem.temperatura, cor: 'temp' },
      { nome: 'Totalmente irregular', valor: contagem.total, cor: 'total' }
    ];
    const maior = Math.max(1, ...series.map(s => s.valor));

    el('grafico').innerHTML = `
      <ul class="grafico__legenda">
        ${series.map(s => `<li><span class="grafico__cor grafico__cor--${s.cor}"></span>${s.nome}</li>`).join('')}
      </ul>
      <div class="grafico__barras" role="img"
           aria-label="${series.map(s => `${s.nome}: ${s.valor}`).join(', ')}">
        ${series.map(s => `
          <div class="grafico__coluna">
            <span class="grafico__valor">${s.valor}</span>
            <span class="grafico__barra grafico__cor--${s.cor}" style="height:${(s.valor / maior) * 100}%"></span>
          </div>`).join('')}
      </div>`;
  },

  // Registros: lista de animais com busca
  registros() {
    const lista = el('lista-animais');
    const vazio = el('lista-vazia');

    function desenhar(filtro) {
      const termo = filtro.trim().toLowerCase();
      const achados = BovDados.animais().filter(a =>
        a.nome.toLowerCase().includes(termo) ||
        a.numero.includes(termo) ||
        a.raca.toLowerCase().includes(termo));
      lista.innerHTML = achados.map(a => cardAnimal(a, 'estado', `animal.html?id=${a.id}`)).join('');
      vazio.hidden = achados.length > 0;
      vazio.innerHTML = BovDados.animais().length
        ? 'Nenhum animal encontrado.'
        : 'Nenhum animal cadastrado ainda. <a href="cadastrar-animal.html">+ Cadastrar animal</a>';
    }

    el('busca').addEventListener('input', (e) => desenhar(e.target.value));
    desenhar('');
  },

  // Registro animal: dados, vacinas e atalhos para os históricos
  animal() {
    const a = BovDados.animais()[0];
    document.title = `${a.nome} - Bovtrack`;

    el('card-animal').innerHTML = cardAnimal(a, 'estado');
    el('link-temp').href = `historico.html?tipo=temperatura&id=${a.id}`;
    el('link-voc').href = `historico.html?tipo=vocalizacao&id=${a.id}`;
    el('link-editar').href = `cadastrar-animal.html?id=${a.id}`;

    // Central: etiqueta "Monitorado pela central" e botão Monitorar/Parar
    // (o botão só aparece para a conta dona da central)
    const btnMonitorar = el('btn-monitorar');
    function desenharMonitor() {
      const c = BovDados.central();
      const monitorado = c.bovino_id === a.id;
      el('monitor').hidden = !c.dono && !monitorado;
      el('monitor-etiqueta').hidden = !monitorado;
      btnMonitorar.hidden = !c.dono;
      btnMonitorar.textContent = monitorado ? 'Parar de monitorar' : 'Monitorar com a central';
    }
    btnMonitorar.addEventListener('click', async () => {
      btnMonitorar.disabled = true;
      try {
        await BovDados.monitorar(BovDados.central().bovino_id === a.id ? null : a.id);
      } catch (err) {
        alert('Não foi possível trocar o animal da central: ' + err.message);
      }
      btnMonitorar.disabled = false;
      desenharMonitor();
    });
    desenharMonitor();

    const dados = [
      ['Idade', a.nascimento ? idade(a.nascimento) : '--'],
      ['Gênero', a.sexo || '--'],
      ['Altura', a.altura ? numero(a.altura, 2) + 'm' : '--'],
      ['Peso', a.peso ? `${numero(a.peso, a.peso % 1 ? 1 : 0)} Arrobas` : '--'],
      ['Categoria', a.categoria || '--']
    ];
    el('dados-animal').innerHTML = dados.map(([rotulo, valor]) =>
      `<div class="ficha__linha"><dt>${rotulo}:</dt><dd>${escapar(valor)}</dd></div>`).join('');

    const listaVacinas = el('vacinas');

    function desenharVacinas() {
      const marcadas = BovDados.vacinasDoAnimal(a.id);
      listaVacinas.innerHTML = BovDados.vacinas().map(v => `
        <li>
          <label class="vacina">
            <input type="checkbox" value="${v.id}" ${marcadas.includes(v.id) ? 'checked' : ''}>
            <span>${escapar(v.nome)}</span>
          </label>
        </li>`).join('');
    }

    listaVacinas.addEventListener('change', async () => {
      const ids = [...listaVacinas.querySelectorAll('input:checked')].map(i => Number(i.value));
      try {
        await BovDados.salvarVacinasDoAnimal(a.id, ids);
      } catch (err) {
        alert('Não foi possível salvar as vacinas: ' + err.message);
      }
    });

    const form = el('form-vacina');
    el('btn-add-vacina').addEventListener('click', () => {
      form.hidden = false;
      form.nome.focus();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      if (!nome) return;
      try {
        const nova = await BovDados.adicionarVacina(nome);
        await BovDados.salvarVacinasDoAnimal(a.id, BovDados.vacinasDoAnimal(a.id).concat(nova.id));
      } catch (err) {
        return alert('Não foi possível adicionar a vacina: ' + err.message);
      }
      form.reset();
      form.hidden = true;
      desenharVacinas();
    });
    form.querySelector('[data-cancelar]').addEventListener('click', () => {
      form.reset();
      form.hidden = true;
    });

    desenharVacinas();
  },

  // Dados de temperatura / vocalização: um card por animal com Agora e Média
  dados() {
    const tipo = document.body.dataset.tipo;
    const animais = BovDados.animais();
    el('lista-animais').innerHTML = animais.length
      ? animais.map(a => cardAnimal(a, tipo, `historico.html?tipo=${tipo}&id=${a.id}`)).join('')
      : '<p class="rec-vazio">Nenhum animal cadastrado ainda. <a href="cadastrar-animal.html">+ Cadastrar animal</a></p>';
  },

  // Histórico: Hoje e Ontem, de um animal ou a média de todos
  historico() {
    const tipo = parametro('tipo') === 'vocalizacao' ? 'vocalizacao' : 'temperatura';
    const a = BovDados.animal(parametro('id'));
    const ehTemp = tipo === 'temperatura';

    const titulo = (ehTemp ? 'Dados de temperatura' : 'Dados de vocalização') + (a ? ` · ${a.nome}` : '');
    el('titulo').textContent = titulo;
    document.title = `${titulo} - Bovtrack`;
    el('voltar').href = a ? `animal.html?id=${a.id}` : (ehTemp ? 'temperatura.html' : 'vocalizacao.html');

    const subtitulo = (a ? `${a.nome} · N° ${a.numero}` : 'Média de todos os bois') + ' · média a cada 30 min';

    function painel(dia, nomeDia) {
      const linhas = BovDados.leituras(a ? a.id : null, dia).map(l => {
        // Bloco de 30 min: mostra a média e marca o alerta se alguma leitura passou do limite
        const irregular = ehTemp ? l.tempMax >= BovDados.LIMITE_TEMP : l.sonsMax >= BovDados.LIMITE_SONS;
        const valor = ehTemp ? numero(l.temp) + '°' : sons(l.sons, l.sons % 1 ? 1 : 0);
        return `
          <li class="${irregular ? 'is-irregular' : ''}">
            <span class="historico__hora">${irregular ? '<span class="historico__alerta" title="Irregular"></span>' : ''}${l.hora}</span>
            <span class="historico__linha"></span>
            <span class="historico__valor">${valor}${irregular ? '<span class="visually-hidden"> (irregular)</span>' : ''}</span>
          </li>`;
      }).join('');
      return `
        <section class="historico__painel">
          <h2>${nomeDia} <small>${escapar(subtitulo)}</small></h2>
          <ul>${linhas || '<li class="historico__vazio">Sem leituras neste dia.</li>'}</ul>
        </section>`;
    }

    el('historico').innerHTML = painel('hoje', 'Hoje') + painel('ontem', 'Ontem');
  },

  // Sistema de resfriamento: ligar/desligar, potência e gastos
  resfriamento() {
    const estado = BovDados.resfriamento();
    const botao = el('btn-ligar');
    const texto = el('txt-ligar');
    const botoesPotencia = [...document.querySelectorAll('.potencia__btn')];

    function atualizar() {
      botao.setAttribute('aria-pressed', estado.ligado);
      botao.classList.toggle('is-ligado', estado.ligado);
      texto.textContent = estado.ligado ? 'Desligar sistema de resfriamento' : 'Ligar sistema de resfriamento';
      botoesPotencia.forEach(b => {
        const ativo = Number(b.dataset.valor) === estado.potencia;
        b.classList.toggle('is-ativo', ativo);
        b.setAttribute('aria-pressed', ativo);
      });
      BovDados.salvarResfriamento(estado);
    }

    botao.addEventListener('click', () => {
      estado.ligado = !estado.ligado;
      atualizar();
    });
    botoesPotencia.forEach(b => b.addEventListener('click', () => {
      estado.potencia = Number(b.dataset.valor);
      atualizar();
    }));
    atualizar();

    // Sugestão: algum animal com 39 °C ou mais e o sistema desligado
    function sugerir() {
      const quentes = BovDados.animais().filter(a => a.estado.temperatura === 'Irregular');
      const aviso = el('sugestao');
      aviso.hidden = !quentes.length || estado.ligado;
      if (aviso.hidden) return;
      const nomes = quentes.map(a => `${escapar(a.nome)} (${numero(a.resumo.tempAgora)}°)`).join(', ');
      aviso.innerHTML = `${ICONES.temperatura}<span><strong>Temperatura irregular:</strong> ${nomes}. ` +
        `Sugerimos ligar o sistema de resfriamento.</span>`;
    }
    botao.addEventListener('click', sugerir);
    sugerir();
    PAGINAS.resfriamento.atualizar = sugerir;

    const gastos = BovDados.gastos();
    const maiorReais = Math.max(...gastos.map(g => g.reais));
    const maiorKwh = Math.max(...gastos.map(g => g.kwh));
    el('gastos').innerHTML = gastos.map((g, i) => `
      <li class="gastos__linha gastos__linha--${i}">
        <span class="gastos__mes" style="width:${60 + (g.reais / maiorReais) * 60}px">${g.mes}</span>
        <span class="gastos__texto">R$ ${g.reais} - ${g.kwh}kWh</span>
        <span class="gastos__barra" style="width:${30 + (g.kwh / maiorKwh) * 70}px"></span>
      </li>`).join('');
  }
};

// O que cada página precisa buscar no servidor antes de se montar
const CARREGAR = {
  inicio: () => ({ animais: true }),
  registros: () => ({ animais: true }),
  dados: () => ({ animais: true }),
  animal: () => ({ animal: parametro('id') }),
  resfriamento: () => ({ animais: true }),
  historico: () => (parametro('id') ? { animal: parametro('id'), leituras: parametro('id') } : { leituras: null })
};

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('[data-icone]').forEach(span => {
    span.innerHTML = ICONES[span.dataset.icone] || '';
  });

  const nome = document.body.dataset.pagina;
  const pagina = PAGINAS[nome];
  if (!pagina) return;

  // As páginas de Recursos são só para quem está logado
  exigirLogin();
  if (!estaLogado()) return;

  if (CARREGAR[nome]) {
    try {
      await BovDados.carregar(CARREGAR[nome]());
    } catch (err) {
      const main = document.querySelector('main.rec');
      const aviso = document.createElement('p');
      aviso.className = 'rec-vazio rec-erro';
      aviso.setAttribute('role', 'alert');
      aviso.textContent = err.message;
      main.appendChild(aviso);
      return;
    }
  }
  pagina();

  // Páginas com leituras se atualizam sozinhas a cada 1 minuto
  // (a central manda uma leitura nova por minuto)
  const redesenhar = { inicio: pagina, dados: pagina, historico: pagina, resfriamento: () => pagina.atualizar() }[nome];
  if (redesenhar) {
    setInterval(async () => {
      if (document.hidden) return;
      try {
        await BovDados.carregar(CARREGAR[nome]());
        redesenhar();
      } catch (err) { /* tenta de novo no próximo minuto */ }
    }, 60000);
  }
});
