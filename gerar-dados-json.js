// Gera dados.json a partir de dados.js. O servidor de pedidos lê só o JSON (não executa código do site).
// Rodar sempre que dados.js mudar:  node gerar-dados-json.js
const fs = require('fs');
const vm = require('vm');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(__dirname + '/dados.js', 'utf8'), ctx);
fs.writeFileSync(__dirname + '/dados.json', JSON.stringify(ctx.window.FIT_DADOS, null, 2) + '\n');
console.log('dados.json gerado');
