(() => {
  const D = window.FIT_DADOS;
  const medir = (evento, dados) => window.FIT_MEDICAO?.(evento, dados);
  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  // Valor curto para chamadas de marketing: "R$ 30" em vez de "R$ 30,00".
  const brlC = (v) => (Number.isInteger(v) ? `R$ ${v}` : brl(v));
  const categorias = Object.keys(D.pratos);
  const categoriaDe = {};
  categorias.forEach((c) => D.pratos[c].forEach((p) => (categoriaDe[p] = c)));

  // ---------- Estado ----------
  const CHAVE = 'fitpremium-pedido';
  // itens = marmitas de 450 g, leves = marmitas de 350 g (mesmos pratos; podem ir juntas no mesmo kit).
  let estado = { combo: 15, itens: {}, leves: {}, extras: {}, doces: {}, avulsos: {}, filtro: 'Todos' };
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && D.combos.some((c) => c.id === salvo.combo)) estado = { ...estado, ...salvo, filtro: 'Todos' };
  } catch {}
  // Descarta pratos salvos que saíram do cardápio ou mudaram de nome.
  const filtrar = (obj, validos) => Object.fromEntries(Object.entries(obj || {}).filter(([p, q]) => validos.includes(p) && q > 0));
  estado.itens = filtrar(estado.itens, Object.keys(categoriaDe));
  estado.leves = filtrar(estado.leves, Object.keys(categoriaDe));
  estado.extras = filtrar(estado.extras, D.extras.pratos);
  estado.doces = filtrar(estado.doces, D.sobremesas.itens);
  const precoAvulso = {};
  D.avulsos.forEach((g) => g.itens.forEach((i) => (precoAvulso[i.nome] = i.preco)));
  estado.avulsos = filtrar(estado.avulsos, Object.keys(precoAvulso));
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch {} };

  const combo = () => D.combos.find((c) => c.id === estado.combo);
  const soma = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const totalTradicionais = () => soma(estado.itens), totalLeves = () => soma(estado.leves);
  const totalMarmitas = () => totalTradicionais() + totalLeves();
  // O mesmo prato em 450 g e 350 g conta como um prato só.
  const pratosDistintos = () => new Set([...Object.keys(estado.itens), ...Object.keys(estado.leves)]).size;
  const T = D.tamanhos || { tradicional: { peso: '450 g' }, leve: { peso: '350 g', descricao: 'porção menor' } };
  const P450 = T.tradicional.peso, P300 = T.leve.peso;
  // Preço de 350 g do kit (null quando o kit não tem 350 g: o site esconde essa opção em vez de quebrar).
  const pl = (c, cat) => (c && c.precosLeve && typeof c.precosLeve[cat] === 'number' ? c.precosLeve[cat] : null);
  const brlOu = (v) => (v == null ? '—' : brl(v));
  const minimo = (lista) => { const v = lista.filter((x) => typeof x === 'number'); return v.length ? Math.min(...v) : null; };
  const totalExtras = () => [...Object.values(estado.extras), ...Object.values(estado.doces), ...Object.values(estado.avulsos)].reduce((a, b) => a + b, 0);
  const S = D.sobremesas;
  const precoDoce = () => (S.preco == null ? 'valor a confirmar' : brl(S.preco));
  // Texto das ofertas, ex.: "R$ 20,90 cada" ou "1 por R$ 20,90 · 2 por R$ 32 · 3 por R$ 45"
  const listaOfertas = () => (S.pacotes || []).length
    ? [`1 por ${brl(S.preco)}`, ...[...S.pacotes].sort((a, b) => a.qtd - b.qtd).map((p) => `${p.qtd} por ${brl(p.preco)}`)]
    : [`${brl(S.preco)} cada`];
  const ofertasDoces = () => S.preco == null ? 'valor a confirmar' : listaOfertas().join(' · ');
  const ofertaCombo = () => S.precoNoCombo ? `${brl(S.precoNoCombo.preco)} cada nos kits de ${S.precoNoCombo.aPartirDe} ou mais marmitas` : '';
  const menorPreco = (c) => Math.min(...Object.values(c.precos), ...Object.values(c.precosLeve || {}));

  // ---------- Cards de combos ----------
  const AVULSA = D.combos.find((c) => c.avulso);
  const combosReais = D.combos.filter((c) => !c.avulso);
  // Economia do combo em relação a comprar as mesmas marmitas avulsas (frango).
  const economia = (c) => (AVULSA ? (AVULSA.precos.Frango - c.precos.Frango) * c.marmitas : 0);
  $('#lista-combos').innerHTML = combosReais.map((c) => `
    <article class="combo${c.destaque ? ' destaque' : ''}">
      ${c.destaque ? `<span class="tag">${c.destaque}</span>` : ''}
      <div class="qtd">${c.marmitas}<small>marmitas</small></div>
      <h3>${c.nome}</h3>
      <p class="sub">Até ${c.maxPratos} pratos diferentes</p>
      <p class="beneficio">Kit a partir de ${brl(menorPreco(c) * c.marmitas)}${c.freteGratis ? ' com entrega grátis' : ' + R$ 10 de entrega'}</p>
      <p class="sub">Valor mínimo para frango de ${pl(c, 'Frango') != null ? P300 : P450}, em Jacarepaguá.</p>
      <table class="tabela-precos">
        <tr class="cab"><td>Por marmita</td><td>${P450}</td><td>${P300}</td></tr>
        <tr><td>Frango</td><td>${brl(c.precos.Frango)}</td><td>${brlOu(pl(c, 'Frango'))}</td></tr>
        <tr><td>Carne ou peixe</td><td>${brl(c.precos.Carne)}</td><td>${brlOu(pl(c, 'Carne'))}</td></tr>
      </table>
      <p class="sub">Pode misturar ${P450} e ${P300} no mesmo kit</p>
      ${economia(c) > 0 ? `<p class="economia">Economize até ${brl(economia(c))}</p>` : ''}
      <p class="beneficio${c.freteGratis ? '' : ' neutro'}">${c.freteGratis ? 'Frete grátis em Jacarepaguá' : 'Entrega a partir de R$ 10'}</p>
      <button class="btn${c.destaque ? '' : ' btn-contorno'}" data-escolher="${c.id}">Montar kit de ${c.marmitas}</button>
    </article>`).join('')
    + (AVULSA ? `<p class="avulsa-nota">Quer só algumas? Marmitas avulsas (de ${AVULSA.minimo} a ${AVULSA.marmitas}): ${P450} frango ${brl(AVULSA.precos.Frango)} · carne ou peixe ${brl(AVULSA.precos.Carne)}${pl(AVULSA, 'Frango') != null ? `; ${P300} frango ${brl(pl(AVULSA, 'Frango'))} · carne ou peixe ${brl(pl(AVULSA, 'Carne'))}` : ''}. <button class="link-limpar" data-escolher="${AVULSA.id}">Pedir avulsas</button></p>` : '');

  document.querySelectorAll('[data-escolher]').forEach((b) => b.addEventListener('click', () => {
    escolherCombo(Number(b.dataset.escolher));
    $('#montar').scrollIntoView();
  }));

  // ---------- Seletor de combo ----------
  function desenharSeletor() {
    $('#seletor-combo').innerHTML = D.combos.map((c) => `
      <button class="opcao-combo" role="radio" aria-checked="${c.id === estado.combo}" data-combo="${c.id}">
        ${c.avulso
    ? `<strong>Avulsas</strong>${c.minimo} a ${c.marmitas} un. · ${brl(menorPreco(c))}`
    : `<strong>${c.marmitas} marmitas</strong>${c.nome} · até ${c.maxPratos} pratos diferentes`}
      </button>`).join('');
    document.querySelectorAll('[data-combo]').forEach((b) =>
      b.addEventListener('click', () => escolherCombo(Number(b.dataset.combo))));
  }
  function escolherCombo(id) {
    estado.combo = id;
    atualizar();
  }

  // ---------- Filtros ----------
  const filtros = ['Todos', ...categorias, D.extras.categoria, ...D.avulsos.map((g) => g.categoria), S.categoria];
  function desenharFiltros() {
    $('#filtros').innerHTML = filtros.map((f) =>
      `<button class="filtro" role="tab" aria-selected="${f === estado.filtro}" data-filtro="${f}">${f}</button>`).join('');
    const barra = $('#filtros'), ativo = barra.querySelector('[aria-selected="true"]');
    if (ativo) barra.scrollLeft = ativo.offsetLeft - barra.offsetLeft - 16;
    document.querySelectorAll('[data-filtro]').forEach((b) => b.addEventListener('click', () => {
      estado.filtro = b.dataset.filtro;
      desenharFiltros();
      desenharPratos();
    }));
  }

  // ---------- Lista de pratos ----------
  function linhaPrato(nome, qtd, podeMais, extra, info) {
    const obs = info || D.observacoes[nome];
    const foto = D.fotosPratos[nome];
    return `
      <div class="prato${qtd ? ' ativo' : ''}">
        ${foto ? `<img class="prato-foto" src="${foto}" alt="" loading="lazy" width="64" height="64">` : ''}
        <div class="prato-nome">${nome}${obs ? `<small>${obs}</small>` : ''}</div>
        <div class="contador">
          <button type="button" data-menos="${nome}" data-grupo="${extra}" ${qtd ? '' : 'disabled'} aria-label="Remover ${nome}">−</button>
          <output aria-label="Quantidade de ${nome}">${qtd}</output>
          <button type="button" data-mais="${nome}" data-grupo="${extra}" ${podeMais ? '' : 'disabled'} aria-label="Adicionar ${nome}">+</button>
        </div>
      </div>`;
  }

  // Marmita: dois contadores sempre visíveis, um para cada tamanho (ex.: casal pede os dois no mesmo kit).
  function contador(nome, qtd, podeMais, grupo, rotulo, preco) {
    return `
          <div class="tam">
            <span class="tam-rotulo"><strong>${rotulo}</strong> ${brl(preco)}</span>
            <div class="contador">
              <button type="button" data-menos="${nome}" data-grupo="${grupo}" ${qtd ? '' : 'disabled'} aria-label="Remover ${nome} ${rotulo}">−</button>
              <output aria-label="Quantidade de ${nome} ${rotulo}">${qtd}</output>
              <button type="button" data-mais="${nome}" data-grupo="${grupo}" ${podeMais ? '' : 'disabled'} aria-label="Adicionar ${nome} ${rotulo}">+</button>
            </div>
          </div>`;
  }
  function linhaMarmita(nome, c, cheio, limitePratos) {
    const q450 = estado.itens[nome] || 0, q300 = estado.leves[nome] || 0;
    const podeMais = !cheio && (q450 + q300 > 0 || !limitePratos);
    const obs = D.observacoes[nome];
    const foto = D.fotosPratos[nome];
    const cat = categoriaDe[nome];
    return `
      <div class="prato prato-marmita${q450 + q300 ? ' ativo' : ''}">
        ${foto ? `<img class="prato-foto" src="${foto}" alt="" loading="lazy" width="64" height="64">` : ''}
        <div class="prato-nome">${nome}${obs ? `<small>${obs}</small>` : ''}</div>
        <div class="tamanhos">${contador(nome, q450, podeMais, 'itens', P450, c.precos[cat])}${pl(c, cat) != null ? contador(nome, q300, podeMais, 'leves', P300, pl(c, cat)) : ''}</div>
      </div>`;
  }

  function desenharPratos() {
    const c = combo();
    const cheio = totalMarmitas() >= c.marmitas;
    const limitePratos = pratosDistintos() >= c.maxPratos;
    let html = '';
    categorias.forEach((cat) => {
      if (estado.filtro !== 'Todos' && estado.filtro !== cat) return;
      html += `<div class="grupo"><h4>${cat}<span>${c.avulso ? 'preço da avulsa' : `preço no ${c.nome}`}</span></h4>`;
      D.pratos[cat].forEach((p) => { html += linhaMarmita(p, c, cheio, limitePratos); });
      html += '</div>';
    });
    if (estado.filtro === 'Todos' || estado.filtro === D.extras.categoria) {
      html += `<div class="grupo"><h4>${D.extras.categoria}<span>${brl(D.extras.preco)} cada</span></h4>`;
      D.extras.pratos.forEach((p) => { html += linhaPrato(p, estado.extras[p] || 0, true, 'extras'); });
      html += '</div>';
    }
    D.avulsos.forEach((g) => {
      if (estado.filtro !== 'Todos' && estado.filtro !== g.categoria) return;
      html += `<div class="grupo"><h4>${g.categoria}<span>preço por unidade</span></h4>`;
      g.itens.forEach((i) => { html += linhaPrato(i.nome, estado.avulsos[i.nome] || 0, true, 'avulsos', brl(i.preco)); });
      html += '</div>';
    });
    if (estado.filtro === 'Todos' || estado.filtro === S.categoria) {
      html += `<div class="grupo" id="grupo-doces"><h4>${S.categoria}<span>${ofertasDoces()}</span></h4>`;
      if (S.precoNoCombo) html += `<p class="pequeno oferta-combo">🎁 ${ofertaCombo()}</p>`;
      S.itens.forEach((p) => { html += linhaPrato(p, estado.doces[p] || 0, true, 'doces'); });
      html += '</div>';
    }
    $('#lista-pratos').innerHTML = html;
  }

  $('#lista-pratos').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mais], button[data-menos]');
    if (!b || b.disabled) return;
    const nome = b.dataset.mais || b.dataset.menos;
    const alvo = estado[b.dataset.grupo];
    const delta = b.dataset.mais ? 1 : -1;
    alvo[nome] = Math.max(0, (alvo[nome] || 0) + delta);
    if (!alvo[nome]) delete alvo[nome];
    atualizar();
    if (delta > 0) medir('AddToCart');
  });

  // ---------- Cálculos ----------
  // Mesmo cálculo que o servidor usa (preco.js).
  const selecao = () => ({ combo: estado.combo, itens: estado.itens, leves: estado.leves, extras: estado.extras, avulsos: estado.avulsos, doces: estado.doces });
  function calcular() {
    const r = window.FIT_PRECO.calcularPedido(D, selecao());
    return { c: combo(), linhas: r.itens, extras: r.extras, avulsos: r.avulsos, doces: r.doces, descontoDoces: r.descontoDoces, subtotal: r.subtotal };
  }

  // " (10 de 450 g + 5 de 350 g)" — só quando o pedido tem marmitas dos dois tamanhos.
  function porTamanho(linhas) {
    const soma = (peso) => linhas.filter((l) => l.peso === peso).reduce((a, l) => a + l.qtd, 0);
    const a = soma(P450), b = soma(P300);
    return a && b ? ` (${a} de ${P450} + ${b} de ${P300})` : '';
  }

  // ---------- Resumo ----------
  function desenharResumo() {
    const { c, linhas, extras, avulsos, doces, descontoDoces, subtotal } = calcular();
    const total = totalMarmitas();
    const distintos = pratosDistintos();

    $('#prog-marmitas').textContent = (c.avulso ? `${total} marmita${total === 1 ? '' : 's'} avulsa${total === 1 ? '' : 's'}` : `${total} de ${c.marmitas} marmitas`) + porTamanho(linhas);
    $('#prog-pratos').textContent = c.avulso ? `até ${c.marmitas}` : `${distintos} de ${c.maxPratos} pratos diferentes`;
    const fill = $('#barra-fill');
    fill.style.width = Math.min(100, (total / c.marmitas) * 100) + '%';
    fill.classList.toggle('completo', total === c.marmitas);

    let html = linhas.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    if (extras.length) {
      html += '<li class="extra-label">Camarão</li>';
      html += extras.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    }
    if (avulsos.length) {
      html += '<li class="extra-label">Caldos, feijões, empadão e bolos</li>';
      html += avulsos.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    }
    if (doces.length) {
      html += '<li class="extra-label">Sobremesas</li>';
      html += doces.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${l.preco == null ? 'a confirmar' : brl(l.total)}</span></li>`).join('');
      if (descontoDoces > 0) html += `<li class="desconto"><span>Desconto nas sobremesas</span><span>− ${brl(descontoDoces)}</span></li>`;
    }
    $('#resumo-itens').innerHTML = html || '<li class="vazio">Adicione pratos para montar seu kit</li>';
    $('#subtotal').textContent = brl(subtotal);
    $('#nota-doces').hidden = !(doces.length && S.preco == null);
    $('#frete-info').innerHTML = c.freteGratis
      ? '<span class="gratis">Grátis</span> em Jacarepaguá'
      : 'R$ 10 em Jacarepaguá · grátis a partir de 15 marmitas';

    const aviso = $('#aviso');
    let ok = false;
    const proximo = combosReais[0];
    if (c.avulso && total >= proximo.marmitas) aviso.textContent = `Com ${total} marmitas vale mais o ${proximo.nome} (${proximo.marmitas} marmitas): escolha o kit acima e economize.`;
    else if (c.avulso && total > 0) {
      const falta = proximo.marmitas - total;
      aviso.textContent = total >= proximo.marmitas - 3
        ? `Faltam só ${falta} para o ${proximo.nome} (${proximo.marmitas} marmitas), que sai ${brl(totalLeves() > totalTradicionais() && pl(c, 'Frango') != null && pl(proximo, 'Frango') != null ? pl(c, 'Frango') - pl(proximo, 'Frango') : c.precos.Frango - proximo.precos.Frango)} mais barato por marmita.`
        : 'Pronto! É só finalizar.';
      ok = true;
    }
    else if (total > c.marmitas) aviso.textContent = `Você escolheu ${total} marmitas. Remova ${total - c.marmitas} para o ${c.nome}.`;
    else if (distintos > c.maxPratos) aviso.textContent = `O ${c.nome} permite até ${c.maxPratos} pratos diferentes. Remova ${distintos - c.maxPratos}.`;
    else if (total === 0 && totalExtras() > 0 && c.avulso) { aviso.textContent = 'Pronto! Pedido só de adicionais. É só finalizar.'; ok = true; }
    else if (total === 0) aviso.textContent = totalExtras() > 0 ? 'Para pedir só caldos, feijões, empadão, bolos, camarão ou sobremesas, escolha "Avulsas" acima.' : '';
    else if (total < c.marmitas) aviso.textContent = `Faltam ${c.marmitas - total} marmita${c.marmitas - total > 1 ? 's' : ''} para completar o kit.`;
    else { aviso.textContent = 'Kit completo! É só finalizar.'; ok = true; }
    aviso.classList.toggle('ok', ok);
    $('#btn-finalizar').disabled = !ok;

    // Barra do celular
    $('#bm-total').textContent = brl(subtotal);
    $('#bm-info').textContent = c.avulso ? `${total} avulsa${total === 1 ? '' : 's'}` : `${total} de ${c.marmitas} marmitas`;
    $('#barra-movel').classList.toggle('visivel', total + totalExtras() > 0);
    const bm = $('#bm-btn');
    bm.textContent = ok ? 'Finalizar pedido' : 'Ver pedido';
    bm.classList.toggle('btn-whats', ok);
  }

  function atualizar() {
    desenharSeletor();
    desenharPratos();
    desenharResumo();
    salvar();
  }

  $('#btn-limpar').addEventListener('click', () => { estado.itens = {}; estado.leves = {}; estado.extras = {}; estado.doces = {}; estado.avulsos = {}; atualizar(); });

  // ---------- Cardápio ----------
  $('#cardapio-lista').innerHTML = [
    ...categorias.map((cat) => `<div class="cardapio-cat"><h3>${cat}<span>${P450} a partir de ${brl(Math.min(...D.combos.map((c) => c.precos[cat])))}${minimo(D.combos.map((c) => pl(c, cat))) != null ? ` · ${P300} a partir de ${brl(minimo(D.combos.map((c) => pl(c, cat))))}` : ''}</span></h3>
      <ul>${D.pratos[cat].map((p) => `<li>${p}${D.observacoes[p] ? ` <span class="pequeno">(${D.observacoes[p].toLowerCase()})</span>` : ''}</li>`).join('')}</ul></div>`),
    `<div class="cardapio-cat"><h3>${D.extras.categoria}<span>${brl(D.extras.preco)} cada</span></h3>
      <ul>${D.extras.pratos.map((p) => `<li>${p}</li>`).join('')}</ul><p class="pequeno">Peça junto com as marmitas ou sozinho, na opção Avulsas.</p></div>`,
    ...D.avulsos.map((g) => `<div class="cardapio-cat"><h3>${g.categoria}<span>avulso</span></h3>
      <ul>${g.itens.map((i) => `<li>${i.nome} <span class="pequeno">· ${brl(i.preco)}</span></li>`).join('')}</ul></div>`),
    `<div class="cardapio-cat"><h3>${S.categoria}<span>pote de ${S.peso}</span></h3>
      <ul>${S.itens.map((p) => `<li>${p}</li>`).join('')}</ul><p class="pequeno">Pote de ${S.peso}: ${ofertasDoces()}.${ofertaCombo() ? ` ${ofertaCombo()}.` : ''}</p></div>`,
  ].join('');

  // ---------- Fotos ----------
  const nomeDaFoto = Object.fromEntries(Object.entries(D.fotosPratos).map(([n, f]) => [f, n]));
  $('#hero-fotos').innerHTML = D.fotosTopo.map((f) =>
    `<img src="${f}" alt="${nomeDaFoto[f] ? `${nomeDaFoto[f]} — marmita fit Fit Premium` : 'Marmita fit congelada Fit Premium'}" width="450" height="450">`).join('');
  $('#galeria').innerHTML = D.galeria.map((f) =>
    `<figure><img src="${f}" alt="${nomeDaFoto[f] ? `${nomeDaFoto[f]} — marmita congelada` : 'Marmitas fit congeladas Fit Premium em Jacarepaguá'}" loading="lazy" width="450" height="560"></figure>`).join('');

  // ---------- Vitrine de sobremesas ----------
  $('#doces-foto').src = S.imagem;
  $('#doces-peso').textContent = S.peso;
  $('#doces-lista').innerHTML = S.itens.map((p) => `<li>${p}</li>`).join('');
  if (S.preco == null) $('#doces-preco').textContent = 'Consulte o valor no WhatsApp.';
  else $('#doces-preco').innerHTML = listaOfertas().map((o) => `<span>${o}</span>`).join('');
  $('#doces-combo').textContent = ofertaCombo() ? `🎁 ${ofertaCombo()}` : '';
  $('#btn-doces').addEventListener('click', () => {
    estado.filtro = S.categoria;
    desenharFiltros();
    desenharPratos();
    $('#montar').scrollIntoView();
  });

  // ---------- Avaliações ----------
  // Texto vindo de clientes: montado com textContent (nunca innerHTML).
  function mostrarAvaliacoes(lista) {
  const avs = (lista || []).filter((a) => a && Number.isInteger(a.nota) && a.nota >= 1 && a.nota <= 5 && a.texto);
  if (avs.length) {
    const media = avs.reduce((s, a) => s + a.nota, 0) / avs.length;
    $('#media-avaliacoes').textContent = `★ ${media.toFixed(1).replace('.', ',')} de 5 · ${avs.length} avaliaç${avs.length > 1 ? 'ões' : 'ão'} de clientes`;
    $('#depoimentos').replaceChildren(...avs.map((a) => {
      const fig = document.createElement('figure');
      fig.className = 'depoimento';
      const est = document.createElement('p');
      est.className = 'dep-estrelas';
      est.setAttribute('aria-label', `${a.nota} de 5 estrelas`);
      est.textContent = '★'.repeat(a.nota) + '☆'.repeat(5 - a.nota);
      const q = document.createElement('blockquote');
      q.textContent = `“${a.texto}”`;
      const cap = document.createElement('figcaption');
      cap.textContent = [a.nome, a.bairro].filter(Boolean).join(' · ') + (a.prato ? ` — pediu ${a.prato}` : '');
      fig.append(est, q, cap);
      return fig;
    }));
    $('#avaliacoes').hidden = false;
  }
  }
  mostrarAvaliacoes(D.avaliacoes);
  if (D.loja.api) {
    fetch(`${D.loja.api}/api/avaliacoes`, { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && Array.isArray(j.avaliacoes) && j.avaliacoes.length) mostrarAvaliacoes([...(D.avaliacoes || []), ...j.avaliacoes]); })
      .catch(() => {});
  }

  // ---------- Infos ----------
  $('#lista-pagamentos').textContent = D.pagamentos.join(' · ');
  $('#link-whats').href = `https://wa.me/${D.loja.whatsapp}`;
  $('#link-insta').href = `https://instagram.com/${D.loja.instagram}`;

  // ---------- Checkout ----------
  const dlg = $('#checkout');
  const form = $('#form-checkout');
  $('#sel-pagamento').innerHTML = D.pagamentos.map((p) => `<option>${p}</option>`).join('');
  $('#sel-periodo').innerHTML = (D.entrega.periodos || []).map((p) => `<option>${p}</option>`).join('');
  // Datas no fuso de Brasília (toISOString usa UTC e pulava um dia depois das 21h). O servidor aceita até 60 dias.
  const diaSP = (dias) => new Date(Date.now() + dias * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  $('#inp-data').min = diaSP(1); // entregamos em até 1 dia útil
  $('#inp-data').max = diaSP(60);

  // ---------- Entrega: cidades, bairros e taxa ----------
  const E = D.entrega;
  const cidades = [...new Set(E.faixas.map((f) => f.cidade))];
  $('#sel-cidade').replaceChildren(...cidades.map((c) => new Option(c, c)));
  function listarBairros() {
    const c = form.cidade.value;
    const nomes = E.faixas.filter((f) => f.cidade === c).flatMap((f) => f.bairros).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    $('#lista-bairros').replaceChildren(...nomes.map((n) => new Option(n)));
  }
  const taxaAtual = () => window.FIT_PRECO.taxaEntrega(D, form.bairro.value, form.cidade.value, totalMarmitas());
  function atualizarTaxa() {
    const entrega = form.tipo.value === 'Entrega';
    const { subtotal } = calcular();
    const t = entrega ? taxaAtual() : { atendido: true, taxa: 0 };
    const el = $('#taxa-entrega');
    if (!entrega) el.textContent = '';
    else if (!form.bairro.value.trim()) el.textContent = totalMarmitas() >= 15 ? 'Entrega grátis em Jacarepaguá: informe o bairro (ou o CEP) para confirmar.' : 'Entrega R$ 10 em Jacarepaguá: informe o bairro (ou o CEP) para confirmar.';
    else if (!t.atendido) el.textContent = '⚠️ Bairro fora da área atendida ou não reconhecido. Confira a grafia e escolha um bairro da lista. Se precisar, consulte a entrega pelo WhatsApp antes de montar o pedido.';
    else el.textContent = t.gratis ? `🎉 Entrega grátis em ${t.bairro}!` : `🚚 Entrega em ${t.bairro}: ${brl(t.taxa)}`;
    el.classList.toggle('gratis', !!t.gratis);
    const total = subtotal + (t.atendido ? t.taxa : 0);
    $('#total-checkout').replaceChildren(
      Object.assign(document.createElement('span'), { textContent: entrega && !t.atendido ? 'Subtotal (confirme um bairro atendido)' : 'Total' }),
      Object.assign(document.createElement('strong'), { textContent: brl(total) }));
  }
  listarBairros();
  form.bairro.addEventListener('input', () => { $('#erro-checkout').textContent = ''; atualizarTaxa(); });
  form.cidade.addEventListener('change', () => { listarBairros(); atualizarTaxa(); });

  // CEP: busca rua e bairro no ViaCEP (serviço público dos Correios).
  async function buscarCep(cep) {
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(6000) });
      const j = await r.json();
      return j && !j.erro ? j : null;
    } catch { return null; }
  }
  form.cep.addEventListener('input', async () => {
    const d = form.cep.value.replace(/\D/g, '');
    if (d.length !== 8) return;
    const j = await buscarCep(d);
    if (form.cep.value.replace(/\D/g, '') !== d) return; // ignora resposta de um CEP que o cliente já alterou
    if (!j) { $('#taxa-entrega').textContent = 'CEP não encontrado. Preencha o endereço e o bairro.'; return; }
    if (!cidades.includes(j.localidade)) { form.bairro.value = ''; $('#taxa-entrega').textContent = 'Este CEP fica fora da cidade atendida. Entregamos somente nos bairros indicados de Jacarepaguá.'; return; }
    if (j.logradouro && !form.endereco.value) form.endereco.value = `${j.logradouro}, `;
    if (cidades.includes(j.localidade)) { form.cidade.value = j.localidade; listarBairros(); }
    if (j.bairro) form.bairro.value = j.bairro;
    atualizarTaxa();
    form.endereco.focus();
    form.endereco.setSelectionRange(form.endereco.value.length, form.endereco.value.length);
  });


  // "Será que entrega?"
  $('#form-sera').addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = $('#inp-sera').value.trim();
    const res = $('#res-sera');
    if (!v) return;
    let bairro = v, cidade = 'Rio de Janeiro';
    if (/^\d{5}-?\d{3}$/.test(v)) {
      res.textContent = 'Buscando…';
      const j = await buscarCep(v.replace(/\D/g, ''));
      if (!j) { res.textContent = 'CEP não encontrado.'; return; }
      bairro = j.bairro; cidade = j.localidade;
    }
    const t = window.FIT_PRECO.taxaEntrega(D, bairro, cidade, 0);
    const livre = E.faixas.find((f) => f.freteGratisAPartirDe && f.bairros.includes(t.bairro));
    res.textContent = t.atendido
      ? `✅ Entregamos em ${t.bairro}${t.cidade !== 'Rio de Janeiro' ? ` (${t.cidade})` : ''}: ${brl(t.taxaCheia)}${livre ? ` · grátis a partir de ${livre.freteGratisAPartirDe} marmitas` : ''}.`
      : `${bairro || v}: esse bairro ainda não está na nossa área. Por enquanto entregamos só em Jacarepaguá (Taquara, Freguesia, Pechincha, Anil, Tanque, Curicica, Camorim, Colônia, Gardênia Azul, Cidade de Deus, Praça Seca e Vila Valqueire).`;
  });

  const medirCheckout = () => medir('InitiateCheckout', { value: calcular().subtotal, num_items: totalMarmitas() + totalExtras() });
  $('#btn-finalizar').addEventListener('click', () => { dlg.showModal(); atualizarTaxa(); medirCheckout(); });
  $('#bm-btn').addEventListener('click', (e) => {
    if ($('#btn-finalizar').disabled) return;
    e.preventDefault();
    dlg.showModal();
    atualizarTaxa();
    medirCheckout();
  });
  $('#btn-fechar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { form.hidden = false; $('#pedido-ok').hidden = true; });
  form.addEventListener('change', () => {
    const entrega = form.tipo.value === 'Entrega';
    $('#campos-endereco').hidden = !entrega;
    form.endereco.required = entrega;
    atualizarTaxa();
  });
  form.endereco.required = true;
  form.telefone.addEventListener('input', () => {
    const d = form.telefone.value.replace(/\D/g, '').slice(0, 11);
    form.telefone.value = d.length > 7 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
  form.cep.addEventListener('input', () => {
    const d = form.cep.value.replace(/\D/g, '').slice(0, 8);
    form.cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
  });

  let enviando = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (!taxaAtual().atendido) {
      $('#erro-checkout').textContent = 'Confira o bairro: entregamos apenas na área indicada de Jacarepaguá. Para consultar outra localização, use o link de WhatsApp acima.';
      form.bairro.focus();
      return;
    }
    const tel = form.telefone.value.replace(/\D/g, '');
    if (tel.length < 10) { form.telefone.setCustomValidity('Informe o WhatsApp com DDD.'); form.telefone.reportValidity(); form.telefone.setCustomValidity(''); return; }
    enviando = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Registrando pedido…';
    // Abre a aba já no clique: navegadores de celular bloqueiam janelas abertas depois de uma espera.
    const janela = window.open('', '_blank');

    const { c, linhas, extras, avulsos, doces, descontoDoces, subtotal } = calcular();
    const f = Object.fromEntries(new FormData(form));
    let codigo = null, srv = null, recusa = null;
    if (D.loja.api) {
      try {
        const r = await fetch(`${D.loja.api}/api/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selecao: selecao(), cliente: {
            nome: f.nome, telefone: tel, tipo: f.tipo, endereco: f.endereco, bairro: f.bairro, cidade: f.cidade,
            cep: f.cep, pagamento: f.pagamento, data: f.data, periodo: f.periodo, porteiro: f.porteiro === 'sim', obs: f.obs, site: f.site } }),
          signal: AbortSignal.timeout(12000),
        });
        if (r.ok) { srv = await r.json(); codigo = srv.codigo; }
        else if (r.status === 400 || r.status === 422) {
          const j = await r.json().catch(() => ({}));
          recusa = [j.erro || 'Confira os dados do pedido.', ...(j.detalhes || [])].join(' ');
        }
      } catch {}
    }
    // Dados recusados pelo servidor (ex.: WhatsApp inválido): mostra o motivo e não abre o WhatsApp.
    if (recusa) {
      if (janela) janela.close();
      $('#erro-checkout').textContent = `⚠️ ${recusa}`;
      $('#erro-checkout').scrollIntoView({ block: 'center' });
      enviando = false; btn.disabled = false; btn.textContent = 'Enviar pedido pelo WhatsApp';
      return;
    }
    $('#erro-checkout').textContent = '';
    // Sem servidor: calcula a entrega aqui mesmo (a equipe confere no WhatsApp).
    const tLocal = f.tipo === 'Entrega' ? taxaAtual() : { atendido: true, taxa: 0 };
    const taxa = srv ? srv.taxa : (tLocal.atendido ? tLocal.taxa : null);
    const credito = srv ? srv.credito : 0;
    const total = srv ? srv.total : subtotal + (taxa || 0);

    const data = f.data ? f.data.split('-').reverse().join('/') : 'A combinar';
    const msg = [
      codigo ? `Olá, Fit Premium! Fiz o pedido *#${codigo}* pelo site 💚` : `Olá, Fit Premium! Quero fazer um pedido pelo site 💚`,
      ``,
      (c.avulso ? `*${c.nome} — ${totalMarmitas()} un.*` : `*${c.nome} — ${c.marmitas} marmitas*`) + porTamanho(linhas),
      ...linhas.map((l) => `• ${l.qtd}× ${l.nome} · ${brl(l.preco)}`),
      ...(avulsos.length ? [``, `*Caldos, feijões, empadão e bolos*`, ...avulsos.map((l) => `• ${l.qtd}× ${l.nome} (${brl(l.preco)})`)] : []),
      ...(extras.length ? [``, `*Avulsos (camarão)*`, ...extras.map((l) => `• ${l.qtd}× ${l.nome} (${brl(l.preco)})`)] : []),
      ...(doces.length ? [``, `*Sobremesas (pote de ${S.peso})*`, ...doces.map((l) => `• ${l.qtd}× ${l.nome}${l.preco == null ? '' : ` (${brl(l.preco)})`}`),
        ...(descontoDoces > 0 ? [`Desconto nas sobremesas: − ${brl(descontoDoces)}`] : [])] : []),
      ``,
      `Itens: ${brl(subtotal)}`,
      ...(f.tipo === 'Entrega' ? [`Entrega: ${taxa == null ? 'a combinar' : taxa === 0 ? 'grátis' : brl(taxa)}`] : []),
      ...(credito > 0 ? [`Crédito: − ${brl(credito)}`] : []),
      `*Total: ${brl(total)}*${taxa == null && f.tipo === 'Entrega' ? ' + entrega' : ''}`,
      ``,
      `Nome: ${f.nome}`,
      `WhatsApp: ${form.telefone.value}`,
      `Recebimento: ${f.tipo}`,
      ...(f.tipo === 'Entrega' ? [`Endereço: ${f.endereco}`, `Bairro: ${f.bairro} · ${f.cidade}`, `CEP: ${f.cep || '-'}`] : []),
      `Pagamento: ${f.pagamento}`,
      `Data desejada: ${data}`,
      ...(f.periodo ? [`Período: ${f.periodo}`] : []),
      `Portaria pode receber: ${f.porteiro === 'sim' ? 'sim' : 'não'}`,
      ...(f.obs ? [`Obs.: ${f.obs}`] : []),
      ``,
      `Aguardo a confirmação de disponibilidade, entrega e total.`,
    ].join('\n');
    const url = `https://wa.me/${D.loja.whatsapp}?text=${encodeURIComponent(msg)}`;
    medir('WhatsAppIntent', { value: total, num_items: totalMarmitas() + totalExtras() });
    if (janela) { janela.opener = null; janela.location.href = url; } else window.location.href = url;

    // Tela de confirmação
    $('#ok-codigo').textContent = codigo ? `Pedido #${codigo}` : 'Pedido pronto';
    $('#ok-texto').textContent = (codigo
      ? `Seu pedido foi registrado. Total: ${brl(total)}${taxa == null && f.tipo === 'Entrega' ? ' + entrega' : ''}.`
      : `Total: ${brl(total)}.`)
      + (credito > 0 ? ` Crédito aplicado: − ${brl(credito)}.` : '')
      + ' Agora é só tocar em enviar no WhatsApp para a equipe confirmar.';
    $('#ok-whats').href = url;
    form.hidden = true;
    $('#pedido-ok').hidden = false;
    estado.itens = {}; estado.leves = {}; estado.extras = {}; estado.doces = {}; estado.avulsos = {};
    atualizar();
    btn.disabled = false;
    btn.textContent = 'Enviar pedido pelo WhatsApp';
    enviando = false;
  });
  const fecharDialogo = () => { dlg.close(); form.hidden = false; $('#pedido-ok').hidden = true; };
  $('#ok-fechar').addEventListener('click', fecharDialogo);

  // ---------- Marketing: chamadas e atalhos ----------
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="https://wa.me/"]');
    if (link) medir('Contact');
  });

  // Data real da próxima entrega: até 1 dia útil (seg. a sex.) após a confirmação; pedidos depois das 20h contam a partir de amanhã.
  const horaSP = Number(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false })) % 24;
  let diaEntrega = new Date(Date.now() + (horaSP >= 20 ? 2 : 1) * 864e5);
  const semanaSP = (d) => d.toLocaleDateString('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' });
  while (['Sat', 'Sun'].includes(semanaSP(diaEntrega))) diaEntrega = new Date(diaEntrega.getTime() + 864e5);
  const entregaEm = diaEntrega.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: '2-digit' });
  $('#hero-entrega').textContent = `🚚 Pedindo hoje, você recebe até ${entregaEm}.`;

  // Faixa de ofertas no topo (troca a cada 5 s).
  const ofertasTopo = [
    '🚚 Entrega em até 1 dia útil · frete grátis em Jacarepaguá a partir de 15 marmitas',
    `🍱 Marmitas de ${P450} ou ${P300} a partir de ${brlC(Math.min(...combosReais.map(menorPreco)))}`,
    `🥗 Come menos? Marmita de ${P300}: ${T.leve.descricao}`,
  ].filter(Boolean);
  let iOferta = 0;
  const trocarOferta = () => { $('#aviso-topo').textContent = ofertasTopo[iOferta++ % ofertasTopo.length]; };
  trocarOferta();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(trocarOferta, 5000);

  // "Monte pra mim": distribui as marmitas entre pratos variados (alternando frango, carne e peixe).
  function sugestao(c) {
    const filas = categorias.map((cat) => [...D.pratos[cat]]);
    const escolhidos = [];
    for (let i = 0; escolhidos.length < c.maxPratos && filas.some((f) => f.length); i++) {
      const f = filas[i % filas.length];
      if (f.length) escolhidos.push(f.shift());
    }
    const itens = {};
    escolhidos.forEach((p, i) => { itens[p] = Math.floor(c.marmitas / escolhidos.length) + (i < c.marmitas % escolhidos.length ? 1 : 0); });
    return itens;
  }
  // tamanho: '450' (tudo 450 g), '300' (tudo 350 g) ou 'misto' (metade de cada prato em cada tamanho, ex.: casal).
  function montarPraMim(id, tamanho) {
    const c = D.combos.find((x) => x.id === id);
    if (!c || c.avulso) return;
    if (pl(c, 'Frango') == null) tamanho = '450'; // kit sem 350 g
    const pratos = sugestao(c);
    estado.combo = id;
    estado.itens = {};
    estado.leves = {};
    // Metade de cada: cada prato vai dividido; as sobras (pratos com quantidade ímpar) completam a metade do kit em 350 g.
    let sobra = Math.floor(c.marmitas / 2) - Object.values(pratos).reduce((a, q) => a + Math.floor(q / 2), 0);
    Object.entries(pratos).forEach(([p, q]) => {
      let de300 = tamanho === '300' ? q : tamanho === 'misto' ? Math.floor(q / 2) : 0;
      if (tamanho === 'misto' && q % 2 && sobra > 0) { de300++; sobra--; }
      if (q - de300) estado.itens[p] = q - de300;
      if (de300) estado.leves[p] = de300;
    });
    atualizar();
    medir('AddToCart', { value: calcular().subtotal, num_items: totalMarmitas() });
    $('#montar').scrollIntoView();
  }
  document.querySelectorAll('[data-sugestao]').forEach((b) => b.addEventListener('click', () =>
    montarPraMim(combo().avulso ? combosReais[0].id : estado.combo, b.dataset.sugestao)));

  // Preço por marmita do kit no tamanho escolhido (frango, o menor).
  const precoDoTamanho = (c, tamanho) => (pl(c, 'Frango') == null || tamanho === '450' ? c.precos.Frango : tamanho === '300' ? pl(c, 'Frango') : Math.min(c.precos.Frango, pl(c, 'Frango')));
  const textoTamanho = { 450: `marmitas de ${P450}`, 300: `marmitas de ${P300}`, misto: `metade ${P450} e metade ${P300}` };

  // Qual kit é para mim? (refeições por semana × pessoas → kit que dura umas 2 semanas, no tamanho escolhido)
  function recomendar() {
    const porSemana = Number($('#quiz-refeicoes').value) * Number($('#quiz-pessoas').value);
    const tamanho = $('#quiz-tamanho').value;
    const alvo = porSemana * 2;
    const c = [...combosReais].reverse().reduce((m, k) => (Math.abs(k.marmitas - alvo) < Math.abs(m.marmitas - alvo) ? k : m));
    const semanas = Math.max(1, Math.round(c.marmitas / porSemana));
    $('#quiz-resultado').textContent = `Sugestão: ${c.nome} (${c.marmitas} marmitas, ${textoTamanho[tamanho]}), rende cerca de ${semanas} semana${semanas > 1 ? 's' : ''}, a partir de ${brlC(precoDoTamanho(c, tamanho))} cada.`;
    $('#quiz-montar').dataset.kit = c.id;
  }
  // 2 pessoas ou mais: já sugere metade de cada tamanho (a pessoa pode trocar).
  $('#quiz-pessoas').addEventListener('change', () => { if ($('#quiz-pessoas').value !== '1' && $('#quiz-tamanho').value === '450') $('#quiz-tamanho').value = 'misto'; });
  ['#quiz-refeicoes', '#quiz-pessoas', '#quiz-tamanho'].forEach((s) => $(s).addEventListener('change', recomendar));
  recomendar();
  $('#quiz-montar').addEventListener('click', () => montarPraMim(Number($('#quiz-montar').dataset.kit), $('#quiz-tamanho').value));

  desenharFiltros();
  atualizar();
})();
