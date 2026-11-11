#!/usr/bin/env node
// Resumo do custo dos agentes a partir de docs/metricas/execucoes.csv.
// Uso: node scripts/dev/metricas.mjs [--tarefa LUME-68] [--desde dd/MM/yyyy]
// Ponderado = entrada + saída × 5 + escrita de cache × 1,25 + leitura de cache × 0,1.
// Colunas do CSV (cabeçalho obrigatório; aceita ; ou , e ignora colunas extras):
//   data;tarefa;agente;modelo;entrada;cache_leitura;cache_escrita;saida;total;duracao_ms;ferramentas;agent_id
//   (formato gravado pelos hooks; também aceita escrita_cache/leitura_cache)
// Arquivo ausente ou vazio: avisa e sai com 0.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARQ = join(ROOT, 'docs', 'metricas', 'execucoes.csv');
const ORCAMENTO_PADRAO = 2_000_000;

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const tarefa = arg('--tarefa');
const desde = arg('--desde');
if (process.argv.includes('--tarefa') && !tarefa) { console.error('ERRO: --tarefa exige a chave (ex.: LUME-68)'); process.exit(2); }

const num = (v) => { const n = Number(String(v ?? '').replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const dataNum = (s) => {
  const m = String(s || '').match(/(\d{2})\/(\d{2})\/(\d{4})/) || String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return 0;
  return String(s).includes('/') ? Number(`${m[3]}${m[2]}${m[1]}`) : Number(`${m[1]}${m[2]}${m[3]}`);
};
const ponderado = (r) => r.entrada + r.saida * 5 + r.escrita * 1.25 + r.leitura * 0.1;

function ler() {
  const linhas = readFileSync(ARQ, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];
  const sep = linhas[0].includes(';') ? ';' : ',';
  const cab = linhas[0].split(sep).map((c) => c.trim().toLowerCase());
  const col = (...nomes) => cab.findIndex((c) => nomes.includes(c));
  const ix = {
    data: col('data'), tarefa: col('tarefa'), agente: col('agente'), entrada: col('entrada'), saida: col('saida', 'saída'),
    escrita: col('cache_escrita', 'escrita_cache', 'escrita'), leitura: col('cache_leitura', 'leitura_cache', 'leitura'),
    ferramentas: col('ferramentas', 'chamadas'), duracao: col('duracao_ms', 'duracao'),
  };
  if (ix.agente < 0 || ix.tarefa < 0) throw new Error('cabeçalho sem as colunas "tarefa" e "agente"');
  const pega = (c, i) => (i >= 0 ? c[i] : '');
  return linhas.slice(1).map((l) => {
    const c = l.split(sep).map((x) => x.trim());
    const r = {
      data: pega(c, ix.data), tarefa: pega(c, ix.tarefa) || '-', agente: pega(c, ix.agente) || '?',
      entrada: num(pega(c, ix.entrada)), saida: num(pega(c, ix.saida)), escrita: num(pega(c, ix.escrita)),
      leitura: num(pega(c, ix.leitura)), ferramentas: num(pega(c, ix.ferramentas)), duracao: num(pega(c, ix.duracao)),
    };
    r.total = r.entrada + r.saida + r.escrita + r.leitura;
    r.pond = ponderado(r);
    return r;
  });
}

if (!existsSync(ARQ)) { console.log('Sem execuções registradas ainda (docs/metricas/execucoes.csv não existe).'); process.exit(0); }

let todos;
try { todos = ler(); } catch (e) { console.error(`ERRO: não foi possível ler docs/metricas/execucoes.csv: ${e.message}`); process.exit(1); }
const regs = todos.filter((r) => (!tarefa || r.tarefa === tarefa) && (!desde || dataNum(r.data) >= dataNum(desde)));
if (!regs.length) { console.log(`Sem execuções${tarefa ? ` da tarefa ${tarefa}` : ''}${desde ? ` desde ${desde}` : ''}.`); process.exit(0); }

const fmt = (x) => Math.round(x).toLocaleString('pt-BR');
const soma = (k) => regs.reduce((s, r) => s + r[k], 0);
const pct = (lista, p) => {
  const s = [...lista].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};
const chamadas = regs.map((r) => r.ferramentas);
console.log(`Execuções: ${regs.length} · brutos: ${fmt(soma('total'))} · ponderados: ${fmt(soma('pond'))} · chamadas: ${fmt(soma('ferramentas'))} (p50 ${pct(chamadas, 50)}, p90 ${pct(chamadas, 90)})${tarefa ? ` · tarefa ${tarefa}` : ''}${desde ? ` · desde ${desde}` : ''}`);
if (tarefa) {
  const gasto = soma('pond');
  console.log(`Orçamento: ${fmt(gasto)} de ${fmt(ORCAMENTO_PADRAO)} ponderados (${Math.round((100 * gasto) / ORCAMENTO_PADRAO)}%; padrão, ajuste no plano da tarefa)`);
}

function agrupar(chave) {
  const g = {};
  for (const r of regs) {
    const v = (g[r[chave]] ??= { n: 0, total: 0, pond: 0, leitura: 0, cham: 0, dur: 0 });
    v.n++; v.total += r.total; v.pond += r.pond; v.leitura += r.leitura; v.cham += r.ferramentas; v.dur += r.duracao;
  }
  return Object.entries(g).sort((a, b) => b[1].pond - a[1].pond);
}
const totalPond = soma('pond');
for (const [titulo, chave] of [['Por agente', 'agente'], ['Por tarefa', 'tarefa']]) {
  if (chave === 'tarefa' && tarefa) continue;
  console.log(`\n${titulo}: execuções · ponderados (%) · brutos · cache · chamadas · duração`);
  for (const [k, v] of agrupar(chave)) {
    const p = totalPond ? Math.round((100 * v.pond) / totalPond) : 0;
    const cache = v.total ? Math.round((100 * v.leitura) / v.total) : 0;
    console.log(`  ${k.padEnd(26)} ${String(v.n).padStart(3)}x  ${fmt(v.pond).padStart(11)} (${String(p).padStart(2)}%)  ${fmt(v.total).padStart(12)}  cache ${cache}%  ${String(v.cham).padStart(4)} cham.  ${Math.round(v.dur / 1000)}s`);
  }
}

const loops = {};
for (const r of regs) if (r.tarefa !== '-' && r.tarefa !== 'sessao') loops[`${r.tarefa} · ${r.agente}`] = (loops[`${r.tarefa} · ${r.agente}`] || 0) + 1;
const suspeitos = Object.entries(loops).filter(([, c]) => c >= 4);
if (suspeitos.length) console.log(`\nPossível loop (4+ chamadas do mesmo agente na mesma tarefa): ${suspeitos.map(([k, c]) => `${k} (${c}x)`).join(', ')}`);
const orfas = regs.filter((r) => r.tarefa === '-');
if (orfas.length) console.log(`Execuções sem rótulo ("-"): ${orfas.length}. Fora de tarefa, o rótulo correto é "sessao".`);
