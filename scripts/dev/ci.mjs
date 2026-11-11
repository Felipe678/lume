#!/usr/bin/env node
// CI local do Lume: roda as verificações por etapa, sem dependências (Node >= 18).
// Uso: node scripts/dev/ci.mjs [--resumo] [app] [legado] [servidor] [n8n] [tudo]   (sem etapa = tudo)
//   app      flutter analyze + flutter test, em app/
//   legado   npm run lint + npm test, na raiz (app React, só referência)
//   servidor npm --prefix server test (servidor Express, só referência)
//   n8n      node automations/validar-workflows.mjs, se existir
//   tudo     todas as etapas acima
// --resumo: uma linha por comando e só as falhas, até 40 linhas no total.
// Não lê .env e não usa segredos.
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, delimiter, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WIN = process.platform === 'win32';
const ETAPAS = ['app', 'legado', 'servidor', 'n8n'];
const RESUMO = process.argv.includes('--resumo');
const TETO = 40;
const linhasResumo = [];

const APP = join(ROOT, 'app');
const SERVIDOR = join(ROOT, 'server');
const VALIDADOR_N8N = join(ROOT, 'automations', 'validar-workflows.mjs');

class Falha extends Error {}

function uso() {
  console.error('Uso: node scripts/dev/ci.mjs [--resumo] [app] [legado] [servidor] [n8n] [tudo]');
  console.error('Sem etapa, roda tudo. --resumo mostra uma linha por comando e só as falhas (até 40 linhas).');
}

// ---- localizar executáveis (PATH e caminhos padrão do Windows) ----
const home = process.env.USERPROFILE || process.env.HOME || '';
const EXTRAS = {
  flutter: [
    'C:\\src\\flutter\\bin', 'C:\\flutter\\bin', 'C:\\tools\\flutter\\bin', 'C:\\development\\flutter\\bin',
    join(home, 'development', 'flutter', 'bin'), join(home, 'flutter', 'bin'), join(home, 'fvm', 'default', 'bin'),
    join(home, 'AppData', 'Local', 'Programs', 'flutter', 'bin'),
  ],
  npm: ['C:\\Program Files\\nodejs', 'C:\\Program Files (x86)\\nodejs', join(home, 'AppData', 'Roaming', 'npm')],
  node: ['C:\\Program Files\\nodejs', 'C:\\Program Files (x86)\\nodejs'],
};
const EXTS = WIN ? (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';') : [''];

function ehArquivo(f) {
  try { return statSync(f).isFile(); } catch { return false; }
}

function acharExecutavel(nome) {
  const dirs = (process.env.PATH || process.env.Path || '').split(delimiter).concat(WIN ? EXTRAS[nome] || [] : []);
  for (const dir of dirs) {
    if (!dir) continue;
    for (const ext of EXTS) {
      const f = join(dir, nome + ext);
      if (ehArquivo(f)) return f;
    }
  }
  return null;
}

function exige(nome, etapa) {
  if (nome === 'node') return process.execPath;
  const f = acharExecutavel(nome);
  if (!f) throw new Falha(`ERRO: ${nome} não encontrado no PATH nem nos caminhos padrão (etapa ${etapa})`);
  return f;
}

function exigePasta(dir, etapa) {
  let ok = false;
  try { ok = statSync(dir).isDirectory(); } catch { /* ausente */ }
  if (!ok) throw new Falha(`ERRO: pasta inexistente: ${dir.replace(ROOT, '.')} (etapa ${etapa})`);
}

// ---- resumo da saída (contagens e só as falhas) ----
const CONTAGENS = [
  /^\d+:\d+ \+\d+(?: ~\d+)?(?: -\d+)?: (?:All tests passed!|Some tests failed\.)/, // flutter test
  /^\s*(?:\d+ issues? found\.?|No issues found!)/, // flutter analyze
  /^\s*Test Files\s+.+/, // vitest
  /^\s*Tests\s+\d+.*/, // vitest
  /^ℹ (?:tests|pass|fail) \d+/, // node --test
  /^\s*Found \d+ warnings? and \d+ errors?\./, // oxlint
];
const FALHA = [
  /^\s*(?:error|warning) • /, // flutter analyze
  /\[E\]\s*$/, // flutter test
  /^\s*(?:FAIL|×|✖|✗) /, // vitest e outros
  /^not ok \d+/, // TAP
  /^ERRO\b|^Erro\b|\bError:/, // scripts do projeto
];
const limpa = (l) => l.replace(/\x1b\[[0-9;]*m/g, '').replace(/\s+$/, '');

function resumir(saida, { teto = TETO, porFalha = 3, cauda = 12 } = {}) {
  const linhas = String(saida).split(/\r?\n/).map(limpa);
  const contagens = [];
  for (const re of CONTAGENS) {
    const achadas = linhas.filter((l) => re.test(l));
    if (achadas.length) contagens.push(achadas.at(-1).trim());
  }
  const falhas = [];
  const vistas = new Set();
  for (let i = 0; i < linhas.length; i++) {
    if (!FALHA.some((re) => re.test(linhas[i]))) continue;
    const bloco = [linhas[i]];
    for (let j = i + 1; j < linhas.length && bloco.length < porFalha; j++) {
      if (!linhas[j].trim() || FALHA.some((re) => re.test(linhas[j]))) break;
      bloco.push(linhas[j]);
    }
    const chave = bloco[0].trim();
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    falhas.push(...bloco.map((l) => (l.length > 200 ? `${l.slice(0, 200)}…` : l)));
  }
  let out = [...contagens, ...falhas];
  if (!out.length) out = linhas.filter((l) => l.trim()).slice(-cauda);
  if (out.length > teto) out = [...out.slice(0, teto - 1), `… mais ${out.length - teto + 1} linhas (rode a etapa sem --resumo)`];
  return out;
}

// ---- execução de comandos ----
const aspas = (s) => (/[\s"&|<>^()*]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

function roda(etapa, exe, args, cwd) {
  const nome = [exe.replace(/^.*[\\/]/, '').replace(/\.(exe|cmd|bat)$/i, ''), ...args].join(' ');
  if (!RESUMO) console.log(`[ci] ${etapa}: $ ${nome}`);
  const opts = { cwd, env: process.env, stdio: RESUMO ? 'pipe' : 'inherit', encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 };
  // .cmd/.bat no Windows precisam de shell, com a linha montada e argumentos entre aspas
  const precisaShell = WIN && /\.(cmd|bat)$/i.test(exe);
  const r = precisaShell
    ? spawnSync([exe, ...args].map(aspas).join(' '), { ...opts, shell: true })
    : spawnSync(exe, args, opts);
  const ok = !r.error && r.status === 0;
  if (RESUMO) {
    const res = resumir(`${r.stdout || ''}\n${r.stderr || ''}`);
    linhasResumo.push(`[ci] ${etapa}: ${nome} → ${ok ? 'ok' : 'FALHOU'}${ok && res.length <= 3 ? ` (${res.join(' · ')})` : ''}`);
    if (!ok) linhasResumo.push(...res.map((l) => `    ${l}`));
  }
  if (r.error) throw new Falha(`ERRO: não foi possível executar ${nome} (etapa ${etapa}): ${r.error.message}`);
  if (r.status === null) throw new Falha(`ERRO: ${nome} terminou por sinal ${r.signal} (etapa ${etapa})`);
  if (r.status !== 0) throw new Falha(`ERRO: ${nome} terminou com código ${r.status} (etapa ${etapa})`);
}

const passos = {
  app() {
    const flutter = exige('flutter', 'app');
    exigePasta(APP, 'app');
    roda('app', flutter, ['analyze'], APP);
    roda('app', flutter, ['test'], APP);
  },
  legado() {
    const npm = exige('npm', 'legado');
    if (!existsSync(join(ROOT, 'node_modules'))) throw new Falha('ERRO: node_modules ausente na raiz: rode "npm install" (etapa legado)');
    roda('legado', npm, ['run', 'lint'], ROOT);
    roda('legado', npm, ['test'], ROOT);
  },
  servidor() {
    const npm = exige('npm', 'servidor');
    exigePasta(SERVIDOR, 'servidor');
    if (!existsSync(join(SERVIDOR, 'node_modules'))) throw new Falha('ERRO: server/node_modules ausente: rode "npm --prefix server install" (etapa servidor)');
    roda('servidor', npm, ['--prefix', 'server', 'test'], ROOT);
  },
  n8n() {
    if (!existsSync(VALIDADOR_N8N)) {
      const msg = '[ci] n8n: automations/validar-workflows.mjs ainda não existe: etapa pulada';
      console.log(msg);
      if (RESUMO) linhasResumo.push(msg);
      return;
    }
    roda('n8n', exige('node', 'n8n'), [VALIDADOR_N8N], ROOT);
  },
};

// ---- principal ----
const pedidas = process.argv.slice(2).filter((a) => a !== '--resumo');
const validas = [...ETAPAS, 'tudo'];
const desconhecidas = pedidas.filter((e) => !validas.includes(e));
if (desconhecidas.length) {
  console.error(`Etapa desconhecida: ${desconhecidas.join(', ')}`);
  uso();
  process.exit(2);
}
const lista = !pedidas.length || pedidas.includes('tudo') ? ETAPAS : [...new Set(pedidas)];

const resultado = [];
for (const etapa of lista) {
  const t0 = Date.now();
  let ok = true;
  try {
    passos[etapa]();
  } catch (e) {
    ok = false;
    const msg = e instanceof Falha ? e.message : `ERRO: ${(e && e.message) || String(e)} (etapa ${etapa})`;
    console.error(msg);
    if (RESUMO) linhasResumo.push(msg);
  }
  const s = Math.round((Date.now() - t0) / 1000);
  resultado.push(`[ci] ${etapa}: ${ok ? 'ok' : 'falhou'} (${s}s)`);
  if (!RESUMO) console.log(resultado.at(-1));
}

if (RESUMO) {
  const cabe = Math.max(1, TETO - resultado.length - 1);
  const corpo = linhasResumo.length > cabe ? [...linhasResumo.slice(0, cabe - 1), '… resumo cortado (rode a etapa sem --resumo)'] : linhasResumo;
  corpo.forEach((l) => console.log(l));
}
console.log(RESUMO ? '[ci] Resumo' : '\n[ci] Resumo');
resultado.forEach((l) => console.log(l));
process.exit(resultado.some((l) => l.includes(': falhou')) ? 1 : 0);
