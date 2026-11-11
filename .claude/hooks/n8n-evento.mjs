// Envia eventos do fluxo de desenvolvimento ao n8n (painel de estado do Lume).
//   POST {LUME_N8N_URL}/webhook/lume-dev-evento   (padrão http://localhost:5678)
//   Cabeçalho X-Lume-Token: $LUME_N8N_TOKEN       Corpo: {tarefa, etapa, agente, status, resumo, sessao, ts}
// Modos (argumento): sessao (SessionStart), agente (PostToolUse Agent|Task), subagente (SubagentStop),
// comando (PostToolUse Bash: git commit / gh pr create bem-sucedidos), stop (Stop).
// FALHA ABERTA: timeout de 2 s, silencioso, sai sempre 0 e nunca trava a sessão. Sem token = não envia.
// LUME_N8N_URL e LUME_N8N_TOKEN vêm do ambiente; só se faltarem, são lidas do .env da raiz (apenas essas duas chaves).
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { comandos, git, lerEntrada, limpar, semAtribuicoes } from './lib-comum.mjs';
import { ROOT, lerTexto, tarefaAtual } from './lib-metricas.mjs';

setTimeout(() => process.exit(0), 3000).unref?.(); // rede de segurança: nada trava a sessão

const ETAPAS = ['jira', 'plano', 'aprovado', 'implementacao', 'qa', 'seguranca', 'review', 'commit', 'pr', 'registro', 'concluida', 'pausada'];

// ---------- configuração ----------
function configuracao() {
  let url = process.env.LUME_N8N_URL || '';
  let token = process.env.LUME_N8N_TOKEN || '';
  if (!url || !token) {
    // Lê só estas chaves, na raiz e em infra/n8n/.env (onde o ambiente local do n8n guarda o token).
    for (const arq of [join(ROOT, '.env'), join(ROOT, 'infra', 'n8n', '.env')]) {
      try {
        if (!existsSync(arq)) continue;
        for (const l of readFileSync(arq, 'utf8').split(/\r?\n/)) {
          const m = l.match(/^\s*(LUME_N8N_URL|LUME_N8N_TOKEN|LUME_N8N_PORT)\s*=\s*(.*?)\s*$/);
          if (!m) continue;
          const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
          if (m[1] === 'LUME_N8N_URL' && !url) url = v;
          if (m[1] === 'LUME_N8N_PORT' && !url && v) url = `http://localhost:${v}`;
          if (m[1] === 'LUME_N8N_TOKEN' && !token) token = v;
        }
      } catch { /* .env ilegível: segue sem */ }
    }
  }
  return { url: (url || 'http://localhost:5678').replace(/\/+$/, ''), token };
}

// ---------- dedução de etapa ----------
const semAcento = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Palavras da linha "Etapa atual" -> etapa do contrato (a ordem importa: a mais específica primeiro).
const PALAVRAS = [
  [/conclu|finaliz|feito/, 'concluida'],
  [/paus/, 'pausada'],
  [/regist/, 'registro'],
  [/\bpr\b|pull request/, 'pr'],
  [/commit/, 'commit'],
  [/review|revis/, 'review'],
  [/seguran|\bseg\b|appsec|privacidade/, 'seguranca'],
  [/\bqa\b|qualidade|teste/, 'qa'],
  [/implement|codif|desenvolv|execu/, 'implementacao'],
  [/aprovad|aprovac/, 'aprovado'],
  [/plano|planej|dimension|despacho/, 'plano'],
  [/jira|backlog|pegar|selec/, 'jira'],
];

function etapaDoPlano(tarefa) {
  if (!/^LUME-\d+$/.test(tarefa)) return null;
  const txt = lerTexto(`docs/tarefas/${tarefa}.md`);
  const linha = txt.match(/Etapa atual[^\n]*/i)?.[0];
  if (!linha) return null;
  const valor = semAcento(linha.replace(/^[^:]*:/, '').replace(/[*_`]/g, ''));
  if (ETAPAS.includes(valor.trim())) return valor.trim();
  for (const [re, etapa] of PALAVRAS) if (re.test(valor)) return etapa;
  return null;
}

// Reserva: etapa pelo papel do agente quando o plano não diz.
function etapaDoAgente(agente) {
  const a = String(agente || '');
  if (/^seg-/.test(a)) return 'seguranca';
  if (/qa-|qual-melhoria/.test(a)) return 'qa';
  if (/qual-revisor/.test(a)) return 'review';
  if (/ops-gestor/.test(a)) return 'registro';
  if (/^(cto|produto)$|techlead|edge-cases|dev-designer/.test(a)) return 'plano';
  if (/^dev-/.test(a)) return 'implementacao';
  return null;
}

// ---------- montagem e envio ----------
function evento({ tarefa, etapa, agente, status, resumo, sessao }) {
  return {
    tarefa: tarefa || '-',
    etapa: ETAPAS.includes(etapa) ? etapa : 'implementacao',
    agente: agente || 'sessao',
    status,
    resumo: limpar(resumo, 200),
    sessao: sessao || '',
    ts: new Date().toISOString(),
  };
}

async function enviar(corpo) {
  const { url, token } = configuracao();
  if (!token) return; // sem token configurado: não envia
  try {
    await fetch(`${url}/webhook/lume-dev-evento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Lume-Token': token },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(2000),
    });
  } catch { /* falha aberta: n8n fora do ar não atrapalha a sessão */ }
}

function textoDe(v) {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map((c) => c?.text || '').join(' ');
  if (v && typeof v === 'object') return textoDe(v.content ?? v.text ?? v.result ?? '');
  return '';
}

function statusDoTexto(txt, falhou) {
  if (falhou) return 'falhou';
  if (/^\s*[*_#>\s-]*(BLOQUEAD[OA]|bloqueada?\b)/i.test(txt) || /\bstatus"?\s*[:=]\s*"?bloquead/i.test(txt)) return 'bloqueada';
  return 'concluida';
}

async function main() {
  const modo = process.argv[2] || '';
  const ev = await lerEntrada();
  const sessao = String(ev.session_id || '');
  const tarefaDoBriefing = String(ev.tool_input?.prompt || '').match(/tarefa"?\s*[:\s]\s*"?(LUME-\d+)/i)?.[1];
  const tarefa = tarefaDoBriefing || tarefaAtual();
  const t = /^LUME-\d+$/.test(tarefa) ? tarefa : '-';

  if (modo === 'sessao') {
    await enviar(evento({ tarefa: t, etapa: etapaDoPlano(t) || (t === '-' ? 'jira' : 'implementacao'), agente: 'sessao', status: 'iniciada',
      resumo: t === '-' ? 'sessão iniciada sem tarefa em andamento' : `sessão iniciada (${ev.source || 'startup'}) na tarefa ${t}`, sessao }));
  } else if (modo === 'stop') {
    if (t === '-') return; // fim de turno sem tarefa: nada a informar (evita ruído)
    await enviar(evento({ tarefa: t, etapa: etapaDoPlano(t) || 'pausada', agente: 'sessao', status: 'concluida', resumo: 'fim do turno da sessão', sessao }));
  } else if (modo === 'agente') {
    let r = ev.tool_response ?? {};
    if (typeof r === 'string') { try { r = JSON.parse(r); } catch { r = { content: r }; } }
    const agente = ev.tool_input?.subagent_type || r.agentType || 'general-purpose';
    const falhou = Boolean(r.is_error || r.isError || r.error);
    const status = r.isAsync ? 'iniciada' : statusDoTexto(textoDe(r.content ?? r.result ?? ''), falhou);
    await enviar(evento({ tarefa: t, etapa: etapaDoPlano(t) || etapaDoAgente(agente) || 'implementacao', agente, status,
      resumo: ev.tool_input?.description || `${agente} ${status}`, sessao }));
  } else if (modo === 'subagente') {
    const agente = ev.agent_type || ev.subagent_type || 'desconhecido';
    const resumo = textoDe(ev.last_assistant_message) || `${agente} encerrou`;
    await enviar(evento({ tarefa: t, etapa: etapaDoPlano(t) || etapaDoAgente(agente) || 'implementacao', agente,
      status: statusDoTexto(textoDe(ev.last_assistant_message), false), resumo, sessao }));
  } else if (modo === 'comando') {
    const cmd = ev.tool_input?.command || '';
    let cmds = [];
    try { cmds = comandos(cmd); } catch { return; }
    const commit = cmds.map((c) => git(c.words)).find((g) => g?.sub === 'commit');
    const pr = cmds.map((c) => semAtribuicoes(c.words)).find((w) => /^gh(\.exe)?$/i.test(basename(w[0] || '')) && w[1] === 'pr' && w[2] === 'create');
    if (commit) {
      const i = commit.args.findIndex((a) => /^-[a-zA-Z]*m$/.test(a) || a === '--message');
      const msg = i >= 0 ? commit.args[i + 1] || '' : '';
      await enviar(evento({ tarefa: t, etapa: 'commit', agente: 'sessao', status: 'concluida', resumo: msg.split(/\r?\n/)[0] || 'commit realizado', sessao }));
    }
    if (pr) {
      const url = textoDe(ev.tool_response?.stdout ?? ev.tool_response).match(/https:\/\/github\.com\/\S+\/pull\/\d+/)?.[0];
      await enviar(evento({ tarefa: t, etapa: 'pr', agente: 'sessao', status: 'concluida', resumo: url ? `PR aberto: ${url}` : 'PR aberto', sessao }));
    }
  }
}

try { await main(); } catch { /* falha aberta */ }
process.exit(0);
