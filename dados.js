// Banco de dados da Fit Premium — preços e regras de 30/09/2026 (linha Leve 300 g).
// Para alterar preços, pratos ou kits, edite apenas este arquivo.
window.FIT_DADOS = {
  loja: {
    nome: 'Fit Premium Marmitaria',
    whatsapp: '5521993046464',
    // Chave Pix mostrada ao cliente que escolher Pix (e na confirmação enviada pelo painel).
    pix: { tipo: 'E-mail', chave: 'fitpremiumarmitaria@gmail.com' },
    // Servidor de pedidos e avaliações (Render). Se estiver fora do ar, o site usa só o WhatsApp.
    api: 'https://fitpremium-api.onrender.com',
    whatsappExibicao: '(21) 99304-6464',
    instagram: 'fitpremiumarmitaria',
    horario: 'Todos os dias, das 8h às 20h',
    regiao: 'Jacarepaguá',
    pesoMarmita: '450 g ou 300 g',
  },

  // Dois tamanhos com as mesmas receitas (desde 30/09/2026). Dá para misturar os dois no mesmo kit (ex.: casal).
  // 300 g: menos acompanhamento e a mesma proteína — para quem come menos (dieta, porção menor).
  tamanhos: {
    tradicional: { peso: '450 g' },
    leve: { peso: '300 g', descricao: 'porção menor, rica em proteína' },
  },

  // Preço por marmita em cada combo, por categoria: precos = 450 g, precosLeve = 300 g.
  combos: [
    { id: 10, nome: 'Kit Experimente', marmitas: 10, maxPratos: 4,  precos: { Frango: 30, Carne: 33, Peixe: 33 }, precosLeve: { Frango: 26, Carne: 29, Peixe: 29 }, freteGratis: false },
    { id: 15, nome: 'Kit Rotina Fit',  marmitas: 15, maxPratos: 5,  precos: { Frango: 28, Carne: 32, Peixe: 32 }, precosLeve: { Frango: 24, Carne: 28, Peixe: 28 }, freteGratis: true, destaque: 'Para organizar a semana' },
    { id: 30, nome: 'Kit Premium',     marmitas: 30, maxPratos: 10, precos: { Frango: 26, Carne: 30, Peixe: 30 }, precosLeve: { Frango: 22, Carne: 26, Peixe: 26 }, freteGratis: true, destaque: 'Melhor preço' },
    // Avulsas: de 1 a 9 marmitas, sem combo. Serve também de referência para mostrar a economia dos combos.
    { id: 1, nome: 'Marmitas avulsas', avulso: true, minimo: 1, marmitas: 9, maxPratos: 9, precos: { Frango: 35, Carne: 38, Peixe: 38 }, precosLeve: { Frango: 30, Carne: 33, Peixe: 33 }, freteGratis: false },
  ],

  pratos: {
    Frango: [
      'Escondidinho de frango',
      'Estrogonofe de frango',
      'Frango xadrez com arroz e legumes',
      'Sobrecoxa assada com arroz e legumes',
      'Panqueca de frango',
      'Frango à parmegiana com batata gratinada',
      'Frango grelhado com cebola caramelizada e batata gratinada',
    ],
    Carne: [
      'Escondidinho de carne',
      'Carne moída com purê e legumes',
      'Carne moída com purê de abóbora',
      'Estrogonofe de carne',
      'Espaguete à bolonhesa',
      'Panqueca de carne',
      'Carne à parmegiana com purê e legumes',
      'Carne assada desfiada com purê',
      'Lasanha à bolonhesa',
      'Lasanha de berinjela',
    ],
    Peixe: [
      'Filé de peixe com purê de batata e legumes',
      'Moqueca de peixe com arroz',
    ],
  },

  // Fora dos combos: vendidos avulsos.
  extras: {
    categoria: 'Camarão',
    preco: 40,
    pratos: ['Escondidinho de camarão', 'Estrogonofe de camarão', 'Bobó de camarão'],
  },

  // Entrega: taxa por bairro (tabela baseada na da Marmitas da Lulu, 29/09/2026).
  // Desde 30/09/2026 entregamos SÓ em Jacarepaguá (até ajustar a logística de motoboy/caixa térmica).
  // Para voltar a atender Barra/Recreio/Zona Sul, recrie as faixas de R$ 15 e R$ 20 (ver histórico do git).
  // freteGratisAPartirDe: nº de marmitas do combo a partir do qual a entrega nessa faixa sai grátis.
  entrega: {
    // Janelas de entrega que o cliente escolhe no pedido (motoboy de aplicativo, rotas agrupadas por região).
    periodos: ['Manhã (9h às 12h)', 'Tarde (14h às 18h)'],
    // Nomes alternativos que o cliente (ou o CEP) pode mandar.
    apelidos: { 'freguesia': 'Freguesia (Jacarepaguá)', 'freguesia jpa': 'Freguesia (Jacarepaguá)', 'colonia': 'Colônia',
      'colonia (jacarepagua)': 'Colônia' },
    faixas: [
    { cidade: 'Rio de Janeiro', taxa: 10, freteGratisAPartirDe: 15, bairros: [
        'Anil', 'Camorim', 'Cidade de Deus', 'Colônia', 'Curicica', 'Freguesia (Jacarepaguá)',
        'Gardênia Azul', 'Jacarepaguá', 'Pechincha', 'Praça Seca', 'Tanque', 'Taquara', 'Vila Valqueire',
      ] },
    ],
  },

  // Itens avulsos (fora dos combos), preço por unidade. Fonte: equipe, 29/09/2026.
  avulsos: [
    {
      categoria: 'Caldos',
      itens: [
        { nome: 'Caldo verde', preco: 25 },
        { nome: 'Canjica', preco: 25 },
        { nome: 'Caldo de alho-poró com bacon', preco: 25 },
        { nome: 'Canja de galinha', preco: 25 },
        { nome: 'Caldo de batata-baroa com gorgonzola e bacon', preco: 32.9 },
        { nome: 'Caldo de feijão-branco com camarão', preco: 32.9 },
      ],
    },
    {
      categoria: 'Feijões',
      itens: [
        { nome: 'Feijão vermelho', preco: 22 },
        { nome: 'Feijão preto', preco: 22.9 },
      ],
    },
    {
      categoria: 'Empadão',
      itens: [
        { nome: 'Empadão de frango 500 g', preco: 30 },
        { nome: 'Empadão de frango 250 g', preco: 16.5 },
      ],
    },
    {
      categoria: 'Bolos',
      itens: [
        { nome: 'Bolo vulcão de cenoura com chocolate', preco: 20.9 },
        { nome: 'Bolo vulcão de chocolate com cobertura de prestígio', preco: 20.9 },
      ],
    },
  ],

  // Sobremesas no pote de 250 g (fonte: grupo Informes e Promoções, 29/09/2026).
  // preco: valor por pote. Use null para mostrar "valor a confirmar".
  sobremesas: {
    categoria: 'Sobremesas',
    peso: '250 g',
    preco: 20.9,
    // Descontos por quantidade (ex.: [{ qtd: 3, preco: 45 }]) e preço especial nos kits ({ aPartirDe: 15, preco: 15 }).
    // Sem desconto desde 30/09/2026: preço único por pote.
    pacotes: [],
    precoNoCombo: null,
    imagem: 'fotos/sobremesas-250g.jpg',
    itens: ['Torta de limão', 'Marido gelado', 'Banoffee', 'Brigadeirão', 'Pudim', 'Bombom de uva'],
  },

  // Foto de cada prato (pasta fotos/). Pratos sem foto aparecem sem imagem.
  fotosPratos: {
    'Carne moída com purê e legumes': 'fotos/foto-02.jpg',
    'Frango xadrez com arroz e legumes': 'fotos/foto-08.jpg',
    'Estrogonofe de frango': 'fotos/foto-10.jpg',
    'Carne assada desfiada com purê': 'fotos/foto-15.jpg',
    'Espaguete à bolonhesa': 'fotos/foto-19.jpg',
    'Carne moída com purê de abóbora': 'fotos/foto-20.jpg',
    'Moqueca de peixe com arroz': 'fotos/foto-09.jpg',
    // Identificadas pelas fotos em 30/09/2026 (conferir com a cozinha):
    'Panqueca de carne': 'fotos/foto-01.jpg',
    'Panqueca de frango': 'fotos/foto-17.jpg',
    'Sobrecoxa assada com arroz e legumes': 'fotos/foto-03.jpg',
    'Escondidinho de frango': 'fotos/foto-04.jpg',
    'Escondidinho de carne': 'fotos/foto-04.jpg',
    'Lasanha à bolonhesa': 'fotos/foto-06.jpg',
    'Frango grelhado com cebola caramelizada e batata gratinada': 'fotos/foto-07.jpg',
    'Frango à parmegiana com batata gratinada': 'fotos/foto-11.jpg',
    'Carne à parmegiana com purê e legumes': 'fotos/foto-12.jpg',
    'Filé de peixe com purê de batata e legumes': 'fotos/foto-13.jpg',
    'Lasanha de berinjela': 'fotos/foto-16.jpg',
    'Empadão de frango 500 g': 'fotos/empadao.jpg',
    'Empadão de frango 250 g': 'fotos/empadao.jpg',
  },

  // Fotos da galeria "Nossas marmitas" e do topo do site.
  fotosTopo: ['fotos/foto-08.jpg', 'fotos/foto-15.jpg', 'fotos/foto-20.jpg', 'fotos/foto-02.jpg'],
  galeria: ['fotos/foto-03.jpg', 'fotos/foto-05.jpg', 'fotos/foto-09.jpg', 'fotos/foto-11.jpg',
            'fotos/foto-12.jpg', 'fotos/foto-13.jpg', 'fotos/foto-16.jpg', 'fotos/foto-19.jpg',
            'fotos/foto-01.jpg', 'fotos/foto-07.jpg', 'fotos/foto-18.jpg', 'fotos/foto-21.jpg'],

  // Avaliações aprovadas para aparecer no site (seção "Clientes satisfeitos").
  // Chegam pelo WhatsApp a partir da página avaliar.html. Copie só as que o cliente autorizou.
  // Formato: { nome: 'Ana', bairro: 'Freguesia', nota: 5, texto: 'Comida deliciosa...', prato: 'Estrogonofe de frango' },
  avaliacoes: [
  ],

  observacoes: {
    'Lasanha de berinjela': 'Leva carne moída',
  },

  // Cashback da 1ª compra: kits a partir de 15 marmitas ganham crédito para a próxima compra, liberado na entrega.
  primeiraCompra: { tipo: 'cashback', valor: 30, validadeDias: 30, aPartirDe: 15, texto: 'Primeira compra a partir de 15 marmitas? Ganhe R$ 30 de cashback para usar em até 30 dias!' },

  // Indique e ganhe: quem indica ganha crédito quando o indicado recebe o 1º pedido.
  indicacao: { valor: 30, validadeDias: 30 },

  // Entrega por motoboy de aplicativo (sem maquininha): cartão é pago por link antes do envio.
  // Vales (Alelo, Ticket, VR) voltam aqui quando o recebimento a distância for confirmado.
  pagamentos: ['Pix', 'Cartão de crédito (link de pagamento)', 'Cartão de débito (link de pagamento)'],
};
