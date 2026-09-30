// Banco de dados da Fit Premium — preços e regras de 29/09/2026.
// Para alterar preços, pratos ou kits, edite apenas este arquivo.
window.FIT_DADOS = {
  loja: {
    nome: 'Fit Premium Marmitaria',
    whatsapp: '5521993046464',
    // Chave Pix mostrada ao cliente que escolher Pix (e na confirmação enviada pelo painel).
    pix: { tipo: 'E-mail', chave: '' },
    // Servidor de pedidos e avaliações (Render). Se estiver fora do ar, o site usa só o WhatsApp.
    api: 'https://fitpremium-api.onrender.com',
    whatsappExibicao: '(21) 99304-6464',
    instagram: 'fitpremiumarmitaria',
    horario: 'Todos os dias, das 8h às 20h',
    regiao: 'Jacarepaguá',
    pesoMarmita: '450 g',
  },

  // Preço por marmita em cada combo, por categoria.
  combos: [
    { id: 10, nome: 'Kit Experimente', marmitas: 10, maxPratos: 4,  precos: { Frango: 30, Carne: 33, Peixe: 33 }, freteGratis: false },
    { id: 15, nome: 'Kit Rotina Fit',  marmitas: 15, maxPratos: 5,  precos: { Frango: 28, Carne: 32, Peixe: 32 }, freteGratis: true, destaque: 'Mais pedido' },
    { id: 30, nome: 'Kit Premium',     marmitas: 30, maxPratos: 10, precos: { Frango: 26, Carne: 30, Peixe: 30 }, freteGratis: true, destaque: 'Melhor preço' },
    // Avulsas: de 1 a 9 marmitas, sem combo. Serve também de referência para mostrar a economia dos combos.
    { id: 1, nome: 'Marmitas avulsas', avulso: true, minimo: 1, marmitas: 9, maxPratos: 9, precos: { Frango: 35, Carne: 38, Peixe: 38 }, freteGratis: false },
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
  // freteGratisAPartirDe: nº de marmitas do combo a partir do qual a entrega nessa faixa sai grátis.
  entrega: {
    // Nomes alternativos que o cliente (ou o CEP) pode mandar.
    apelidos: { 'freguesia': 'Freguesia (Jacarepaguá)', 'freguesia jpa': 'Freguesia (Jacarepaguá)', 'colonia': 'Colônia',
      'colonia (jacarepagua)': 'Colônia', 'barra': 'Barra da Tijuca', 'recreio': 'Recreio dos Bandeirantes', 'braz de pina': 'Brás de Pina' },
    faixas: [
    { cidade: 'Rio de Janeiro', taxa: 10, freteGratisAPartirDe: 15, bairros: [
        'Anil', 'Camorim', 'Cidade de Deus', 'Colônia', 'Curicica', 'Freguesia (Jacarepaguá)',
        'Gardênia Azul', 'Jacarepaguá', 'Pechincha', 'Tanque', 'Taquara',
      ] },
    { cidade: 'Rio de Janeiro', taxa: 15, bairros: [
        'Barra da Tijuca', 'Barra Olímpica', 'Encantado', 'Jardim Sulacap', 'Méier', 'Santa Cruz',
        'São Cristóvão', 'Vargem Grande', 'Vargem Pequena', 'Vila Militar', 'Vila Valqueire',
      ] },
    { cidade: 'Rio de Janeiro', taxa: 20, bairros: [
        'Abolição', 'Acari', 'Alto da Boa Vista', 'Anchieta', 'Andaraí', 'Bancários',
        'Bangu', 'Barra de Guaratiba', 'Barros Filho', 'Benfica', 'Bento Ribeiro', 'Bonsucesso',
        'Botafogo', 'Brás de Pina', 'Cachambi', 'Cacuia', 'Caju', 'Campinho',
        'Campo Grande', 'Campo dos Afonsos', 'Cascadura', 'Catete', 'Catumbi', 'Cavalcanti',
        'Centro', 'Cidade Nova', 'Cidade Universitária', 'Cocotá', 'Coelho Neto', 'Colégio',
        'Copacabana', 'Cordovil', 'Cosme Velho', 'Cosmos', 'Costa Barros', 'Del Castilho',
        'Dendê', 'Deodoro', 'Engenheiro Leal', 'Engenho Novo', 'Engenho da Rainha', 'Engenho de Dentro',
        'Estácio', 'Flamengo', 'Freguesia (Ilha do Governador)', 'Galeão', 'Gamboa', 'Glória',
        'Grajaú', 'Grumari', 'Guadalupe', 'Guarabu', 'Guaratiba', 'Gávea',
        'Higienópolis', 'Honório Gurgel', 'Humaitá', 'Inhaúma', 'Inhoaíba', 'Ipanema',
        'Irajá', 'Itacolomi', 'Itanhangá', 'Jacarezinho', 'Jacaré', 'Jardim América',
        'Jardim Botânico', 'Jardim Carioca', 'Jardim Guanabara', 'Jardim da Posse', 'Joá', 'Lagoa',
        'Laranjeiras', 'Leblon', 'Leme', 'Lins de Vasconcelos', 'Madureira', 'Magalhães Bastos',
        'Mangueira', 'Manguinhos', 'Maracanã', 'Marechal Hermes', 'Maria da Graça', 'Maré',
        'Moneró', 'Nossa Senhora das Graças', 'Olaria', 'Oswaldo Cruz', 'Paciência', 'Padre Miguel',
        'Paquetá', 'Parada de Lucas', 'Parque Anchieta', 'Parque Colúmbia', 'Pavuna', 'Pedra de Guaratiba',
        'Penha', 'Penha Circular', 'Piedade', 'Pilares', 'Pitangueiras', 'Portuguesa',
        'Praia da Bandeira', 'Praça Seca', 'Praça da Bandeira', 'Quintino Bocaiúva', 'Ramos', 'Realengo',
        'Recreio dos Bandeirantes', 'Riachuelo', 'Ribeira', 'Ricardo de Albuquerque', 'Rio Comprido', 'Rocha',
        'Rocha Miranda', 'Rocinha', 'Sampaio', 'Santa Teresa', 'Santo Cristo', 'Santíssimo',
        'Saúde', 'Senador Camará', 'Senador Vasconcelos', 'Sepetiba', 'São Conrado', 'São Francisco Xavier',
        'Tauá', 'Tijuca', 'Todos os Santos', 'Tomás Coelho', 'Tubiacanga', 'Turiaçu',
        'Urca', 'Vasco da Gama', 'Vaz Lobo', 'Vicente de Carvalho', 'Vidigal', 'Vigário Geral',
        'Vila Isabel', 'Vila Kosmos', 'Vila da Penha', 'Vista Alegre', 'Zumbi', 'Água Santa',
      ] },
    { cidade: 'Niterói', taxa: 20, bairros: [
        'Badu', 'Bairro de Fátima', 'Baldeador', 'Barreto', 'Boa Viagem', 'Cachoeiras',
        'Cafubá', 'Camboinhas', 'Cantagalo', 'Caramujo', 'Centro', 'Charitas',
        'Cubango', 'Engenho do Mato', 'Engenhoca', 'Fonseca', 'Gragoatá', 'Icaraí',
        'Ilha da Conceição', 'Ingá', 'Itacoatiara', 'Itaipu', 'Jacaré', 'Jardim Imbuí',
        'Jurujuba', 'Largo da Batalha', 'Maceió', 'Maravista', 'Maria Paula', 'Matapaca',
        'Morro do Estado', 'Piratininga', "Ponta d'Areia", 'Pé Pequeno', 'Rio do Ouro', 'Santa Bárbara',
        'Santa Rosa', 'Santana', 'Santo Antônio', 'Sapê', 'Serra Grande', 'São Domingos',
        'São Francisco', 'São Lourenço', 'Tenente Jardim', 'Vila Progresso', 'Viradouro', 'Vital Brazil',
        'Viçoso Jardim', 'Várzea das Moças',
      ] },
    { cidade: 'Nova Iguaçu', taxa: 20, bairros: [
        'Centro', 'Cerâmica', 'Comendador Soares', 'Posse',
      ] },
    { cidade: 'Duque de Caxias', taxa: 20, bairros: [
        'Centro', 'Jardim Vinte e Cinco de Agosto',
      ] },
    { cidade: 'Nilópolis', taxa: 20, bairros: [
        'Centro', 'Olinda',
      ] },
    { cidade: 'São João de Meriti', taxa: 20, bairros: [
        'Centro', 'Coelho da Rocha', 'Jardim Meriti', 'Vilar dos Teles',
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
  ],

  // Sobremesas no pote de 250 g (fonte: grupo Informes e Promoções, 29/09/2026).
  // preco: valor por pote. Use null para mostrar "valor a confirmar".
  sobremesas: {
    categoria: 'Sobremesas',
    peso: '250 g',
    preco: 20.9,
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
    'Moqueca de peixe com arroz': 'fotos/foto-09.jpg',
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

  // Primeira compra: um doce de brinde (o servidor confere pelo WhatsApp se é mesmo a 1ª compra).
  // aPartirDe: só vale em pedidos com pelo menos esse número de marmitas (combo de 30).
  primeiraCompra: { brinde: 'sobremesa', aPartirDe: 30, texto: 'Primeira compra no combo de 30? Ganhe uma sobremesa de 250 g!' },

  // Indique e ganhe: quem indica ganha crédito quando o indicado recebe o 1º pedido.
  indicacao: { valor: 30, validadeDias: 30 },

  pagamentos: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Alelo Refeição', 'Ticket Flex', 'VR Alimentação', 'VR Refeição'],
};
