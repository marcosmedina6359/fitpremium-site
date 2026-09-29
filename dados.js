// Banco de dados da Fit Premium — fonte: catálogo do WhatsApp Business (23/09/2026)
// e respostas rápidas da loja. Para alterar preços, pratos ou combos, edite apenas este arquivo.
window.FIT_DADOS = {
  loja: {
    nome: 'Fit Premium Marmitaria',
    whatsapp: '5521993046464',
    whatsappExibicao: '(21) 99304-6464',
    instagram: 'fitpremiumarmitaria',
    horario: 'Todos os dias, das 8h às 20h',
    regiao: 'Jacarepaguá',
    pesoMarmita: '450 g',
  },

  // Preço por marmita em cada combo, por categoria.
  combos: [
    { id: 7,  nome: 'Plano Semanal',   marmitas: 7,  maxPratos: 3,  precos: { Frango: 30, Carne: 33, Peixe: 33 }, freteGratis: false },
    { id: 15, nome: 'Plano Quinzenal', marmitas: 15, maxPratos: 5,  precos: { Frango: 28, Carne: 31, Peixe: 31 }, freteGratis: true, destaque: 'Mais pedido' },
    { id: 30, nome: 'Plano Mensal',    marmitas: 30, maxPratos: 10, precos: { Frango: 26, Carne: 29, Peixe: 29 }, freteGratis: true, destaque: 'Melhor preço' },
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
    ],
  },

  // Fora dos combos: vendidos avulsos.
  extras: {
    categoria: 'Camarão',
    preco: 40,
    pratos: ['Escondidinho de camarão', 'Estrogonofe de camarão', 'Bobó de camarão'],
  },

  // Sobremesas no pote de 250 g (fonte: grupo Informes e Promoções, 29/09/2026).
  // preco: valor por pote. Use null para mostrar "valor a confirmar".
  sobremesas: {
    categoria: 'Sobremesas',
    peso: '250 g',
    preco: 18,
    // Descontos por quantidade: o site monta a melhor combinação de pacotes para o cliente.
    pacotes: [{ qtd: 3, preco: 45 }, { qtd: 2, preco: 32 }],
    // Nos combos a partir de 15 marmitas, cada pote sai por este valor.
    precoNoCombo: { aPartirDe: 15, preco: 15 },
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
  },

  // Fotos da galeria "Nossas marmitas" e do topo do site.
  fotosTopo: ['fotos/foto-08.jpg', 'fotos/foto-15.jpg', 'fotos/foto-20.jpg', 'fotos/foto-02.jpg'],
  galeria: ['fotos/foto-03.jpg', 'fotos/foto-05.jpg', 'fotos/foto-09.jpg', 'fotos/foto-11.jpg',
            'fotos/foto-12.jpg', 'fotos/foto-13.jpg', 'fotos/foto-16.jpg', 'fotos/foto-19.jpg',
            'fotos/foto-01.jpg', 'fotos/foto-07.jpg', 'fotos/foto-18.jpg', 'fotos/foto-21.jpg'],

  observacoes: {
    'Lasanha de berinjela': 'Leva carne moída',
  },

  pagamentos: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Alelo Refeição', 'Ticket Flex', 'VR Alimentação', 'VR Refeição'],
};
