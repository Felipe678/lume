import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarWorkflow, validarCaminhos, PASTA_PADRAO } from '../validar-workflows.mjs';

const ler = (f) => JSON.parse(readFileSync(join(PASTA_PADRAO, f), 'utf8'));
const ETAPAS = ['jira', 'plano', 'aprovado', 'implementacao', 'qa', 'seguranca', 'review', 'commit', 'pr', 'registro', 'concluida', 'pausada'];
const base = () => ({
  name: 'Teste', active: false, settings: {}, connections: { 'Início': { main: [[{ node: 'Fim', type: 'main', index: 0 }]] } },
  nodes: [
    { id: 'a', name: 'Início', type: 'n8n-nodes-base.noOp', typeVersion: 1, position: [0, 0], parameters: {} },
    { id: 'b', name: 'Fim', type: 'n8n-nodes-base.noOp', typeVersion: 1, position: [200, 0], parameters: {} },
  ],
});

test('validador: workflow mínimo correto passa', () => assert.deepEqual(validarWorkflow(base()), []));

test('validador: chaves obrigatórias', () => {
  const wf = base(); delete wf.settings;
  assert.match(validarWorkflow(wf).join('\n'), /settings/);
});

test('validador: ids e nomes repetidos', () => {
  const wf = base(); wf.nodes[1].id = 'a'; wf.nodes[1].name = 'Início';
  const m = validarWorkflow(wf).join('\n');
  assert.match(m, /id de nó repetido/); assert.match(m, /nome de nó repetido/);
});

test('validador: conexão para nó inexistente', () => {
  const wf = base(); wf.connections['Início'].main[0][0].node = 'Fantasma';
  assert.match(validarWorkflow(wf).join('\n'), /inexistente/);
});

test('validador: segredo literal e token fixo', () => {
  const wf = base(); wf.nodes[0].parameters = { cabecalho: 'Bearer abcdefghijklmnopqrstuvwxyz', token: 'meu-token-fixo' };
  const m = validarWorkflow(wf).join('\n');
  assert.match(m, /segredo literal/); assert.match(m, /campo sensível/);
});

test('validador: expressão em campo sensível é aceita', () => {
  const wf = base(); wf.nodes[0].parameters = { token: '={{ $json.token }}' };
  assert.deepEqual(validarWorkflow(wf), []);
});

test('validador: nome de nó em inglês', () => {
  const wf = base(); wf.nodes[0].name = 'Edit Fields'; delete wf.connections['Início'];
  assert.match(validarWorkflow(wf).join('\n'), /inglês/);
});

test('validador: webhook sem autenticação é recusado', () => {
  const wf = base(); wf.nodes[0].type = 'n8n-nodes-base.webhook'; wf.nodes[0].parameters = { authentication: 'none' };
  assert.match(validarWorkflow(wf).join('\n'), /sem autenticação/);
});

test('validador: workflow chamado deve existir', () => {
  const wf = base(); wf.nodes[0].type = 'n8n-nodes-base.executeWorkflow'; wf.nodes[0].parameters = { workflowId: { value: 'nao-existe' } };
  assert.match(validarWorkflow(wf, 'x', { idsConhecidos: new Set(['outro']) }).join('\n'), /inexistente/);
});

test('todos os workflows da pasta passam no validador', () => {
  const { arquivos, problemas } = validarCaminhos([PASTA_PADRAO]);
  assert.equal(arquivos, 4); assert.deepEqual(problemas, []);
});

test('mestre de desenvolvimento: gatilho único, autenticado e ativo', () => {
  const wf = ler('lume-orquestrador-desenvolvimento.json');
  assert.equal(wf.active, true);
  const webhooks = wf.nodes.filter((n) => n.type === 'n8n-nodes-base.webhook');
  assert.equal(webhooks.length, 1);
  assert.equal(webhooks[0].parameters.path, 'lume-dev-evento');
  assert.equal(webhooks[0].parameters.httpMethod, 'POST');
  assert.equal(webhooks[0].parameters.authentication, 'headerAuth');
  assert.equal(webhooks[0].credentials.httpHeaderAuth.name, 'lume-token');
  assert.equal(wf.nodes.filter((n) => /Trigger$/.test(n.type)).length, 0);
});

test('mestre de desenvolvimento: raias presentes', () => {
  const wf = ler('lume-orquestrador-desenvolvimento.json');
  const notas = wf.nodes.filter((n) => n.type === 'n8n-nodes-base.stickyNote').map((n) => n.parameters.content).join('\n');
  for (const r of ['Jira', 'Plano', 'Aprovação', 'Implementação', 'QA', 'Segurança', 'Review', 'Commit e PR', 'Registro no Jira', 'Concluída', 'Pausa', 'Bloqueios']) {
    assert.ok(notas.includes(`· ${r}`), `raia ausente: ${r}`);
  }
  const nomes = wf.nodes.map((n) => n.name);
  for (const a of ['backend', 'frontend', 'design system', 'devops', 'IA']) assert.ok(nomes.includes(`4 · Implementação — ${a}`), a);
  assert.ok(nomes.includes('2 · Plano — dev-techlead') && nomes.includes('2 · Plano — dev-edge-cases'));
});

test('mestre de desenvolvimento: toda etapa do contrato é roteada', () => {
  const wf = ler('lume-orquestrador-desenvolvimento.json');
  const sw = wf.nodes.find((n) => n.name === 'Rotear por etapa');
  const chaves = sw.parameters.rules.values.map((r) => r.outputKey);
  assert.deepEqual(chaves, ETAPAS);
  const saidas = wf.connections['Rotear por etapa'].main;
  ETAPAS.forEach((e, i) => assert.ok(saidas[i]?.length >= 1, `etapa sem destino: ${e}`));
});

test('mestre de desenvolvimento: etapas convergem para Registrar estado e falhas vão a Bloqueios', () => {
  const wf = ler('lume-orquestrador-desenvolvimento.json');
  const paraRegistro = Object.entries(wf.connections).filter(([, c]) => c.main.flat().some((l) => l.node === 'Registrar estado')).map(([k]) => k);
  assert.ok(paraRegistro.length >= 14);
  const falha = wf.connections['Falhou ou bloqueou?'].main[0][0].node;
  assert.equal(falha, 'Preparar: tratar bloqueio');
});

test('núcleo: operações do roteador existem', () => {
  const wf = ler('_core/lume-core.json');
  const chaves = wf.nodes.find((n) => n.name === 'Qual operação?').parameters.rules.values.map((r) => r.outputKey);
  assert.deepEqual(chaves, ['normalizar_evento', 'registrar_estado', 'tratar_erro', 'notificar', 'ler_estado']);
  assert.ok(wf.nodes.some((n) => n.type === 'n8n-nodes-base.executeWorkflowTrigger'));
});

test('mestre de produto: inativo, seis módulos, gatilhos desativados e raia de IA', () => {
  const wf = ler('lume-orquestrador-produto.json');
  assert.equal(wf.active, false);
  const gatilhos = wf.nodes.filter((n) => /(scheduleTrigger|webhook)$/.test(n.type));
  assert.equal(gatilhos.length, 6);
  assert.ok(gatilhos.every((g) => g.disabled === true));
  const notas = wf.nodes.filter((n) => n.type === 'n8n-nodes-base.stickyNote').map((n) => n.parameters.content).join('\n');
  for (const m of ['Tempo e objetivos', 'Saúde', 'Finanças', 'Patrimônio', 'Documentos', 'Visão da vida']) assert.ok(notas.includes(`Módulo · ${m}`), m);
  assert.match(notas, /Extensão de IA \(futuro\)/);
  assert.match(notas, /Nunca recomendar dose/);
  assert.match(notas, /LGPD art\. 11/);
  assert.ok(wf.nodes.filter((n) => n.name.startsWith('IA ·')).every((n) => n.disabled && n.type === 'n8n-nodes-base.noOp'));
});

test('painel: GET, ativo, HTML e sem dependência externa', () => {
  const wf = ler('lume-painel.json');
  assert.equal(wf.active, true);
  const wh = wf.nodes.find((n) => n.type === 'n8n-nodes-base.webhook');
  assert.equal(wh.parameters.httpMethod, 'GET'); assert.equal(wh.parameters.path, 'lume-painel');
  const resp = wf.nodes.find((n) => n.type === 'n8n-nodes-base.respondToWebhook');
  assert.match(JSON.stringify(resp.parameters), /text\/html/);
  const js = wf.nodes.find((n) => n.name === 'Montar página HTML').parameters.jsCode;
  assert.ok(!/https?:\/\//.test(js), 'sem URL externa');
  assert.match(js, /prefers-reduced-motion/); assert.match(js, /content="5"/); assert.match(js, /const esc/);
});
