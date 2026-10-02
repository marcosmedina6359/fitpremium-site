(() => {
  const PIXEL = '1127229746324052';
  const CHAVE = 'fitpremium-medicao-v1';
  const painel = document.querySelector('#preferencias-medicao');
  let permitido = false;
  let iniciado = false;
  const ler = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };
  function iniciar() {
    if (iniciado || !permitido || location.hostname !== 'fitpremium.onrender.com') return;
    iniciado = true;
    // Código-base da Meta. Não configura correspondência avançada nem envia campos do formulário.
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    window._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    n('set', 'autoConfig', false, PIXEL);
    n('init', PIXEL);
    const script = document.createElement('script');
    script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    n('track', 'PageView');
  }
  window.FIT_MEDICAO = (evento, dados = {}) => {
    if (!permitido || !iniciado || typeof window.fbq !== 'function') return;
    // Lista fechada: jamais aceitar nome, telefone, endereço, observações ou conteúdo da conversa.
    const parametros = {};
    if (Number.isFinite(dados.value)) { parametros.value = dados.value; parametros.currency = 'BRL'; }
    if (Number.isInteger(dados.num_items)) parametros.num_items = dados.num_items;
    if (['AddToCart', 'InitiateCheckout', 'Contact'].includes(evento)) window.fbq('track', evento, parametros);
    if (evento === 'WhatsAppIntent') window.fbq('trackCustom', evento, parametros);
  };
  function escolher(valor) {
    permitido = valor === 'sim';
    try { localStorage.setItem(CHAVE, valor); } catch {}
    if (permitido) {
      if (iniciado) window.fbq('consent', 'grant');
      else iniciar();
    } else if (iniciado) window.fbq('consent', 'revoke');
    painel.hidden = true;
  }
  document.querySelector('#medicao-aceitar').addEventListener('click', () => escolher('sim'));
  document.querySelector('#medicao-recusar').addEventListener('click', () => escolher('nao'));
  document.querySelector('#medicao-preferencias').addEventListener('click', () => { painel.hidden = false; });
  const escolha = ler();
  permitido = escolha === 'sim';
  painel.hidden = escolha === 'sim' || escolha === 'nao';
  iniciar();
})();
