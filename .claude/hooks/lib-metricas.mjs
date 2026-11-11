// Registro e leitura de docs/metricas/execucoes.csv, compartilhado pelos hooks de métricas.
// Uma linha por execução de subagente; agentes retomados (mesmo agent_id) gravam só o consumo novo.
// Sem dependências externas. A raiz vem de CLAUDE_PROJECT_DIR (ou do repositório do cwd).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { localizarRepo } from './lib-comum.mjs';

export const ROOT = process.env.CLAUDE_PROJECT_DIR || localizarRepo(process.cwd())?.pasta || process.cwd();
export const DIR = join(ROOT, 'docs', 'metricas');
export const ARQ = join(DIR, 'execucoes.csv');
export const CAB = 'data;tarefa;agente;modelo;entrada;cache_leitura;cache_escrita;saida;total;duracao_ms;ferramentas;agent_id';
export const FORA_DE_TAREFA = 'sessao';
export const ORCAMENTO_PADRAO = 2_000_000; // tokens ponderados por tarefa
export const REGEX_TAREFA = /tarefa"?\s*[:\s]\s*"?(LUME-\d+)/i;

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function lerTexto(rel) {
  try { return readFileSync(join(ROOT, rel), 'utf8'); } catch { return ''; }
}

// "2026-11-11 14:03" no fuso America/Sao_Paulo.
export function agora() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

// Tokens ponderados pelo preço relativo: saída custa 5x a entrada, escrita de cache 1,25x, leitura de cache 0,1x.
export function ponderado({ entrada = 0, leitura = 0, escrita = 0, saida = 0 }) {
  return Math.round(n(entrada) + n(saida) * 5 + n(escrita) * 1.25 + n(leitura) * 0.1);
}

export function parseLinha(l) {
  const [data, tarefa, agente, modelo, entrada, leitura, escrita, saida, total, duracao, ferramentas, agentId = ''] = l.split(';');
  return { data, tarefa, agente, modelo, entrada: n(entrada), leitura: n(leitura), escrita: n(escrita), saida: n(saida),
    total: n(total), duracao: n(duracao), ferramentas: n(ferramentas), agentId: agentId.trim() };
}

// Ignora cabeçalhos repetidos e linhas duplicadas exatas.
export function ler(arq = ARQ) {
  if (!existsSync(arq)) return [];
  const vistas = new Set();
  const linhas = [];
  for (const l of readFileSync(arq, 'utf8').split(/\r?\n/)) {
    if (!l.trim() || l.startsWith('data;tarefa;') || vistas.has(l)) continue;
    vistas.add(l);
    linhas.push(l);
  }
  return linhas.map(parseLinha);
}

// Sem docs/tarefas/_atual (arquivo local, fora do git) vale "sessao".
export function tarefaAtual() {
  return lerTexto('docs/tarefas/_atual').trim().split(/\r?\n/)[0].trim() || FORA_DE_TAREFA;
}

// Grava a execução. Com agentId, desconta o que esse agente já registrou (retomada pelo ID) e não grava
// nada se não houver consumo novo: assim o PostToolUse e o SubagentStop do mesmo agente não contam em dobro.
// Devolve o registro gravado, ou null.
export function registrar(reg, { arq = ARQ, data = agora() } = {}) {
  mkdirSync(join(arq, '..'), { recursive: true });
  if (!existsSync(arq)) writeFileSync(arq, CAB + '\n');
  const r = { entrada: n(reg.entrada), leitura: n(reg.leitura), escrita: n(reg.escrita), saida: n(reg.saida),
    duracao: n(reg.duracao), ferramentas: n(reg.ferramentas) };
  if (reg.agentId) {
    const antes = ler(arq).filter((x) => x.agentId === reg.agentId);
    if (antes.length && reg.soSeNovo) return null;
    for (const x of antes) for (const k of Object.keys(r)) r[k] -= x[k];
    for (const k of Object.keys(r)) r[k] = Math.max(0, r[k]);
  } else if (reg.soSeNovo) {
    // Sem ID: o SubagentStop do mesmo agente acabou de gravar se a última linha é dele, no mesmo minuto.
    const ult = ler(arq).at(-1);
    if (ult && ult.agente === reg.agente && ult.data === data) return null;
  }
  const total = r.entrada + r.leitura + r.escrita + r.saida;
  if (!total) return null;
  const linha = [data, reg.tarefa || FORA_DE_TAREFA, reg.agente || 'desconhecido', reg.modelo || '', r.entrada, r.leitura,
    r.escrita, r.saida, total, r.duracao, r.ferramentas, reg.agentId || ''].join(';');
  appendFileSync(arq, linha + '\n');
  return { ...reg, ...r, total };
}

// Teto de tokens ponderados da tarefa: campo "Orçamento (ponderado):" do arquivo da tarefa, ou o padrão.
export function orcamentoDaTarefa(tarefa) {
  const m = lerTexto(`docs/tarefas/${tarefa}.md`).match(/Orçamento \(ponderado\):\*\*\s*([\d.]+)/);
  return m ? Number(m[1].replace(/\./g, '')) : ORCAMENTO_PADRAO;
}

// maxTurns do frontmatter do agente (0 se não houver).
export function maxTurnsDo(agente) {
  const m = lerTexto(`.claude/agents/${agente}.md`).match(/^maxTurns:\s*(\d+)/m);
  return m ? Number(m[1]) : 0;
}

// Orçamento DINÂMICO (regra "Qualidade acima de tokens e de limites de execução"): o teto do plano é a
// referência de economia. Passou dela, a referência escala até 2x e o trabalho segue até concluir sem cortar
// nada. Passou de 2x, a sessão/agente atual encerra com passagem de contexto COMPLETA e a tarefa continua em
// outro agente/sessão (de novo a cada 2x a mais). O aviso sai só quando o gasto cruza um patamar novo.
// Patamar: 0 = dentro da referência; 1 = entre 1x e 2x; k >= 2 = passou de 2^(k-1)x.
export function patamar(gasto, teto) {
  if (!(teto > 0) || gasto <= teto) return 0;
  return Math.ceil(Math.log2(gasto / teto));
}

// Avisos da tarefa: patamar novo de orçamento dinâmico e execução que bateu o maxTurns do papel.
export function avisos(tarefa, ultima, { regs = ler(), teto = orcamentoDaTarefa(tarefa), limite } = {}) {
  const out = [];
  if (tarefa !== FORA_DE_TAREFA && tarefa !== '-') {
    const daTarefa = regs.filter((r) => r.tarefa === tarefa);
    const gasto = daTarefa.reduce((s, r) => s + ponderado(r), 0);
    const ultimoGasto = daTarefa.length ? ponderado(daTarefa[daTarefa.length - 1]) : 0;
    const atual = patamar(gasto, teto);
    const antes = patamar(gasto - ultimoGasto, teto);
    const fmt = (v) => v.toLocaleString('pt-BR');
    if (atual > antes && atual === 1) {
      out.push(`Orçamento dinâmico da ${tarefa}: gasto de ${fmt(gasto)} tokens ponderados passou da referência do plano (${fmt(teto)}); limite ampliado até 2x (${fmt(teto * 2)}). Siga até concluir com a mesma qualidade (nunca corte escopo/qualidade), poupando recurso: briefings objetivos, sem retrabalho, agentes só onde dividem trabalho de verdade. Registre no log da tarefa o motivo do consumo extra.`);
    } else if (atual > antes && atual >= 2) {
      out.push(`Orçamento dinâmico da ${tarefa}: gasto de ${fmt(gasto)} tokens ponderados passou de ${fmt(2 ** (atual - 1))}x a referência (${fmt(teto)}). Encerre o trabalho desta sessão/agente com passagem de contexto COMPLETA (atualize docs/tarefas/${tarefa}.md, o .log.md e docs/tarefas/${tarefa}.retomada.md: estado, decisões, o que falta, arquivos e donos, critérios de pronto, achados abertos) e continue em outro agente/sessão com esse contexto. Não deixe atividade no meio sem registro e não corte escopo/qualidade.`);
    }
  }
  const lim = limite ?? (ultima ? maxTurnsDo(ultima.agente) : 0);
  if (ultima && lim && ultima.ferramentas >= lim) {
    out.push(`${ultima.agente} usou ${ultima.ferramentas} chamadas (maxTurns ${lim}): a saída pode estar parcial. Retome AGORA o mesmo agente pelo ID (SendMessage "continue de onde parou", com o que falta) ou passe a outro com contexto COMPLETO, até concluir a MESMA solução planejada; não deixe a atividade pendente e não corte escopo nem qualidade.`);
  }
  return out;
}
