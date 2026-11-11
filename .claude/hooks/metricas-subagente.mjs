// SubagentStop: soma o consumo real do subagente (a partir do registro JSONL da execução dele)
// e grava em docs/metricas/execucoes.csv. Fonte principal das métricas: vale para agentes em primeiro
// e segundo plano; agente retomado pelo ID grava só o consumo novo. Nunca bloqueia: erros viram linha
// no log de formato e os avisos de orçamento vão como systemMessage.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { DIR, REGEX_TAREFA, agora, avisos, registrar, tarefaAtual } from './lib-metricas.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
mkdirSync(DIR, { recursive: true });
const log = (msg) => appendFileSync(join(DIR, 'formato-desconhecido.log'), `${agora()} SubagentStop: ${msg}\n`);

let ev;
try { ev = JSON.parse(input || '{}'); } catch { log('entrada não é JSON'); process.exit(0); }

const agentId = ev.agent_id || '';
const agente = ev.agent_type || ev.subagent_type || '';

// O caminho do registro pode vir com "~", ainda não gravado no disco, ou com outro nome conforme a versão;
// sem ele, deriva do registro da sessão: <sessão>/subagents/agent-<agent_id>.jsonl.
const expandir = (p) => (p && p.startsWith('~') ? join(homedir(), p.slice(1)) : p);
const candidatos = [ev.agent_transcript_path, ev.subagent_transcript_path].map(expandir).filter(Boolean);
if (ev.transcript_path && agentId) {
  const base = expandir(ev.transcript_path).replace(/\.jsonl$/, '');
  candidatos.push(join(base, 'subagents', `agent-${agentId}.jsonl`), join(dirname(base), ev.session_id || '', 'subagents', `agent-${agentId}.jsonl`));
}
let caminho = candidatos.find((c) => existsSync(c));
for (let i = 0; !caminho && candidatos.length && i < 10; i++) {
  await new Promise((ok) => setTimeout(ok, 300));
  caminho = candidatos.find((c) => existsSync(c));
}
if (!caminho) { log(`sem registro do subagente ${agente || '?'} (${agentId || 'sem id'}); tentado: ${candidatos.join(' | ') || 'nenhum caminho'}`); process.exit(0); }

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
let entrada = 0, leitura = 0, escrita = 0, saida = 0, ferramentas = 0, modelo = '', tipo = agente;
let inicio, fim, tarefaDoBriefing;
for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
  if (!linha.trim()) continue;
  let r;
  try { r = JSON.parse(linha); } catch { continue; }
  if (r.timestamp) { inicio ??= r.timestamp; fim = r.timestamp; }
  // Tarefas em paralelo: a tarefa vem do briefing do agente ("tarefa":"LUME-68" ou "Tarefa LUME-68"), não do _atual.
  if (!tarefaDoBriefing && r.type === 'user') {
    const txt = typeof r.message?.content === 'string' ? r.message.content
      : (r.message?.content || []).map((c) => c.text || '').join(' ');
    tarefaDoBriefing = txt.match(REGEX_TAREFA)?.[1];
  }
  tipo ||= r.agentType || r.subagent_type || '';
  const u = r.message?.usage;
  if (r.type !== 'assistant' || !u) continue;
  modelo = r.message.model || modelo;
  entrada += n(u.input_tokens); leitura += n(u.cache_read_input_tokens);
  escrita += n(u.cache_creation_input_tokens); saida += n(u.output_tokens);
  ferramentas += (r.message.content || []).filter((c) => c.type === 'tool_use').length;
}
if (!(entrada + leitura + escrita + saida)) { log(`registro sem consumo (${caminho})`); process.exit(0); }

const tarefa = tarefaDoBriefing || tarefaAtual();
const reg = registrar({ tarefa, agente: tipo, modelo, agentId, entrada, leitura, escrita, saida, ferramentas,
  duracao: inicio && fim ? Date.parse(fim) - Date.parse(inicio) : 0 });

const msgs = reg ? avisos(tarefa, reg) : [];
if (msgs.length) console.log(JSON.stringify({ systemMessage: msgs.join('\n') }));
