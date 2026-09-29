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
      'Arroz, legumes e frango xadrez',
      'Sobrecoxa assada com legumes e arroz',
      'Panqueca de frango',
      'Parmegiana de frango com batata gratinada',
      'Frango grelhado com cebola caramelizada e batata gratinada',
    ],
    Carne: [
      'Escondidinho de carne',
      'Carne moída com purê e legumes',
      'Carne moída com purê de abóbora',
      'Estrogonofe de carne',
      'Espaguete à bolonhesa',
      'Panqueca de carne',
      'Parmegiana de carne com purê e legumes',
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

  observacoes: {
    'Lasanha de berinjela': 'Leva carne moída',
  },

  pagamentos: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Alelo Refeição', 'Ticket Flex', 'VR Alimentação', 'VR Refeição'],
};
