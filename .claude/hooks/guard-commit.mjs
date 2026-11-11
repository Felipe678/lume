// PreToolUse (Bash): em "git commit", exige mensagem no padrão tipo(escopo): resumo
// e impede que arquivos .env entrem no commit. Dono: seg-lider.
// Detecta o comando de verdade (início do comando ou após ; && || |, if/then/do/{ }, env/sudo/xargs/time…,
// bash -c / powershell -Command, $( ) e crases), e não o texto de heredoc ou aspas usado como dado.
import { execSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { basename, isAbsolute, join, relative } from 'node:path';
import { comandos, git, lerEntrada, localizarRepo } from './lib-comum.mjs';

const TIPOS = 'feat|fix|chore|docs|test|refactor|perf|ci|build|style|revert|wip|sec';
const FORMATO = new RegExp(`^(${TIPOS})(\\([^)]+\\))?!?: \\S.*`);

// stdin vazio ou JSON ruim: libera (não é conflito provado).
const entrada = await lerEntrada();
const cmd = entrada.tool_input?.command || '';
let cmds = [];
try { cmds = comandos(cmd).map((c) => ({ ...c, g: git(c.words) })); } catch { process.exit(0); }
const commits = cmds.filter((c) => c.g?.sub === 'commit');

function bloquear(msg) {
  console.error(`Bloqueado: ${msg}`);
  process.exit(2);
}

// Qualquer arquivo .env (.env, .env.local, secrets.env), exceto .env.example.
const ehEnv = (a) => {
  const b = basename(String(a).replace(/\\/g, '/'));
  if (/\.env\.example$/.test(b)) return false;
  return /(^|\.)env$/.test(b) || /^\.env\./.test(b) || /\.env\.[\w.-]+$/.test(b);
};
const MSG_ENV = 'não adicione arquivos .env ao git.';

// Heredocs do comando : corpo de heredoc é texto de OUTRO comando (cat, tee…), não o commit.
// Varre os heredocs em ordem (ignora o que está dentro do corpo de um anterior) e devolve, para cada um, o que vem
// antes dele na linha (prefixo), o corpo e a posição. Um heredoc é "do commit" só quando o prefixo mostra que ele
// alimenta a mensagem do próprio git commit: -m "$(cat <<'EOF' ou -F - <<'EOF'.
// S7: o "<<" só conta fora de aspas e de comentários (dentro de "$( )" volta a contar, como em -m "$(cat <<'EOF'),
// e heredoc SEM terminador não é removido (o texto continua sendo vigiado pela rede do .env).
function heredocs(texto) {
  const out = [];
  const n = texto.length;
  const pilha = [{ t: 'cmd', d: 0, topo: true }];
  let salto = null; // corpo do último heredoc: { de, ate }
  let i = 0;
  while (i < n) {
    if (salto && i >= salto.de && i < salto.ate) { i = salto.ate; continue; }
    const q = pilha[pilha.length - 1];
    const c = texto[i];
    if (q.t === 'dq') {
      if (c === '\\') { i += 2; continue; }
      if (c === '"') { pilha.pop(); i++; continue; }
      if (c === '$' && texto[i + 1] === '(') { pilha.push({ t: 'cmd', d: 0 }); i += 2; continue; }
      i++; continue;
    }
    if (c === "'") { const f = texto.indexOf("'", i + 1); i = f < 0 ? n : f + 1; continue; }
    if (c === '"') { pilha.push({ t: 'dq' }); i++; continue; }
    if (c === '\\') { i += 2; continue; }
    if (c === '#' && (i === 0 || /[\s;|&()]/.test(texto[i - 1]))) { const f = texto.indexOf('\n', i); i = f < 0 ? n : f; continue; }
    if (c === '$' && texto[i + 1] === '(') { pilha.push({ t: 'cmd', d: 0 }); i += 2; continue; }
    if (c === '(') { q.d++; i++; continue; }
    if (c === ')') { if (q.d > 0) q.d--; else if (!q.topo) pilha.pop(); i++; continue; }
    if (c === '<' && texto[i + 1] === '<' && texto[i + 2] === '<') { i += 3; continue; } // here-string
    if (c === '<' && texto[i + 1] === '<') {
      const m = texto.slice(i + 2).match(/^-?[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|([^\s;|&<>()'"]+))/);
      if (!m) { i += 2; continue; }
      const delim = m[1] ?? m[2] ?? m[3];
      const fimOp = i + 2 + m[0].length;
      const nl = texto.indexOf('\n', fimOp);
      if (nl < 0) { i = fimOp; continue; } // sem corpo
      const ini = salto && salto.de === nl + 1 ? salto.ate + 1 : nl + 1; // 2º heredoc na mesma linha
      let p = ini; let corpoFim = -1; let fim = -1;
      while (p <= n) {
        let f = texto.indexOf('\n', p); if (f < 0) f = n;
        if (texto.slice(p, f).trim() === delim) { corpoFim = p; fim = f; break; }
        if (f >= n) break;
        p = f + 1;
      }
      if (fim < 0) { i = fimOp; continue; } // sem terminador: não remove nada
      const iniLinha = texto.lastIndexOf('\n', i) + 1;
      out.push({ prefixo: texto.slice(iniLinha, i), corpo: texto.slice(ini, Math.max(ini, corpoFim - 1)), de: ini, ate: fim });
      salto = { de: nl + 1, ate: fim };
      i = fimOp; continue;
    }
    i++;
  }
  return out;
}
const HD = heredocs(cmd);
const PREF_M = /(?:^|\s)(?:-[a-zA-Z]*m|--message)(?:=|\s+)["']?\$\(\s*cat\s*$/;
const PREF_F = /(?:^|\s)(?:-[a-zA-Z]*F|--file)(?:=|\s+)-\s*$/;
const msgM = HD.filter((h) => PREF_M.test(h.prefixo)).map((h) => h.corpo);
const msgF = HD.filter((h) => PREF_F.test(h.prefixo)).map((h) => h.corpo);
// Texto sem os corpos de heredoc: é onde a rede de segurança do .env procura (citar "git add .env" num heredoc de
// outro comando não é um git add de verdade).
let semHeredoc = '';
{ let p = 0; for (const h of HD) { semHeredoc += cmd.slice(p, h.de); p = h.ate; } semHeredoc += cmd.slice(p); }

// Rede de segurança só para o .env: o regex antigo, em qualquer parte do texto (menos corpos de heredoc).
const ANTIGO_COMMIT = /\bgit\b[^|;&]*\bcommit\b/;
const ANTIGO_ADD_ENV = /\bgit\s+add\b[^|;&]*\.env(?!\.example)\b/;
if (cmds.some((c) => c.g?.sub === 'add' && c.g.args.some(ehEnv))) {
  if (commits.length || ANTIGO_COMMIT.test(semHeredoc)) bloquear(MSG_ENV);
}
if (!commits.length) {
  if (ANTIGO_COMMIT.test(semHeredoc) && ANTIGO_ADD_ENV.test(semHeredoc)) bloquear(MSG_ENV);
  process.exit(0);
}
if (ANTIGO_ADD_ENV.test(semHeredoc)) bloquear(MSG_ENV);

try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const env = staged.split('\n').filter((f) => f && ehEnv(f));
  if (env.length) bloquear(`arquivos de segredo no stage: ${env.join(', ')}. Use "git restore --staged".`);
} catch { /* fora de um repositório: não há o que checar */ }

// Assunto do commit: primeiro -m/--message do PRÓPRIO comando; sem -m, -F/--file (arquivo ou "-" = heredoc/stdin).
// Se o valor de -m veio de $(cat <<'EOF' … EOF), usa o heredoc ligado a esse -m (não qualquer heredoc do comando).
function assunto(args) {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (/^-[a-zA-Z]*m$/.test(a) || a === '--message') return { tem: true, texto: args[i + 1] ?? '' };
    if (a.startsWith('--message=')) return { tem: true, texto: a.slice('--message='.length) };
  }
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (/^-[a-zA-Z]*F$/.test(a) || a === '--file') return { tem: false, arquivo: args[i + 1] ?? '' };
    if (a.startsWith('--file=')) return { tem: false, arquivo: a.slice('--file='.length) };
  }
  return { tem: false, texto: '' };
}

// Conteúdo do arquivo de -F; null se não existe/ilegível ou se o próprio comando o escreve (conteúdo ainda não existe).
// S6: recusa .env e arquivo fora do repositório (o -F não pode virar leitor de arquivos); nunca ecoa o conteúdo.
function lerArquivoMsg(arq) {
  const base = entrada.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const norm = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '');
  // o próprio comando escreve o arquivo (redirecionamento ou tee): o conteúdo em disco ainda não vale
  if (cmds.some((c) => c.redirs.some((r) => norm(r) === norm(arq)) || c.words.some((w) => /^tee$/.test(w.replace(/^.*[\\/]/, ''))))) return null;
  if (ehEnv(arq)) bloquear('git commit -F não aceita arquivo .env (segredo).');
  let p = isAbsolute(arq) ? arq : join(base, arq);
  try {
    const repo = localizarRepo(base);
    const raiz = realpathSync(repo ? repo.pasta : base);
    const real = realpathSync(p); // quem não existe cai no catch: nada a validar
    if (ehEnv(real)) bloquear('git commit -F não aceita arquivo .env (segredo).');
    const rel = relative(raiz, real);
    if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) bloquear('git commit -F só aceita arquivo dentro do repositório.');
    p = real;
  } catch { return null; } // (bloquear() encerra o processo; aqui só caem arquivo inexistente/ilegível)
  try { return readFileSync(p, 'utf8').slice(0, 10_000); } catch { return null; }
}

function validar(texto, { eco = true } = {}) {
  const primeira = texto.trim().split(/\r?\n/)[0];
  if (!FORMATO.test(primeira)) {
    if (!eco) bloquear('1ª linha da mensagem do arquivo (-F) fora do padrão. Use "<tipo>(<escopo>): <resumo>".');
    bloquear(`mensagem "${primeira}" fora do padrão. Use "<tipo>(<escopo>): <resumo>", com tipo em ${TIPOS.replaceAll('|', ', ')}. Ex.: feat(LUME-68): tokens de cor v2`);
  }
}

for (const c of commits) {
  const { tem, texto, arquivo } = assunto(c.g.args);
  if (tem) {
    if (texto.trim()) { validar(texto); continue; }
    const h = msgM.shift(); // heredoc ligado ao -m "$(cat <<EOF" deste commit
    if (h !== undefined && h.trim()) validar(h);
    continue;
  }
  if (arquivo === '-') { // -F - <<'EOF'
    const h = msgF.shift();
    if (h !== undefined && h.trim()) validar(h);
  } else if (arquivo) {
    const conteudo = lerArquivoMsg(arquivo);
    if (conteudo !== null && conteudo.trim()) validar(conteudo, { eco: false });
  }
  // --amend sem mensagem, stdin por pipe etc.: não dá para validar aqui
}
process.exit(0);
