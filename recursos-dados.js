// Dados de exemplo das páginas de Recursos.
// Quando o backend (servidor.js) estiver pronto, estas funções passam a
// buscar os mesmos dados em /api/... e o resto das páginas não muda.

const BovDados = (() => {
  // Mesmos animais do banco de exemplo (backend/banco.sql)
  const animais = [
    { id: 1, numero: '40028922', nome: 'Bartolomeu', raca: 'Nelore', imagem: 'boi-nelore.png',
      nascimento: '2026-02-01', sexo: 'Macho', altura: 1.76, peso: 15, categoria: 'Corte', vacinas: [1, 2, 3, 4] },
    { id: 2, numero: '85565927', nome: 'Baltazar IV', raca: 'Angus', imagem: 'boi-angus.png',
      nascimento: '2025-08-15', sexo: 'Macho', altura: 1.62, peso: 18, categoria: 'Corte', vacinas: [1, 3] },
    { id: 3, numero: '65524488', nome: 'Genevive', raca: 'Senepol', imagem: 'boi-senepol.png',
      nascimento: '2025-11-03', sexo: 'Fêmea', altura: 1.48, peso: 13, categoria: 'Leite', vacinas: [1, 2, 3] },
    { id: 4, numero: '40028923', nome: 'Nicolau', raca: 'Guzerá', imagem: 'boi-guzera.png',
      nascimento: '2025-05-20', sexo: 'Macho', altura: 1.70, peso: 20, categoria: 'Corte', vacinas: [3, 4] }
  ];

  const vacinasPadrao = [
    { id: 1, nome: 'Brucelose (B19/RB51)' },
    { id: 2, nome: 'Clostridioses' },
    { id: 3, nome: 'Febre Aftosa' },
    { id: 4, nome: 'Raiva dos Herbívoros' }
  ];

  // Leituras de hoje (uma a cada 30 min, das 08:00 às 12:30) e de ontem.
  // Cada par é [temperatura do animal em °C, sons no período].
  const leituras = {
    1: { hoje: [[38.2, 1], [38.4, 0], [38.1, 2], [38.6, 1], [38.9, 2], [38.7, 1], [38.5, 0], [39.1, 2], [38.8, 3], [38.6, 4]],
         ontem: [[38.4, 1], [38.9, 1], [39.4, 2]] },
    2: { hoje: [[38.0, 0], [38.3, 1], [38.5, 1], [38.4, 0], [38.6, 1], [38.8, 2], [38.7, 1], [38.9, 1], [38.6, 2], [38.5, 1]],
         ontem: [[38.2, 1], [38.5, 0], [38.7, 1]] },
    3: { hoje: [[38.6, 1], [38.9, 1], [39.2, 2], [39.4, 1], [39.0, 2], [39.3, 1], [39.5, 2], [39.1, 1], [39.6, 2], [39.2, 1]],
         ontem: [[39.0, 1], [39.6, 1], [40.1, 2]] },
    4: { hoje: [[38.4, 2], [38.5, 3], [38.7, 3], [38.9, 4], [38.6, 3], [38.8, 4], [39.2, 5], [38.9, 4], [38.7, 2], [38.6, 4]],
         ontem: [[38.7, 3], [39.2, 3], [39.8, 4]] }
  };
  const HORAS = {
    hoje: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
    ontem: ['12:00', '12:30', '13:00']
  };

  // Mesmas regras da central (CLAUDE.md)
  const LIMITE_TEMP = 39;   // animal com 39 °C ou mais
  const LIMITE_SONS = 3;    // 3 ou mais sons na janela

  function lista(id, dia) {
    return leituras[id][dia].map(([temp, sons], i) => ({ hora: HORAS[dia][i], temp, sons }));
  }

  function media(valores) {
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }

  function lerLocal(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      return valor === null ? padrao : valor;
    } catch (e) {
      return padrao;
    }
  }

  function salvarLocal(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
  }

  return {
    LIMITE_TEMP,
    LIMITE_SONS,

    animais: () => animais,
    animal: (id) => animais.find(a => a.id === Number(id)),

    // Leituras do dia, da mais recente para a mais antiga.
    // Sem id, devolve a média de todos os bois em cada horário.
    leituras(id, dia) {
      if (id) return lista(id, dia).reverse();
      return HORAS[dia].map((hora, i) => ({
        hora,
        temp: media(animais.map(a => lista(a.id, dia)[i].temp)),
        sons: media(animais.map(a => lista(a.id, dia)[i].sons))
      })).reverse();
    },

    // "Agora" (última leitura) e "Média" do dia
    resumo(id) {
      const hoje = lista(id, 'hoje');
      const ultima = hoje[hoje.length - 1];
      return {
        tempAgora: ultima.temp,
        tempMedia: media(hoje.map(l => l.temp)),
        sonsAgora: ultima.sons,
        sonsMedia: media(hoje.map(l => l.sons))
      };
    },

    // Regular / Irregular pela última leitura
    estado(id) {
      const r = this.resumo(id);
      return {
        temperatura: r.tempAgora >= LIMITE_TEMP ? 'Irregular' : 'Regular',
        vocalizacao: r.sonsAgora >= LIMITE_SONS ? 'Irregular' : 'Regular'
      };
    },

    // Vacinas padrão + as criadas em "Adicionar vacina" (no navegador por enquanto)
    vacinas() {
      return vacinasPadrao.concat(lerLocal('bovtrack_vacinas_extras', []));
    },
    adicionarVacina(nome) {
      const extras = lerLocal('bovtrack_vacinas_extras', []);
      const nova = { id: Math.max(...this.vacinas().map(v => v.id)) + 1, nome };
      salvarLocal('bovtrack_vacinas_extras', extras.concat(nova));
      return nova;
    },
    vacinasDoAnimal(id) {
      return lerLocal('bovtrack_vacinas_' + id, this.animal(id).vacinas);
    },
    salvarVacinasDoAnimal(id, ids) {
      salvarLocal('bovtrack_vacinas_' + id, ids);
    },

    // Sistema de resfriamento (por enquanto só no navegador)
    resfriamento: () => lerLocal('bovtrack_resfriamento', { ligado: false, potencia: 100 }),
    salvarResfriamento: (estado) => salvarLocal('bovtrack_resfriamento', estado),

    gastos: () => [
      { mes: 'Abril', reais: 220, kwh: 366 },
      { mes: 'Março', reais: 520, kwh: 853 },
      { mes: 'Fevereiro', reais: 430, kwh: 716 },
      { mes: 'Janeiro', reais: 480, kwh: 800 }
    ]
  };
})();
