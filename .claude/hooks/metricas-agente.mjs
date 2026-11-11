// PostToolUse (Agent|Task): registra o custo de um subagente em primeiro plano em docs/metricas/execucoes.csv
// (se o SubagentStop ainda não registrou esse agente) e avisa quando a tarefa passa do orçamento em tokens
// ponderados ou o agente bate o maxTurns. Nunca bloqueia a chamada, que já aconteceu; saída 2 só devolve
// o aviso ao despachante.
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR, REGEX_TAREFA, agora, avisos, registrar, tarefaAtual } from './lib-metricas.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let ev;
try { ev = JSON.parse(input || '{}'); } catch { process.exit(0); }

const ti = ev.tool_input || {};
let r = ev.tool_response ?? {};
if (typeof r === 'string') { try { r = JSON.parse(r); } catch { r = {}; } }

// Tarefas em paralelo: a tarefa vem do briefing do agente ("tarefa":"LUME-68"), como no SubagentStop; sem ela, o _atual.
const tarefa = String(ti.prompt || '').match(REGEX_TAREFA)?.[1] || tarefaAtual();
const agente = ti.subagent_type || r.agentType || 'general-purpose';
let reg = null;

// Agente em segundo plano: aqui só há o lançamento; o consumo real é registrado pelo metricas-subagente.mjs.
if (!r.isAsync) {
  const u = r.usage || {};
  reg = registrar({
    tarefa, agente, modelo: r.model || u.model || ti.model || '', agentId: r.agentId || r.agent_id || '', soSeNovo: true,
    entrada: u.input_tokens, leitura: u.cache_read_input_tokens, escrita: u.cache_creation_input_tokens, saida: u.output_tokens,
    duracao: r.totalDurationMs, ferramentas: r.totalToolUseCount,
  });
  // Sem números de uso: registra as chaves recebidas para ajustar o hook se o formato mudar.
  if (!u.input_tokens && !u.output_tokens && !r.totalTokens) {
    appendFileSync(join(DIR, 'formato-desconhecido.log'),
      `${agora()} chaves tool_response: ${Object.keys(r).join(',')} · usage: ${Object.keys(u).join(',')}\n`);
  }
}

const msgs = avisos(tarefa, reg && { agente, ferramentas: reg.ferramentas });
// Não bloqueia: o aviso entra como contexto adicional e o despachante segue até concluir.
if (msgs.length) {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msgs.join('\n') } }));
}
