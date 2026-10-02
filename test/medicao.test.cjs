const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function contexto(escolha, hostname = 'fitpremium.onrender.com') {
  const elements = new Map(); const scripts = [];
  const document = { querySelector(id) { if (!elements.has(id)) elements.set(id, { hidden:true, addEventListener(_, cb) { this.click = cb; } }); return elements.get(id); }, createElement() { return {}; }, head: { appendChild(script) { scripts.push(script); } } };
  const ctx = { window: {}, document, location: { hostname }, localStorage: { getItem() {return escolha;}, setItem(_,valor) {escolha=valor;} } };
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../medicao.js'),'utf8'),ctx);
  return {ctx, elements, scripts, eventos:()=>ctx.window.fbq ? Array.from(ctx.window.fbq.queue, a=>Array.from(a)) : []};
}
test('não carrega Meta antes da escolha, ao recusar ou em localhost',()=>{
  for (const escolha of [null,'nao']) {const c=contexto(escolha);c.ctx.window.FIT_MEDICAO('Contact');assert.equal(c.scripts.length,0);}
  const c=contexto(null,'localhost');c.elements.get('#medicao-aceitar').click();assert.equal(c.scripts.length,0);
});
test('consentimento inicia uma vez; revogação interrompe os eventos',()=>{
  const c=contexto(null);c.elements.get('#medicao-aceitar').click();
  assert.equal(c.scripts.length,1);assert.equal(c.eventos().filter(e=>e[1]==='PageView').length,1);
  c.elements.get('#medicao-recusar').click();const n=c.eventos().length;c.ctx.window.FIT_MEDICAO('Contact');assert.equal(c.eventos().length,n);
  c.elements.get('#medicao-aceitar').click();assert.equal(c.scripts.length,1);
});
test('não envia dados pessoais nem registra compra no redirecionamento',()=>{
  const c=contexto('sim');c.ctx.window.FIT_MEDICAO('WhatsAppIntent',{value:396,num_items:15,nome:'Teste',telefone:'21999998888',endereco:'Rua teste'});
  const ultimo=c.eventos().at(-1);assert.equal(ultimo[0],'trackCustom');assert.equal(ultimo[1],'WhatsAppIntent');
  assert.deepEqual(JSON.parse(JSON.stringify(ultimo[2])),{value:396,currency:'BRL',num_items:15});
  const n=c.eventos().length;c.ctx.window.FIT_MEDICAO('Purchase',{value:396});assert.equal(c.eventos().length,n);
});
