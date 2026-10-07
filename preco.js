// Cálculo do pedido da Fit Premium — usado pelo site (navegador) e pelo servidor (fitpremium-api).
// O servidor sempre recalcula com este mesmo código: o preço enviado pelo navegador nunca é usado.
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.FIT_PRECO = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const QTD_MAX = 200;

  // Menor preço para n potes de sobremesa: pacotes + avulsos, ou preço fixo nos combos maiores.
  function totalDoces(S, n, combo) {
    if (S.preco == null || !n) return 0;
    if (S.precoNoCombo && combo && combo.marmitas >= S.precoNoCombo.aPartirDe) return n * S.precoNoCombo.preco;
    const melhor = [0];
    for (let i = 1; i <= n; i++) {
      melhor[i] = melhor[i - 1] + S.preco;
      (S.pacotes || []).forEach((p) => { if (i >= p.qtd) melhor[i] = Math.min(melhor[i], melhor[i - p.qtd] + p.preco); });
    }
    return melhor[n];
  }

  const centavos = (v) => Math.round(v * 100) / 100;

  // "Freguesia (Jacarepaguá)" -> "freguesia (jacarepagua)"
  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

  /**
   * Taxa de entrega pelo bairro/cidade. Retorna { atendido, taxa, gratis, bairro, cidade }.
   * Bairro fora da tabela: atendido = false (a equipe combina pelo WhatsApp).
   */
  function taxaEntrega(D, bairro, cidade, marmitas) {
    const E = D.entrega;
    if (!E) return { atendido: false, taxa: null, gratis: false };
    let b = normalizar(bairro);
    const c = normalizar(cidade || 'Rio de Janeiro');
    const apelidos = Object.fromEntries(Object.entries(E.apelidos || {}).map(([k, v]) => [normalizar(k), v]));
    if (apelidos[b]) b = normalizar(apelidos[b]);
    const semParenteses = (t) => t.replace(/\s*\(.*\)\s*/g, '').trim();
    let achado = null;
    for (const f of E.faixas) {
      if (normalizar(f.cidade) !== c) continue;
      const nome = f.bairros.find((x) => normalizar(x) === b) || f.bairros.find((x) => semParenteses(normalizar(x)) === semParenteses(b) && !/\(/.test(b));
      if (nome) { achado = { f, nome }; break; }
    }
    if (!achado) return { atendido: false, taxa: null, gratis: false };
    const gratis = !!achado.f.freteGratisAPartirDe && (marmitas || 0) >= achado.f.freteGratisAPartirDe;
    return { atendido: true, taxa: gratis ? 0 : achado.f.taxa, taxaCheia: achado.f.taxa, gratis, bairro: achado.nome, cidade: achado.f.cidade };
  }

  /**
   * sel = { combo: 1 (avulsas)|10|15|30, itens: {prato: qtd}, leves: {prato: qtd}, extras: {...}, avulsos: {...}, doces: {...} }
   * Retorna linhas com preços do cardápio, subtotal e a lista de erros (vazia quando o pedido é válido).
   */
  function calcularPedido(D, sel) {
    const erros = [];
    const combo = D.combos.find((c) => c.id === Number(sel && sel.combo));
    if (!combo) erros.push('Combo inválido.');

    const categoriaDe = {};
    Object.entries(D.pratos).forEach(([cat, nomes]) => nomes.forEach((n) => (categoriaDe[n] = cat)));
    const precoAvulso = {};
    D.avulsos.forEach((g) => g.itens.forEach((i) => (precoAvulso[i.nome] = i.preco)));
    const S = D.sobremesas;

    const ler = (obj, validos, grupo) => Object.entries(obj || {}).filter(([nome, q]) => {
      if (!validos.includes(nome)) { erros.push(`Item desconhecido em ${grupo}: ${String(nome).slice(0, 60)}`); return false; }
      if (!Number.isInteger(q) || q < 0 || q > QTD_MAX) { erros.push(`Quantidade inválida: ${nome}`); return false; }
      return q > 0;
    });

    // Dois tamanhos com as mesmas receitas, que podem ir juntos no mesmo kit (ex.: casal):
    // itens = 450 g (combo.precos) e leves = 350 g (combo.precosLeve). O peso vai escrito em cada linha do pedido.
    const T = D.tamanhos || {};
    const pesoT = (T.tradicional && T.tradicional.peso) || '450 g';
    const temLeve = !!(T.leve && combo && combo.precosLeve);
    const linha = (nome, qtd, peso, preco) => ({ nome: `${nome} (${peso})`, prato: nome, peso, qtd, preco, total: preco * qtd, categoria: categoriaDe[nome] });
    const tradicionais = ler(sel && sel.itens, Object.keys(categoriaDe), 'marmitas')
      .map(([nome, qtd]) => linha(nome, qtd, pesoT, combo ? combo.precos[categoriaDe[nome]] : 0));
    const pedidosLeves = ler(sel && sel.leves, Object.keys(categoriaDe), 'marmitas de 350 g');
    if (pedidosLeves.length && combo && !temLeve) erros.push('Marmita de 350 g indisponível neste kit.');
    const leves = pedidosLeves.map(([nome, qtd]) => linha(nome, qtd, T.leve ? T.leve.peso : '350 g', temLeve ? combo.precosLeve[categoriaDe[nome]] : 0));
    // Mesma ordem do cardápio, com os dois tamanhos do mesmo prato juntos.
    const ordem = Object.keys(categoriaDe);
    const itens = [...tradicionais, ...leves].sort((a, b) => ordem.indexOf(a.prato) - ordem.indexOf(b.prato));
    // Cardápio sem preço para a categoria/tamanho: recusa (nunca grava total NaN).
    if (combo) itens.filter((l) => typeof l.preco !== 'number' || !Number.isFinite(l.preco)).forEach((l) => erros.push(`Sem preço para ${l.nome}.`));
    const extras = ler(sel && sel.extras, D.extras.pratos, 'camarão')
      .map(([nome, qtd]) => ({ nome, qtd, preco: D.extras.preco, total: D.extras.preco * qtd }));
    const avulsos = ler(sel && sel.avulsos, Object.keys(precoAvulso), 'avulsos')
      .map(([nome, qtd]) => ({ nome, qtd, preco: precoAvulso[nome], total: precoAvulso[nome] * qtd }));
    const doces = ler(sel && sel.doces, S.itens, 'sobremesas')
      .map(([nome, qtd]) => ({ nome, qtd, preco: S.preco, total: (S.preco || 0) * qtd }));

    const totalMarmitas = itens.reduce((a, l) => a + l.qtd, 0);
    // O mesmo prato nos dois tamanhos conta como um prato só (é a mesma receita).
    const pratosDistintos = new Set(itens.map((l) => l.prato)).size;
    const totalAdicionais = [...extras, ...avulsos, ...doces].reduce((a, l) => a + l.qtd, 0);
    if (combo && combo.avulso) {
      // Avulsas: de minimo a marmitas unidades, ou nenhuma marmita quando o pedido é só de adicionais (caldos, sobremesas etc.).
      const soAdicionais = totalMarmitas === 0 && totalAdicionais > 0;
      if (!soAdicionais && (totalMarmitas < combo.minimo || totalMarmitas > combo.marmitas)) erros.push(`Marmitas avulsas: de ${combo.minimo} a ${combo.marmitas} unidades (tem ${totalMarmitas}).`);
    } else if (combo) {
      if (totalMarmitas !== combo.marmitas) erros.push(`O ${combo.nome} precisa de ${combo.marmitas} marmitas (tem ${totalMarmitas}).`);
      if (pratosDistintos > combo.maxPratos) erros.push(`O ${combo.nome} permite até ${combo.maxPratos} pratos diferentes.`);
    }

    const qtdDoces = doces.reduce((a, l) => a + l.qtd, 0);
    const descontoDoces = centavos(qtdDoces * (S.preco || 0) - totalDoces(S, qtdDoces, combo));
    const subtotal = centavos([...itens, ...extras, ...avulsos, ...doces].reduce((a, l) => a + l.total, 0) - descontoDoces);

    return { ok: erros.length === 0, erros, combo, itens, extras, avulsos, doces, descontoDoces, subtotal, totalMarmitas, pratosDistintos };
  }

  return { calcularPedido, totalDoces, taxaEntrega, normalizar };
});
