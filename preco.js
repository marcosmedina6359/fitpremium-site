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

  /**
   * sel = { combo: 7|15|30, itens: {prato: qtd}, extras: {...}, avulsos: {...}, doces: {...} }
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

    const itens = ler(sel && sel.itens, Object.keys(categoriaDe), 'marmitas').map(([nome, qtd]) => {
      const preco = combo ? combo.precos[categoriaDe[nome]] : 0;
      return { nome, qtd, preco, total: preco * qtd, categoria: categoriaDe[nome] };
    });
    const extras = ler(sel && sel.extras, D.extras.pratos, 'camarão')
      .map(([nome, qtd]) => ({ nome, qtd, preco: D.extras.preco, total: D.extras.preco * qtd }));
    const avulsos = ler(sel && sel.avulsos, Object.keys(precoAvulso), 'avulsos')
      .map(([nome, qtd]) => ({ nome, qtd, preco: precoAvulso[nome], total: precoAvulso[nome] * qtd }));
    const doces = ler(sel && sel.doces, S.itens, 'sobremesas')
      .map(([nome, qtd]) => ({ nome, qtd, preco: S.preco, total: (S.preco || 0) * qtd }));

    const totalMarmitas = itens.reduce((a, l) => a + l.qtd, 0);
    const pratosDistintos = itens.length;
    if (combo) {
      if (totalMarmitas !== combo.marmitas) erros.push(`O combo de ${combo.marmitas} precisa de ${combo.marmitas} marmitas (tem ${totalMarmitas}).`);
      if (pratosDistintos > combo.maxPratos) erros.push(`O combo de ${combo.marmitas} permite até ${combo.maxPratos} pratos diferentes.`);
    }

    const qtdDoces = doces.reduce((a, l) => a + l.qtd, 0);
    const descontoDoces = centavos(qtdDoces * (S.preco || 0) - totalDoces(S, qtdDoces, combo));
    const subtotal = centavos([...itens, ...extras, ...avulsos, ...doces].reduce((a, l) => a + l.total, 0) - descontoDoces);

    return { ok: erros.length === 0, erros, combo, itens, extras, avulsos, doces, descontoDoces, subtotal, totalMarmitas, pratosDistintos };
  }

  return { calcularPedido, totalDoces };
});
