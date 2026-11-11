#!/usr/bin/env node
// Validador offline dos workflows n8n do Lume. Sem dependências, sem rede, sem n8n.
// Uso: node automations/validar-workflows.mjs [arquivo|pasta ...]   (padrão: automations/workflows)
// Saída: 0 sem problemas; 1 com problemas; 2 erro de uso.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
export const PASTA_PADRAO = join(aqui, 'workflows');
export const CHAVES_OBRIGATORIAS = ['name', 'nodes', 'connections', 'settings', 'active'];
// Webhooks que podem ficar sem autenticação (painel só de leitura, em localhost).
export const WEBHOOKS_SEM_AUTENTICACAO = ['Lume · Painel'];
// Nomes padrão em inglês que o n8n gera; todo nó deve ser renomeado para português.
export const NOMES_PADRAO_INGLES = [
  /^webhook\d*$/i, /^code\d*$/i, /^set\d*$/i, /^if\d*$/i, /^switch\d*$/i, /^edit fields/i, /^respond to webhook/i,
  /^execute workflow/i, /^sticky note/i, /^no operation/i, /^schedule trigger/i, /^when executed/i, /^http request/i,
  /^merge\d*$/i, /^loop over/i, /^wait\d*$/i, /^manual trigger/i, /^when clicking/i, /^data table/i,
];
const SEGREDOS = [
  /sk-[A-Za-z0-9_-]{20,}/, /ghp_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /Bearer\s+[A-Za-z0-9._-]{16,}/, /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./,
  /ATATT[A-Za-z0-9_=-]{20,}/, /\b[0-9a-f]{32,}\b/i,
];
const CHAVES_SENSIVEIS = /(token|secret|password|senha|apikey|api_key|authorization)/i;

function* percorrer(v, caminho = '') {
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) yield* percorrer(v[i], caminho + '[' + i + ']'); }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* percorrer(x, caminho ? `${caminho}.${k}` : k);
  else if (typeof v === 'string') yield { texto: v, caminho };
}

const ehExpressao = (s) => s.trimStart().startsWith('=');

export function validarWorkflow(wf, arquivo = 'workflow', { idsConhecidos = null } = {}) {
  const p = [];
  const add = (m) => p.push(`${arquivo}: ${m}`);
  if (!wf || typeof wf !== 'object') { add('JSON não é um objeto'); return p; }
  for (const k of CHAVES_OBRIGATORIAS) if (!(k in wf)) add(`chave obrigatória ausente: ${k}`);
  if (typeof wf.active !== 'boolean') add('"active" deve ser booleano');
  if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) { add('"nodes" deve ser uma lista não vazia'); return p; }
  if (!wf.connections || typeof wf.connections !== 'object') { add('"connections" deve ser um objeto'); return p; }

  const ids = new Set(); const nomes = new Set();
  for (const n of wf.nodes) {
    for (const k of ['id', 'name', 'type', 'typeVersion', 'position', 'parameters']) if (!(k in n)) add(`nó sem "${k}": ${n.name ?? n.id ?? '?'}`);
    if (ids.has(n.id)) add(`id de nó repetido: ${n.id}`); ids.add(n.id);
    if (nomes.has(n.name)) add(`nome de nó repetido: ${n.name}`); nomes.add(n.name);
    if (!Array.isArray(n.position) || n.position.length !== 2 || !n.position.every(Number.isFinite)) add(`posição inválida em "${n.name}"`);
    if (typeof n.name === 'string' && NOMES_PADRAO_INGLES.some((r) => r.test(n.name))) add(`nome de nó em inglês/padrão: "${n.name}"`);
    if (n.type === 'n8n-nodes-base.webhook') {
      const auth = n.parameters?.authentication;
      if (!WEBHOOKS_SEM_AUTENTICACAO.includes(wf.name) && (!auth || auth === 'none')) add(`webhook sem autenticação: "${n.name}"`);
      if (auth === 'headerAuth' && !n.credentials?.httpHeaderAuth?.name) add(`webhook headerAuth sem credencial por nome: "${n.name}"`);
    }
    for (const [tipo, c] of Object.entries(n.credentials ?? {})) {
      if (!c || typeof c !== 'object' || !c.name) add(`credencial "${tipo}" sem nome em "${n.name}"`);
      else if (Object.keys(c).some((k) => !['id', 'name'].includes(k))) add(`credencial "${tipo}" com campos além de id/name em "${n.name}"`);
    }
    if (n.type === 'n8n-nodes-base.executeWorkflow' && idsConhecidos) {
      const alvo = n.parameters?.workflowId?.value ?? n.parameters?.workflowId;
      if (typeof alvo === 'string' && !idsConhecidos.has(alvo)) add(`"${n.name}" chama workflow inexistente: ${alvo}`);
    }
  }
  for (const [de, saidas] of Object.entries(wf.connections)) {
    if (!nomes.has(de)) add(`conexão parte de nó inexistente: ${de}`);
    for (const grupo of Object.values(saidas)) for (const lista of grupo) for (const l of lista ?? []) if (!nomes.has(l.node)) add(`conexão de "${de}" aponta para nó inexistente: ${l.node}`);
  }

  // Segredos e tokens fixos (pinData de exemplo fica de fora, mas não pode conter segredo real).
  const { pinData, ...resto } = wf;
  const varrer = (obj, ehPin) => {
    for (const { texto, caminho } of percorrer(obj)) {
      for (const r of SEGREDOS) if (r.test(texto)) { add(`possível segredo literal em ${caminho}`); break; }
      const chave = caminho.split('.').pop().replace(/\[\d+\]$/, '');
      if (!ehPin && CHAVES_SENSIVEIS.test(chave) && texto !== '' && !ehExpressao(texto)) add(`valor fixo em campo sensível (${caminho})`);
      if (/x-lume-token/i.test(caminho) && texto !== '' && !ehExpressao(texto) && !/^<.*>$/.test(texto)) add(`valor fixo de token em ${caminho}`);
    }
    // Cabeçalho X-Lume-Token com valor fixo em parâmetros de nós.
    const s = JSON.stringify(obj);
    if (!ehPin && /"name"\s*:\s*"x-lume-token"\s*,\s*"value"\s*:\s*"(?!=)[^"]+"/i.test(s)) add('X-Lume-Token com valor fixo');
  };
  varrer(resto, false); if (pinData) varrer(pinData, true);
  return p;
}

function listarJson(alvo) {
  const s = statSync(alvo);
  if (s.isFile()) return alvo.endsWith('.json') ? [alvo] : [];
  return readdirSync(alvo).flatMap((f) => listarJson(join(alvo, f)));
}

export function validarCaminhos(caminhos = [PASTA_PADRAO]) {
  const arquivos = caminhos.flatMap((c) => (existsSync(c) ? listarJson(resolve(c)) : []));
  const problemas = []; const lidos = [];
  for (const a of arquivos) {
    try { lidos.push([a, JSON.parse(readFileSync(a, 'utf8'))]); } catch (e) { problemas.push(`${a}: JSON inválido (${e.message})`); }
  }
  const idsWf = new Set();
  for (const [a, wf] of lidos) { if (wf.id) { if (idsWf.has(wf.id)) problemas.push(`${a}: id de workflow repetido: ${wf.id}`); idsWf.add(wf.id); } }
  for (const [a, wf] of lidos) problemas.push(...validarWorkflow(wf, a, { idsConhecidos: idsWf }));
  return { arquivos: lidos.length, problemas };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const { arquivos, problemas } = validarCaminhos(args.length ? args : [PASTA_PADRAO]);
  if (arquivos === 0 && problemas.length === 0) { console.error('Nenhum JSON encontrado.'); process.exit(2); }
  for (const m of problemas) console.error('✗ ' + m);
  console.log(problemas.length ? `${problemas.length} problema(s) em ${arquivos} arquivo(s).` : `OK: ${arquivos} workflow(s) válidos.`);
  process.exit(problemas.length ? 1 : 0);
}
