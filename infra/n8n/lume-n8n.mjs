#!/usr/bin/env node
// CLI do n8n local do Lume (D13). Sem dependências.
// Uso: node infra/n8n/lume-n8n.mjs <up|down|status|logs|importar|credencial-token>
// Nunca imprime valores de segredos.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const COMPOSE = resolve(AQUI, 'docker-compose.yml');
const ENV_ARQ = resolve(AQUI, '.env');
const WORKFLOWS = resolve(AQUI, '..', '..', 'automations', 'workflows');
const PROJETO = 'lume-n8n';
const OBRIGATORIAS = ['LUME_N8N_DB_PASSWORD', 'LUME_N8N_ENCRYPTION_KEY', 'LUME_N8N_TOKEN'];

class Falha extends Error {}
const die = (m) => { throw new Falha(m); };

function carregarEnv() {
  if (!existsSync(ENV_ARQ)) die('infra/n8n/.env não existe. Copie .env.example para .env e preencha os segredos (veja o README).');
  const env = {};
  for (const linha of readFileSync(ENV_ARQ, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  const faltam = OBRIGATORIAS.filter((k) => !env[k]);
  if (faltam.length) die(`variáveis vazias no .env: ${faltam.join(', ')}.`);
  env.LUME_N8N_PORT ||= '5678';
  return env;
}

let env;
const compose = (args, op = {}) => spawnSync('docker',
  ['compose', '-p', PROJETO, '-f', COMPOSE, '--env-file', ENV_ARQ, ...args],
  { encoding: 'utf8', stdio: op.captura ? 'pipe' : 'inherit' });

function precisaDocker() {
  const r = spawnSync('docker', ['info'], { stdio: 'ignore' });
  if (r.error || r.status !== 0) die('o Docker não está rodando. Abra o Docker Desktop e tente de novo.');
}

async function saudavel(timeoutMs = 3000) {
  try {
    const r = await fetch(`http://127.0.0.1:${env.LUME_N8N_PORT}/healthz`, { signal: AbortSignal.timeout(timeoutMs) });
    return r.ok;
  } catch { return false; }
}

function up() {
  precisaDocker();
  const r = compose(['up', '-d', '--wait']);
  if (r.status !== 0) die('falha ao subir o n8n. Se for o pull da imagem com erro de certificado, veja "Rede com inspeção SSL" no README. Logs: node infra/n8n/lume-n8n.mjs logs');
  console.log(`n8n no ar: http://localhost:${env.LUME_N8N_PORT} (db e n8n saudáveis).`);
}

function down() {
  precisaDocker();
  if (compose(['down']).status !== 0) die('falha ao derrubar o ambiente.'); // nunca com -v: os dados persistem
  console.log('Ambiente parado. Os volumes foram mantidos.');
}

async function status() {
  precisaDocker();
  compose(['ps']);
  const ok = await saudavel();
  console.log(`n8n /healthz: ${ok ? 'ok' : 'sem resposta'}`);
  if (!ok) process.exitCode = 1;
}

function logs(args) {
  precisaDocker();
  compose(['logs', '--tail', '200', ...(args.includes('-f') ? ['-f'] : []), 'n8n']);
}

const n8n = (args) => compose(['exec', '-T', 'n8n', 'n8n', ...args], { captura: true });
const mostra = (r) => { if (r.stdout) process.stdout.write(r.stdout); if (r.stderr) process.stderr.write(r.stderr); };

function importar() {
  precisaDocker();
  if (!existsSync(WORKFLOWS)) die('automations/workflows/ não existe ainda. Nada para importar.');
  const arquivos = readdirSync(WORKFLOWS).filter((f) => f.endsWith('.json'));
  if (!arquivos.length) die('automations/workflows/ não tem nenhum .json.');
  const rodando = compose(['ps', '-q', '--status', 'running', 'n8n'], { captura: true }).stdout?.trim();
  if (!rodando) die('o n8n não está rodando. Rode "up" antes.');

  // Credencial do webhook (id e nome "lume-token"): o valor vem do ambiente do contêiner e nunca passa por aqui.
  const gerar = "require('fs').writeFileSync('/tmp/lume-cred.json',JSON.stringify([{id:'lume-token',name:'lume-token',type:'httpHeaderAuth',data:{name:'X-Lume-Token',value:process.env.LUME_N8N_TOKEN}}]))";
  const cred = compose(['exec', '-T', 'n8n', 'sh', '-c', `node -e "${gerar}" && n8n import:credentials --input=/tmp/lume-cred.json; rm -f /tmp/lume-cred.json`], { captura: true });
  mostra(cred);
  if (cred.status !== 0) die('não consegui criar a credencial "lume-token" (veja a saída acima).');

  const imp = n8n(['import:workflow', '--separate', '--input=/data/automations/workflows']);
  mostra(imp);
  if (imp.status !== 0) die('a importação falhou (veja a saída acima). Causas comuns: JSON inválido, ou ainda não existe usuário dono (crie no primeiro acesso, veja o README).');
  // O subworkflow _core fica numa subpasta, que o --separate não percorre.
  const nucleo = n8n(['import:workflow', '--separate', '--input=/data/automations/workflows/_core']);
  mostra(nucleo);
  if (nucleo.status !== 0) die('a importação do _core falhou (veja a saída acima).');

  // Em n8n 2.x a importação deixa os workflows inativos; os marcados "active": true são publicados/ativados.
  let ativos = 0;
  // O _core vai primeiro e é sempre publicado: o n8n recusa publicar um workflow cujo subworkflow não está publicado.
  const lista = [
    ...readdirSync(resolve(WORKFLOWS, '_core')).filter((f) => f.endsWith('.json')).map((f) => ({ f: resolve(WORKFLOWS, '_core', f), nucleo: true })),
    ...arquivos.map((f) => ({ f: resolve(WORKFLOWS, f), nucleo: false })),
  ];
  for (const { f, nucleo } of lista) {
    let wf;
    try { wf = JSON.parse(readFileSync(f, 'utf8')); } catch { continue; }
    if ((wf.active !== true && !nucleo) || !wf.id) continue;
    let r = n8n(['publish:workflow', `--id=${wf.id}`]);
    if (r.status !== 0) r = n8n(['update:workflow', `--id=${wf.id}`, '--active=true']);
    if (r.status !== 0) { mostra(r); console.error(`AVISO: não consegui ativar "${wf.name ?? f}" (id ${wf.id}). Ative pelo editor.`); continue; }
    ativos++;
  }
  console.log(`${arquivos.length} arquivo(s) importado(s); ${ativos} ativado(s). Reinicie o n8n para registrar os webhooks: docker compose -p ${PROJETO} -f infra/n8n/docker-compose.yml restart n8n`);
}

function credencialToken() {
  console.log(`Token do webhook dos hooks (valor NÃO exibido aqui).
1. O valor está em infra/n8n/.env, variável LUME_N8N_TOKEN (o compose a repassa ao contêiner).
2. O comando "importar" cria sozinho a credencial Header Auth "lume-token" (id e nome iguais; cabeçalho
   X-Lume-Token) a partir dessa variável, sem exibir o valor. Os webhooks dos workflows usam essa credencial.
3. Os hooks do Claude Code (.claude/hooks/n8n-evento.mjs) leem o token de infra/n8n/.env e enviam o header
   "X-Lume-Token" para http://localhost:${env.LUME_N8N_PORT}/webhook/lume-dev-evento.
4. Para rotacionar: gere outro valor, atualize o .env, rode "up" (recria o contêiner) e "importar" de novo.`);
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (!['up', 'down', 'status', 'logs', 'importar', 'credencial-token'].includes(cmd)) {
    die('uso: node infra/n8n/lume-n8n.mjs <up|down|status|logs [-f]|importar|credencial-token>');
  }
  env = carregarEnv();
  if (cmd === 'up') up();
  else if (cmd === 'down') down();
  else if (cmd === 'status') await status();
  else if (cmd === 'logs') logs(args);
  else if (cmd === 'importar') importar();
  else credencialToken();
} catch (e) {
  if (!(e instanceof Falha)) throw e;
  console.error(`ERRO: ${e.message}`);
  process.exit(1);
}
