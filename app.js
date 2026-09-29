(() => {
  const D = window.FIT_DADOS;
  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const categorias = Object.keys(D.pratos);
  const categoriaDe = {};
  categorias.forEach((c) => D.pratos[c].forEach((p) => (categoriaDe[p] = c)));

  // ---------- Estado ----------
  const CHAVE = 'fitpremium-pedido';
  let estado = { combo: 15, itens: {}, extras: {}, doces: {}, avulsos: {}, filtro: 'Todos' };
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && D.combos.some((c) => c.id === salvo.combo)) estado = { ...estado, ...salvo, filtro: 'Todos' };
  } catch {}
  // Descarta pratos salvos que saíram do cardápio ou mudaram de nome.
  const filtrar = (obj, validos) => Object.fromEntries(Object.entries(obj || {}).filter(([p, q]) => validos.includes(p) && q > 0));
  estado.itens = filtrar(estado.itens, Object.keys(categoriaDe));
  estado.extras = filtrar(estado.extras, D.extras.pratos);
  estado.doces = filtrar(estado.doces, D.sobremesas.itens);
  const precoAvulso = {};
  D.avulsos.forEach((g) => g.itens.forEach((i) => (precoAvulso[i.nome] = i.preco)));
  estado.avulsos = filtrar(estado.avulsos, Object.keys(precoAvulso));
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch {} };

  const combo = () => D.combos.find((c) => c.id === estado.combo);
  const totalMarmitas = () => Object.values(estado.itens).reduce((a, b) => a + b, 0);
  const pratosDistintos = () => Object.values(estado.itens).filter((n) => n > 0).length;
  const totalExtras = () => [...Object.values(estado.extras), ...Object.values(estado.doces), ...Object.values(estado.avulsos)].reduce((a, b) => a + b, 0);
  const S = D.sobremesas;
  const precoDoce = () => (S.preco == null ? 'valor a confirmar' : brl(S.preco));
  // Texto das ofertas, ex.: "1 por R$ 18 · 2 por R$ 32 · 3 por R$ 45"
  const listaOfertas = () => [`1 por ${brl(S.preco)}`, ...[...(S.pacotes || [])].sort((a, b) => a.qtd - b.qtd).map((p) => `${p.qtd} por ${brl(p.preco)}`)];
  const ofertasDoces = () => S.preco == null ? 'valor a confirmar' : listaOfertas().join(' · ');
  const ofertaCombo = () => S.precoNoCombo ? `${brl(S.precoNoCombo.preco)} cada nos combos de ${S.precoNoCombo.aPartirDe} ou mais` : '';
  // Menor preço para n potes: pacotes + avulsos, ou preço fixo dentro dos combos maiores.
  function totalDoces(n, c) {
    if (S.preco == null || !n) return 0;
    if (S.precoNoCombo && c.marmitas >= S.precoNoCombo.aPartirDe) return n * S.precoNoCombo.preco;
    const melhor = [0];
    for (let i = 1; i <= n; i++) {
      melhor[i] = melhor[i - 1] + S.preco;
      (S.pacotes || []).forEach((p) => { if (i >= p.qtd) melhor[i] = Math.min(melhor[i], melhor[i - p.qtd] + p.preco); });
    }
    return melhor[n];
  }
  const menorPreco = (c) => Math.min(...Object.values(c.precos));

  // ---------- Cards de combos ----------
  $('#lista-combos').innerHTML = D.combos.map((c) => `
    <article class="combo${c.destaque ? ' destaque' : ''}">
      ${c.destaque ? `<span class="tag">${c.destaque}</span>` : ''}
      <div class="qtd">${c.marmitas}<small>marmitas</small></div>
      <h3>${c.nome}</h3>
      <p class="sub">Até ${c.maxPratos} pratos diferentes</p>
      <table class="tabela-precos">
        <tr><td>Frango</td><td>${brl(c.precos.Frango)}</td></tr>
        <tr><td>Carne ou peixe</td><td>${brl(c.precos.Carne)}</td></tr>
      </table>
      <p class="beneficio${c.freteGratis ? '' : ' neutro'}">${c.freteGratis ? 'Frete grátis em Jacarepaguá' : 'Taxa de entrega conforme o endereço'}</p>
      <button class="btn${c.destaque ? '' : ' btn-contorno'}" data-escolher="${c.id}">Montar combo de ${c.marmitas}</button>
    </article>`).join('');

  document.querySelectorAll('[data-escolher]').forEach((b) => b.addEventListener('click', () => {
    escolherCombo(Number(b.dataset.escolher));
    $('#montar').scrollIntoView();
  }));

  // ---------- Seletor de combo ----------
  function desenharSeletor() {
    $('#seletor-combo').innerHTML = D.combos.map((c) => `
      <button class="opcao-combo" role="radio" aria-checked="${c.id === estado.combo}" data-combo="${c.id}">
        <strong>${c.marmitas} marmitas</strong>até ${c.maxPratos} pratos · desde ${brl(menorPreco(c))}
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

  function desenharPratos() {
    const c = combo();
    const cheio = totalMarmitas() >= c.marmitas;
    const limitePratos = pratosDistintos() >= c.maxPratos;
    let html = '';
    categorias.forEach((cat) => {
      if (estado.filtro !== 'Todos' && estado.filtro !== cat) return;
      html += `<div class="grupo"><h4>${cat}<span>${brl(c.precos[cat])} cada no combo de ${c.marmitas}</span></h4>`;
      D.pratos[cat].forEach((p) => {
        const q = estado.itens[p] || 0;
        html += linhaPrato(p, q, !cheio && (q > 0 || !limitePratos), 'itens');
      });
      html += '</div>';
    });
    if (estado.filtro === 'Todos' || estado.filtro === D.extras.categoria) {
      html += `<div class="grupo"><h4>${D.extras.categoria}<span>${brl(D.extras.preco)} cada · fora dos combos</span></h4>`;
      D.extras.pratos.forEach((p) => { html += linhaPrato(p, estado.extras[p] || 0, true, 'extras'); });
      html += '</div>';
    }
    D.avulsos.forEach((g) => {
      if (estado.filtro !== 'Todos' && estado.filtro !== g.categoria) return;
      html += `<div class="grupo"><h4>${g.categoria}<span>avulso · fora dos combos</span></h4>`;
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
  });

  // ---------- Cálculos ----------
  function calcular() {
    const c = combo();
    const linhas = Object.entries(estado.itens).map(([p, q]) => {
      const preco = c.precos[categoriaDe[p]];
      return { nome: p, qtd: q, preco, total: preco * q };
    });
    const extras = Object.entries(estado.extras).map(([p, q]) => ({ nome: p, qtd: q, preco: D.extras.preco, total: D.extras.preco * q }));
    const doces = Object.entries(estado.doces).map(([p, q]) => ({ nome: p, qtd: q, preco: S.preco, total: (S.preco || 0) * q }));
    const avulsos = Object.entries(estado.avulsos).map(([p, q]) => ({ nome: p, qtd: q, preco: precoAvulso[p], total: precoAvulso[p] * q }));
    const qtdDoces = doces.reduce((a, l) => a + l.qtd, 0);
    const descontoDoces = qtdDoces * (S.preco || 0) - totalDoces(qtdDoces, c);
    const subtotal = [...linhas, ...extras, ...avulsos, ...doces].reduce((a, l) => a + l.total, 0) - descontoDoces;
    return { c, linhas, extras, avulsos, doces, descontoDoces, subtotal };
  }

  // ---------- Resumo ----------
  function desenharResumo() {
    const { c, linhas, extras, avulsos, doces, descontoDoces, subtotal } = calcular();
    const total = totalMarmitas();
    const distintos = pratosDistintos();

    $('#prog-marmitas').textContent = `${total} de ${c.marmitas} marmitas`;
    $('#prog-pratos').textContent = `${distintos} de ${c.maxPratos} pratos`;
    const fill = $('#barra-fill');
    fill.style.width = Math.min(100, (total / c.marmitas) * 100) + '%';
    fill.classList.toggle('completo', total === c.marmitas);

    let html = linhas.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    if (extras.length) {
      html += '<li class="extra-label">Camarão</li>';
      html += extras.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    }
    if (avulsos.length) {
      html += '<li class="extra-label">Caldos, feijões e empadão</li>';
      html += avulsos.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${brl(l.total)}</span></li>`).join('');
    }
    if (doces.length) {
      html += '<li class="extra-label">Sobremesas</li>';
      html += doces.map((l) => `<li><span>${l.qtd}× ${l.nome}</span><span>${l.preco == null ? 'a confirmar' : brl(l.total)}</span></li>`).join('');
      if (descontoDoces > 0) html += `<li class="desconto"><span>Desconto nas sobremesas</span><span>− ${brl(descontoDoces)}</span></li>`;
    }
    $('#resumo-itens').innerHTML = html || '<li class="vazio">Adicione pratos para montar seu combo</li>';
    $('#subtotal').textContent = brl(subtotal);
    $('#nota-doces').hidden = !(doces.length && S.preco == null);
    $('#frete-info').innerHTML = c.freteGratis
      ? '<span class="gratis">Grátis</span> em Jacarepaguá'
      : 'Taxa conforme endereço';

    const aviso = $('#aviso');
    let ok = false;
    if (total > c.marmitas) aviso.textContent = `Você escolheu ${total} marmitas. Remova ${total - c.marmitas} para o combo de ${c.marmitas}.`;
    else if (distintos > c.maxPratos) aviso.textContent = `O combo de ${c.marmitas} permite até ${c.maxPratos} pratos diferentes. Remova ${distintos - c.maxPratos}.`;
    else if (total === 0) aviso.textContent = '';
    else if (total < c.marmitas) aviso.textContent = `Faltam ${c.marmitas - total} marmita${c.marmitas - total > 1 ? 's' : ''} para completar o combo.`;
    else { aviso.textContent = 'Combo completo! É só finalizar.'; ok = true; }
    aviso.classList.toggle('ok', ok);
    $('#btn-finalizar').disabled = !ok;

    // Barra do celular
    $('#bm-total').textContent = brl(subtotal);
    $('#bm-info').textContent = `${total} de ${c.marmitas} marmitas`;
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

  $('#btn-limpar').addEventListener('click', () => { estado.itens = {}; estado.extras = {}; estado.doces = {}; estado.avulsos = {}; atualizar(); });

  // ---------- Cardápio ----------
  $('#cardapio-lista').innerHTML = [
    ...categorias.map((cat) => `<div class="cardapio-cat"><h3>${cat}<span>a partir de ${brl(Math.min(...D.combos.map((c) => c.precos[cat])))}</span></h3>
      <ul>${D.pratos[cat].map((p) => `<li>${p}${D.observacoes[p] ? ` <span class="pequeno">(${D.observacoes[p].toLowerCase()})</span>` : ''}</li>`).join('')}</ul></div>`),
    `<div class="cardapio-cat"><h3>${D.extras.categoria}<span>${brl(D.extras.preco)} cada</span></h3>
      <ul>${D.extras.pratos.map((p) => `<li>${p}</li>`).join('')}</ul><p class="pequeno">Vendido avulso, fora dos combos.</p></div>`,
    ...D.avulsos.map((g) => `<div class="cardapio-cat"><h3>${g.categoria}<span>avulso</span></h3>
      <ul>${g.itens.map((i) => `<li>${i.nome} <span class="pequeno">· ${brl(i.preco)}</span></li>`).join('')}</ul></div>`),
    `<div class="cardapio-cat"><h3>${S.categoria}<span>pote de ${S.peso}</span></h3>
      <ul>${S.itens.map((p) => `<li>${p}</li>`).join('')}</ul><p class="pequeno">Pote de ${S.peso}: ${ofertasDoces()}. ${ofertaCombo()}.</p></div>`,
  ].join('');

  // ---------- Fotos ----------
  const nomeDaFoto = Object.fromEntries(Object.entries(D.fotosPratos).map(([n, f]) => [f, n]));
  $('#hero-fotos').innerHTML = D.fotosTopo.map((f) =>
    `<img src="${f}" alt="${nomeDaFoto[f] || 'Marmita Fit Premium'}" width="450" height="450">`).join('');
  $('#galeria').innerHTML = D.galeria.map((f) =>
    `<figure><img src="${f}" alt="Marmitas Fit Premium" loading="lazy" width="450" height="560"></figure>`).join('');

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
  const avs = (D.avaliacoes || []).filter((a) => a && a.nota >= 1 && a.nota <= 5 && a.texto);
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

  // ---------- Infos ----------
  $('#lista-pagamentos').textContent = D.pagamentos.join(' · ');
  $('#link-whats').href = `https://wa.me/${D.loja.whatsapp}`;
  $('#link-insta').href = `https://instagram.com/${D.loja.instagram}`;

  // ---------- Checkout ----------
  const dlg = $('#checkout');
  const form = $('#form-checkout');
  $('#sel-pagamento').innerHTML = D.pagamentos.map((p) => `<option>${p}</option>`).join('');
  const amanha = new Date(Date.now() + 864e5);
  $('#inp-data').min = amanha.toISOString().slice(0, 10);

  $('#btn-finalizar').addEventListener('click', () => dlg.showModal());
  $('#bm-btn').addEventListener('click', (e) => {
    if ($('#btn-finalizar').disabled) return;
    e.preventDefault();
    dlg.showModal();
  });
  $('#btn-fechar').addEventListener('click', () => dlg.close());
  form.addEventListener('change', () => {
    const entrega = form.tipo.value === 'Entrega';
    $('#campos-endereco').hidden = !entrega;
    form.endereco.required = entrega;
  });
  form.endereco.required = true;
  form.cep.addEventListener('input', () => {
    const d = form.cep.value.replace(/\D/g, '').slice(0, 8);
    form.cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { c, linhas, extras, avulsos, doces, descontoDoces, subtotal } = calcular();
    const f = Object.fromEntries(new FormData(form));
    const data = f.data ? f.data.split('-').reverse().join('/') : 'A combinar';
    const msg = [
      `Olá, Fit Premium! Quero fazer um pedido pelo site 💚`,
      ``,
      `*${c.nome} — ${c.marmitas} marmitas*`,
      ...linhas.map((l) => `• ${l.qtd}× ${l.nome} (${brl(l.preco)})`),
      ...(avulsos.length ? [``, `*Caldos, feijões e empadão*`, ...avulsos.map((l) => `• ${l.qtd}× ${l.nome} (${brl(l.preco)})`)] : []),
      ...(extras.length ? [``, `*Avulsos (camarão)*`, ...extras.map((l) => `• ${l.qtd}× ${l.nome} (${brl(l.preco)})`)] : []),
      ...(doces.length ? [``, `*Sobremesas (pote de ${S.peso})*`, ...doces.map((l) => `• ${l.qtd}× ${l.nome}${l.preco == null ? '' : ` (${brl(l.preco)})`}`),
        ...(descontoDoces > 0 ? [`Desconto nas sobremesas: − ${brl(descontoDoces)}`] : [])] : []),
      ``,
      `*Subtotal: ${brl(subtotal)}*${doces.length && S.preco == null ? ' + sobremesas (valor a confirmar)' : ''}`,
      ``,
      `Nome: ${f.nome}`,
      `Recebimento: ${f.tipo}`,
      ...(f.tipo === 'Entrega' ? [`Endereço: ${f.endereco}`, `Bairro: ${f.bairro}`, `CEP: ${f.cep || '-'}`] : []),
      `Pagamento: ${f.pagamento}`,
      `Data desejada: ${data}`,
      ...(f.obs ? [`Obs.: ${f.obs}`] : []),
      ``,
      `Aguardo a confirmação de disponibilidade, entrega e total.`,
    ].join('\n');
    window.open(`https://wa.me/${D.loja.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    dlg.close();
  });

  desenharFiltros();
  atualizar();
})();
