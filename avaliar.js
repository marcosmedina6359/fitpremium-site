(() => {
  const D = window.FIT_DADOS;
  const $ = (s) => document.querySelector(s);
  const form = $('#form-avaliar');

  const ROTULOS = { 1: 'Muito ruim', 2: 'Ruim', 3: 'Bom', 4: 'Muito bom', 5: 'Excelente!' };
  const ASPECTOS = ['Sabor', 'Tempero', 'Tamanho da porção', 'Variedade', 'Entrega no prazo', 'Atendimento', 'Embalagem', 'Preço'];

  // Chips de aspectos
  $('#aspectos').replaceChildren(...ASPECTOS.map((a, i) => {
    const label = document.createElement('label');
    label.className = 'chip';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'aspecto';
    input.value = a;
    input.id = 'asp' + i;
    label.append(input, document.createTextNode(a));
    return label;
  }));

  // Lista de pratos para "prato favorito", a partir do banco de dados do site
  const grupos = [
    ...Object.entries(D.pratos).map(([cat, nomes]) => [cat, nomes]),
    [D.extras.categoria, D.extras.pratos],
    ...D.avulsos.map((g) => [g.categoria, g.itens.map((i) => i.nome)]),
    [D.sobremesas.categoria, D.sobremesas.itens],
  ];
  const sel = $('#sel-prato');
  grupos.forEach(([cat, nomes]) => {
    const og = document.createElement('optgroup');
    og.label = cat;
    nomes.forEach((n) => og.append(new Option(n, n)));
    sel.append(og);
  });

  // Estrelas
  form.addEventListener('change', (e) => {
    if (e.target.name === 'nota') {
      $('#nota-texto').textContent = ROTULOS[e.target.value];
      $('#aviso-avaliar').textContent = '';
    }
  });
  const txt = form.comentario;
  txt.addEventListener('input', () => { $('#contador-texto').textContent = `${txt.value.length} / 400`; });

  // Envio
  // Codigo do pedido vem no link enviado apos a entrega: avaliar.html?p=FP-1024
  const codigoPedido = (new URLSearchParams(location.search).get('p') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
  let enviando = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;
    const nota = Number(form.nota.value);
    if (!nota) {
      $('#aviso-avaliar').textContent = 'Escolha de 1 a 5 estrelas para enviar.';
      $('#estrelas').scrollIntoView({ block: 'center' });
      return;
    }
    const limpa = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const aspectos = [...form.querySelectorAll('input[name="aspecto"]:checked')].map((i) => i.value);
    const nome = limpa(form.nome.value) || 'Não informado';
    enviando = true;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    const janela = D.loja.api ? null : window.open('', '_blank');

    const telefone = form.telefone.value.replace(/\D/g, '');
    // 1o: grava no servidor. Se falhar, envia pelo WhatsApp para nao perder a avaliacao.
    let salvo = false;
    if (D.loja.api) {
      try {
        const r = await fetch(`${D.loja.api}/api/avaliacoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedido: codigoPedido || null, nota, aspectos, prato: form.prato.value || null,
            texto: limpa(txt.value), nome: limpa(form.nome.value), bairro: limpa(form.bairro.value), telefone: telefone || null, autoriza: form.autoriza.checked }),
          signal: AbortSignal.timeout(12000),
        });
        salvo = r.ok;
      } catch {}
    }
    const msg = [
      '⭐ *AVALIAÇÃO FIT PREMIUM*',
      '',
      `Nota: ${'★'.repeat(nota)}${'☆'.repeat(5 - nota)} (${nota}/5 · ${ROTULOS[nota]})`,
      ...(aspectos.length ? [`Gostei de: ${aspectos.join(', ')}`] : []),
      ...(form.prato.value ? [`Prato favorito: ${form.prato.value}`] : []),
      ...(limpa(txt.value) ? ['', `"${limpa(txt.value)}"`] : []),
      '',
      `Nome: ${nome}`,
      `Bairro: ${limpa(form.bairro.value) || '-'}`,
      ...(telefone ? [`WhatsApp: ${form.telefone.value}`] : []),
      `Pode publicar no site: ${form.autoriza.checked ? 'Sim' : 'Não'}`,
      ...(codigoPedido ? [`Pedido: #${codigoPedido}`] : []),
    ].join('\n');
    if (!salvo) {
      const url = `https://wa.me/${D.loja.whatsapp}?text=${encodeURIComponent(msg)}`;
      if (janela) { janela.opener = null; janela.location.href = url; } else window.location.href = url;
      $('#obrigado-lead').textContent = 'Confira se o WhatsApp abriu com a sua avaliação e toque em enviar.';
    } else if (janela) janela.close();

    const extra = $('#obrigado-extra');
    const p = document.createElement('p');
    if (nota >= 4) {
      p.textContent = `Que bom que você gostou! Se puder, poste uma foto da sua marmita e marque @${D.loja.instagram} no Instagram. A gente reposta!`;
      const a = document.createElement('a');
      a.className = 'btn btn-bloco';
      a.href = `https://instagram.com/${D.loja.instagram}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Abrir o Instagram da Fit Premium';
      extra.replaceChildren(p, a);
    } else {
      p.textContent = telefone || codigoPedido
        ? 'Sentimos muito que não foi perfeito. Nossa equipe vai ler sua mensagem e falar com você pelo WhatsApp para resolver.'
        : `Sentimos muito que não foi perfeito. Para a gente resolver, chame a equipe no WhatsApp ${D.loja.whatsappExibicao}.`;
      extra.replaceChildren(p);
    }
    form.hidden = true;
    $('#obrigado').hidden = false;
    window.scrollTo(0, 0);
  });
})();
