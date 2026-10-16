// Dados das páginas de Recursos, buscados no servidor (pasta api/).
// Cada página chama BovDados.carregar(...) antes de se montar; depois disso
// as funções devolvem os dados já carregados.

const BovDados = (() => {
  // Mesmas regras da central (CLAUDE.md)
  const LIMITE_TEMP = 39;   // animal com 39 °C ou mais
  const LIMITE_SONS = 3;    // 3 ou mais sons na janela

  // Desenho usado quando o animal foi cadastrado sem imagem
  const IMAGEM_DA_RACA = { 'Nelore': 'boi-nelore.png', 'Gir': 'boi-nelore.png', 'Angus': 'boi-angus.png',
                           'Holandesa': 'boi-angus.png', 'Senepol': 'boi-senepol.png', 'Guzerá': 'boi-guzera.png' };

  let animais = [];
  let vacinas = [];
  let vacinasDoAnimal = {};
  let central = { dono: false, bovino_id: null };
  const leituras = {};   // leituras["5-hoje"] = [...]

  function prepararAnimal(a) {
    a.imagem = a.imagem || IMAGEM_DA_RACA[a.raca] || 'boi-nelore.png';
    return a;
  }

  function lerLocal(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      return valor === null ? padrao : valor;
    } catch (e) {
      return padrao;
    }
  }

  return {
    LIMITE_TEMP,
    LIMITE_SONS,

    // Busca no servidor o que a página precisa:
    //   { animais: true }            lista de animais
    //   { animal: 5 }                um animal com as vacinas + a lista de vacinas
    //   { leituras: 5 } ou null      hoje e ontem (null = média de todos)
    async carregar(o = {}) {
      if (o.animais) {
        animais = (await buscarDoServidor('api/bovinos.php')).map(prepararAnimal);
      }
      if (o.animal !== undefined) {
        const a = prepararAnimal(await buscarDoServidor('api/bovinos.php?id=' + encodeURIComponent(o.animal)));
        animais = [a];
        vacinasDoAnimal[a.id] = a.vacinas || [];
        vacinas = await buscarDoServidor('api/vacinas.php');
        central = await buscarDoServidor('api/central.php');
      }
      if (o.leituras !== undefined) {
        const filtro = o.leituras ? '&bovino=' + encodeURIComponent(o.leituras) : '';
        for (const dia of ['hoje', 'ontem']) {
          leituras[(o.leituras || 'todos') + '-' + dia] = await buscarDoServidor(`api/leituras.php?dia=${dia}${filtro}`);
        }
      }
    },

    animais: () => animais,
    animal: (id) => animais.find(a => a.id === Number(id)),

    // Leituras do dia (da mais recente para a mais antiga); sem id = média de todos
    leituras: (id, dia) => leituras[(id || 'todos') + '-' + dia] || [],

    // "Agora" e "Média" de hoje (null = animal ainda sem leituras)
    resumo(id) {
      const a = this.animal(id);
      return a ? a.resumo : null;
    },

    estado(id) {
      const a = this.animal(id);
      return a ? a.estado : { temperatura: 'Sem dados', vocalizacao: 'Sem dados' };
    },

    // Vacinas
    vacinas: () => vacinas,
    vacinasDoAnimal: (id) => vacinasDoAnimal[id] || [],
    async adicionarVacina(nome) {
      const nova = await enviarParaServidor('api/vacinas.php', { nome });
      vacinas.push(nova);
      return nova;
    },
    async salvarVacinasDoAnimal(id, ids) {
      vacinasDoAnimal[id] = ids;
      await enviarParaServidor('api/vacinas.php', { bovino_id: id, ids });
    },

    // Central: qual animal ela está monitorando e se esta conta pode trocar
    central: () => central,
    async monitorar(id) {
      central = await enviarParaServidor('api/central.php', { bovino_id: id });
    },

    // Sistema de resfriamento: por enquanto só no navegador (o controle pelo
    // site depende das regras que o grupo ainda vai decidir)
    resfriamento: () => lerLocal('bovtrack_resfriamento', { ligado: false, potencia: 100 }),
    salvarResfriamento(estado) {
      try { localStorage.setItem('bovtrack_resfriamento', JSON.stringify(estado)); } catch (e) {}
    },

    // Registro de gastos: ilustrativo (o hardware não mede consumo)
    gastos: () => [
      { mes: 'Abril', reais: 220, kwh: 366 },
      { mes: 'Março', reais: 520, kwh: 853 },
      { mes: 'Fevereiro', reais: 430, kwh: 716 },
      { mes: 'Janeiro', reais: 480, kwh: 800 }
    ]
  };
})();
