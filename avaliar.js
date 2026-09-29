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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nota = Number(form.nota.value);
    if (!nota) {
      $('#aviso-avaliar').textContent = 'Escolha de 1 a 5 estrelas para enviar.';
      $('#estrelas').scrollIntoView({ block: 'center' });
      return;
    }
    const limpa = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const aspectos = [...form.querySelectorAll('input[name="aspecto"]:checked')].map((i) => i.value);
    const nome = limpa(form.nome.value) || 'Não informado';
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
      `Pode publicar no site: ${form.autoriza.checked ? 'Sim' : 'Não'}`,
    ].join('\n');
    window.open(`https://wa.me/${D.loja.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');

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
      p.textContent = 'Sentimos muito que não foi perfeito. Nossa equipe vai ler sua mensagem e falar com você para resolver.';
      extra.replaceChildren(p);
    }
    form.hidden = true;
    $('#obrigado').hidden = false;
    window.scrollTo(0, 0);
  });
})();
