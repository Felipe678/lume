// PostToolUse (Write|Edit|MultiEdit): avisa quando o arquivo de plano docs/tarefas/<código>.md passa de 150 linhas.
// O plano fica com objetivo, pronto, despacho e briefings; contratos longos vão para <código>.contratos.md
// e log, cenários extremos e pausa para <código>.log.md (que não têm limite). Nunca bloqueia: saída 2 só avisa.
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const LIMITE = 150;

let input = '';
for await (const chunk of process.stdin) input += chunk;
let ev;
try { ev = JSON.parse(input || '{}'); } catch { process.exit(0); }

const caminho = String(ev.tool_input?.file_path || '').replace(/\\/g, '/');
const nome = basename(caminho);
if (!/\/docs\/tarefas\/[^/]+$/.test(caminho) || !/^LUME-\d+\.md$/.test(nome) || !existsSync(caminho)) process.exit(0);

const linhas = readFileSync(caminho, 'utf8').split(/\r?\n/).length;
if (linhas > LIMITE) {
  const base = nome.replace(/\.md$/, '');
  console.error(`${nome} tem ${linhas} linhas (limite ${LIMITE}). Mova contratos longos para ${base}.contratos.md e log, cenários extremos e pausa para ${base}.log.md.`);
  process.exit(2);
}
