# Site Fit Premium Marmitaria

Site estático para montar combos de marmitas e enviar o pedido pelo WhatsApp.

- Preços, pratos e combos: `dados.js`
- Publicado no Render como Static Site (configuração em `render.yaml`). Cada `git push` publica de novo automaticamente.

## Medição (02/10/2026)

Pixel exclusivo da Fit Premium: `1127229746324052`. `medicao.js` só carrega a Meta no domínio de produção e após a escolha "Permitir medição". O rodapé permite mudar a escolha. Correspondência avançada automática desativada. Campos do pedido não fazem parte dos parâmetros enviados.

- `PageView`: visita após permissão.
- `AddToCart`: adição manual ou montagem sugerida de kit; é uma interação, não um comprador único.
- `InitiateCheckout`: abertura do formulário; reaberturas podem gerar novos eventos.
- `Contact`: clique em link para o WhatsApp, sem comprovar envio da mensagem.
- `WhatsAppIntent` (personalizado): pedido preparado e encaminhamento iniciado para o WhatsApp, sem comprovar envio nem pagamento.
- Não enviamos `Purchase`: pagamento e confirmação acontecem fora do site. Vendas devem ser conciliadas com o painel de pedidos.

Os dados dependem da permissão do visitante e de bloqueadores de rastreamento; não representam todos os acessos. Testes locais não enviam eventos à Meta. Validar com `node --test test/medicao.test.cjs` e com a aba Eventos de teste da Meta, sem criar compras fictícias em produção.

O CSP em `render.yaml` é uma referência: os mesmos cabeçalhos são cadastrados na aba Headers do Render. Mudanças no YAML isoladamente não atualizam esses cabeçalhos.
