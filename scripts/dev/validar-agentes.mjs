#!/usr/bin/env node
// Valida a organização de agentes do Lume: frontmatter dos 25 agentes em .claude/agents, nomes batendo com
// o arquivo, maxTurns de 5 a 50, hierarquia e modelos do docs/org/organograma.md, referências a agentes
// inexistentes e termos da stack nos agentes genéricos (lista em docs/projeto/perfil.md, seção 6).
// Uso: node scripts/dev/validar-agentes.mjs [raiz]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = process.argv[2] ? resolve(process.argv[2]) : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const erros = [];
const avisos = [];

const ESPERADOS = [
  'cto', 'produto', 'dev-techlead', 'dev-edge-cases', 'dev-backend-dominio', 'dev-backend-dados',
  'dev-backend-integracoes', 'dev-frontend-arquitetura', 'dev-frontend-design', 'dev-frontend-performance',
  'dev-devops-cicd', 'dev-devops-infra', 'dev-designer', 'dev-qa-funcional', 'dev-qa-automacao', 'dev-qa-extremos',
  'dev-ia-produto', 'qual-revisor-critico', 'qual-melhoria-continua', 'seg-lider', 'seg-appsec', 'seg-dados',
  'seg-privacidade-dpo', 'ops-gestor-demandas', 'Explore',
];
const PROIBIDOS = ['ceo', 'cfo', 'coo', 'posvenda-onboarding', 'qual-lider'];
const GENERICOS_EXCECAO = new Set(['Explore']);
const MODELOS = new Set(['opus', 'sonnet', 'haiku', 'inherit']);
const FERRAMENTAS = new Set(['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'WebFetch', 'WebSearch', 'NotebookEdit', 'PowerShell', 'Agent', 'Task', 'SendMessage', 'TodoWrite']);

function frontmatter(texto) {
  const m = texto.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  return Object.fromEntries(
    m[1].split(/\r?\n/).map((l) => l.match(/^(\w[\w-]*):\s*(.*)$/)).filter(Boolean).map((x) => [x[1], x[2].trim().replace(/^["']|["']$/g, '')]),
  );
}

// Termos de stack do perfil
const arqPerfil = join(raiz, 'docs', 'projeto', 'perfil.md');
const perfil = existsSync(arqPerfil) ? readFileSync(arqPerfil, 'utf8') : '';
const termos = (perfil.match(/termos_stack:\s*\[([^\]]*)\]/)?.[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!termos.length) avisos.push('perfil sem "termos_stack": checagem de termos da stack pulada');

// Organograma: linhas "| setor | `agente` | modelo | maxTurns | reporta a | papel |"
const arqOrg = join(raiz, 'docs', 'org', 'organograma.md');
const organograma = new Map();
if (existsSync(arqOrg)) {
  for (const l of readFileSync(arqOrg, 'utf8').split(/\r?\n/)) {
    const c = l.split('|').map((x) => x.trim());
    const m = c[2]?.match(/^`([^`]+)`$/);
    if (m && MODELOS.has(c[3])) organograma.set(m[1], { modelo: c[3], turnos: Number(c[4]), pai: (c[5] || '').replace(/`/g, '') });
  }
  if (organograma.size !== ESPERADOS.length) erros.push(`organograma.md lista ${organograma.size} agentes, esperado ${ESPERADOS.length}`);
} else {
  avisos.push('docs/org/organograma.md ausente: hierarquia não validada');
}

// Agentes
const dirAgentes = join(raiz, '.claude', 'agents');
const agentes = new Set();
const arquivos = existsSync(dirAgentes) ? readdirSync(dirAgentes).filter((f) => f.endsWith('.md')) : [];
if (!existsSync(dirAgentes)) erros.push('pasta .claude/agents inexistente');

for (const arq of arquivos) {
  const txt = readFileSync(join(dirAgentes, arq), 'utf8');
  const fm = frontmatter(txt);
  const nome = basename(arq, '.md');
  if (!fm) { erros.push(`${arq}: sem frontmatter`); continue; }
  agentes.add(fm.name);
  if (fm.name !== nome) erros.push(`${arq}: name "${fm.name}" diferente do arquivo`);
  if (!ESPERADOS.includes(nome)) erros.push(`${arq}: agente fora da lista de 25 do organograma`);
  if (PROIBIDOS.includes(nome)) erros.push(`${arq}: agente que não existe no Lume`);
  if (!/^[a-z][a-z0-9-]*$/.test(fm.name || '') && !GENERICOS_EXCECAO.has(fm.name)) erros.push(`${arq}: name inválido`);
  if (!fm.description || fm.description.length < 40) erros.push(`${arq}: description ausente ou curta demais (diga quando usar)`);
  if (!MODELOS.has(fm.model)) erros.push(`${arq}: model "${fm.model}" inválido`);
  const turnos = Number(fm.maxTurns);
  if (!/^\d+$/.test(fm.maxTurns || '') || turnos < 5 || turnos > 50) erros.push(`${arq}: maxTurns ausente ou fora de 5 a 50`);
  for (const t of (fm.tools || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    if (!FERRAMENTAS.has(t) && !t.startsWith('mcp__') && !/^(Agent|Task)\(/.test(t)) erros.push(`${arq}: ferramenta desconhecida "${t}"`);
  }
  if (!txt.includes('docs/org/protocolo.md')) erros.push(`${arq}: não referencia docs/org/protocolo.md`);
  const org = organograma.get(nome);
  if (org) {
    if (fm.model !== org.modelo) avisos.push(`${arq}: model "${fm.model}" difere do organograma ("${org.modelo}")`);
    if (turnos !== org.turnos) avisos.push(`${arq}: maxTurns ${fm.maxTurns} difere do organograma (${org.turnos})`);
  }
  // Termos da stack só nos agentes genéricos: líderes de stack e executores legitimamente os citam,
  // então só avisa. A regra é mover o detalhe para o perfil.
  const corpo = txt.toLowerCase();
  const citados = termos.filter((t) => new RegExp(`(^|[^\\p{L}\\w])${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\w])`, 'u').test(corpo));
  if (citados.length > 0 && /^(qual-|ops-)/.test(nome)) erros.push(`${arq}: cita termos da stack (${citados.join(', ')}); mova a regra para o perfil`);
}

// Faltando e hierarquia
for (const esperado of ESPERADOS) if (arquivos.length && !agentes.has(esperado)) erros.push(`agente ausente: ${esperado}`);
for (const [nome, o] of organograma) {
  if (o.pai !== 'usuário' && !organograma.has(o.pai)) erros.push(`organograma: "${nome}" reporta a "${o.pai}", que não está na tabela`);
  if (o.pai === nome) erros.push(`organograma: "${nome}" reporta a si mesmo`);
  // ciclos
  const vistos = new Set([nome]);
  for (let p = o.pai; p && p !== 'usuário'; p = organograma.get(p)?.pai) {
    if (vistos.has(p)) { erros.push(`organograma: ciclo na hierarquia envolvendo "${nome}"`); break; }
    vistos.add(p);
  }
  if (!ESPERADOS.includes(nome)) erros.push(`organograma: agente inesperado "${nome}"`);
}

// Referências a agentes em skills, docs/org e agentes
const CANDIDATO = /`((?:cto|produto)|(?:dev|qual|seg|ops|posvenda)-[a-z0-9-]+|ceo|cfo|coo)`/g;
const refs = [];
const dirSkills = join(raiz, '.claude', 'skills');
if (existsSync(dirSkills)) {
  for (const d of readdirSync(dirSkills)) {
    const f = join(dirSkills, d, 'SKILL.md');
    if (!existsSync(f)) { erros.push(`skills/${d}: sem SKILL.md`); continue; }
    const fm = frontmatter(readFileSync(f, 'utf8'));
    if (!fm?.name || fm.name !== d) erros.push(`skills/${d}: name "${fm?.name}" diferente da pasta`);
    if (!fm?.description) erros.push(`skills/${d}: sem description`);
    refs.push(f);
  }
}
const dirOrg = join(raiz, 'docs', 'org');
if (existsSync(dirOrg)) for (const f of readdirSync(dirOrg)) refs.push(join(dirOrg, f));
for (const a of arquivos) refs.push(join(dirAgentes, a));

for (const f of refs) {
  const txt = readFileSync(f, 'utf8');
  const rel = f.slice(raiz.length + 1).replace(/\\/g, '/');
  if (rel === 'docs/org/organograma.md') continue; // cita ceo/cfo/coo de propósito, ao dizer que não existem
  for (const [, nome] of txt.matchAll(CANDIDATO)) {
    if (!ESPERADOS.includes(nome) && !nome.endsWith('-') && !nome.includes('...')) erros.push(`${rel}: cita o agente inexistente "${nome}"`);
  }
}

console.log(`Agentes: ${agentes.size}/${ESPERADOS.length} · organograma: ${organograma.size} · skills: ${existsSync(dirSkills) ? readdirSync(dirSkills).length : 0} · termos de stack: ${termos.length}`);
for (const a of avisos) console.log(`aviso: ${a}`);
if (erros.length) {
  for (const e of erros) console.log(`ERRO: ${e}`);
  process.exitCode = 1;
} else {
  console.log('OK: organização válida.');
}
