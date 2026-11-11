// Utilitários compartilhados pelos hooks do Lume: leitura segura do stdin, localização do repositório sem
// chamar o git e separação de comandos Bash sem cair em heredoc, aspas ou comentários.
// Sem dependências externas.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

// stdin como objeto; vazio, ausente ou JSON ruim viram {}.
export async function lerEntrada(limiteMs = 1000) {
  let timer;
  try {
    const texto = await Promise.race([
      (async () => { let s = ''; for await (const c of process.stdin) s += c; return s; })(),
      new Promise((ok) => { timer = setTimeout(() => { try { process.stdin.destroy(); } catch { /* já fechado */ } ok(''); }, limiteMs); }),
    ]);
    clearTimeout(timer);
    const j = JSON.parse(texto || '{}');
    return j && typeof j === 'object' ? j : {};
  } catch { clearTimeout(timer); return {}; }
}

// Sobe a partir de `inicio` até achar `.git` (pasta ou arquivo de worktree). Devolve { pasta, gitDir, comum } ou null.
export function localizarRepo(inicio) {
  let d = resolve(inicio);
  for (let i = 0; i < 40; i++) {
    const g = join(d, '.git');
    if (existsSync(g)) {
      try {
        if (statSync(g).isDirectory()) return { pasta: d, gitDir: g, comum: g };
        const m = readFileSync(g, 'utf8').match(/^gitdir:\s*(.+?)\s*$/m);
        if (m) {
          const gitDir = isAbsolute(m[1]) ? m[1] : resolve(d, m[1]);
          let comum = resolve(gitDir, '..', '..');
          try { comum = resolve(gitDir, readFileSync(join(gitDir, 'commondir'), 'utf8').trim()); } catch { /* usa o padrão */ }
          return { pasta: d, gitDir, comum };
        }
      } catch { /* tenta o pai */ }
    }
    const pai = dirname(d);
    if (pai === d) break;
    d = pai;
  }
  return null;
}

// ---------- separação de comandos Bash ----------

// Pula uma substituição $( ... ) a partir do índice do "(" (i aponta para "$"), respeitando aspas e heredocs.
// Devolve o índice logo após o ")" correspondente (ou o fim do texto).
function pularSubstituicao(s, i) {
  let prof = 0;
  let j = i + 1; // aponta para "("
  const n = s.length;
  const pend = [];
  while (j < n) {
    const c = s[j];
    if (c === "'") { const f = s.indexOf("'", j + 1); j = f < 0 ? n : f + 1; continue; }
    if (c === '"') {
      j++;
      while (j < n && s[j] !== '"') { if (s[j] === '\\') j++; else if (s[j] === '$' && s[j + 1] === '(') { j = pularSubstituicao(s, j); continue; } j++; }
      j++; continue;
    }
    if (c === '\\') { j += 2; continue; }
    if (c === '<' && s[j + 1] === '<' && s[j + 2] !== '<') {
      const m = s.slice(j + 2).match(/^-?\s*(?:'([^']*)'|"([^"]*)"|([^\s;|&<>()]+))/);
      if (m) { pend.push(m[1] ?? m[2] ?? m[3]); j += 2 + m[0].length; continue; }
    }
    if (c === '\n' && pend.length) {
      j++;
      for (const d of pend) {
        while (j < n) {
          let f = s.indexOf('\n', j); if (f < 0) f = n;
          const linha = s.slice(j, f).trim(); j = f + 1;
          if (linha === d) break;
        }
      }
      pend.length = 0; continue;
    }
    if (c === '(') prof++;
    else if (c === ')') { prof--; if (prof === 0) return j + 1; }
    j++;
  }
  return n;
}

// Quebra o comando em comandos simples: [{ words: [...], redirs: [alvos de saída] }].
// Aspas são removidas das palavras; corpo de heredoc, comentários e conteúdo de $( ) dentro de aspas são ignorados.
// `ps`: o texto é script de PowerShell (powershell -Command); lá a barra invertida é só separador de caminho.
export function comandos(cmd, profundidade = 0, ps = false) {
  const s = String(cmd || '');
  const n = s.length;
  const out = [];
  const extras = []; // texto de $( ) e crases fora de aspas simples: analisado à parte
  let atual = { words: [], redirs: [] };
  let w = null;
  let redir = false; // false | 'out' | 'ign'
  const pend = [];
  const fimPalavra = () => {
    if (w === null) return;
    if (redir === 'out') atual.redirs.push(w); else if (redir !== 'ign') atual.words.push(w);
    redir = false; w = null;
  };
  const fimCmd = () => {
    fimPalavra(); redir = false;
    if (atual.words.length || atual.redirs.length) out.push(atual);
    atual = { words: [], redirs: [] };
  };
  let i = 0;
  while (i < n) {
    const c = s[i];
    if (c === "'") { const f = s.indexOf("'", i + 1); const fim = f < 0 ? n : f; w = (w ?? '') + s.slice(i + 1, fim); i = fim + 1; continue; }
    if (c === '"') {
      let j = i + 1; let t = '';
      while (j < n && s[j] !== '"') {
        if (!ps && s[j] === '\\' && j + 1 < n) {
          // Em bash, dentro de aspas duplas a barra só escapa $ ` " \ e newline; nos demais casos ela é mantida
          // (caminhos Windows como C:\Users\x precisam chegar inteiros ao script interno do powershell -Command).
          const p = s[j + 1];
          if (p === '\n') { j += 2; continue; } // continuação de linha: some
          if (p === '\r' && s[j + 2] === '\n') { j += 3; continue; }
          if (p === '$' || p === '`' || p === '"' || p === '\\') { t += p; j += 2; continue; }
          t += '\\'; j++; continue; // mantém a barra; o próximo caractere é tratado normalmente
        }
        if (s[j] === '$' && s[j + 1] === '(') { const fim = pularSubstituicao(s, j); extras.push(s.slice(j + 2, Math.max(j + 2, fim - 1))); j = fim; continue; }
        if (s[j] === '`') { const f2 = s.indexOf('`', j + 1); extras.push(s.slice(j + 1, f2 < 0 ? n : f2)); j = f2 < 0 ? n : f2 + 1; continue; }
        t += s[j]; j++;
      }
      w = (w ?? '') + t; i = j + 1; continue;
    }
    if (c === '`') { const f = s.indexOf('`', i + 1); extras.push(s.slice(i + 1, f < 0 ? n : f)); i = f < 0 ? n : f + 1; w = w ?? ''; continue; }
    if (c === '\\' && !ps) {
      if (s[i + 1] === '\n') { i += 2; continue; }
      if (s[i + 1] === '\r' && s[i + 2] === '\n') { i += 3; continue; }
      w = (w ?? '') + (s[i + 1] ?? ''); i += 2; continue;
    }
    if (c === '#' && w === null) { const f = s.indexOf('\n', i); i = f < 0 ? n : f; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { fimPalavra(); i++; continue; }
    if (c === '\n') {
      fimCmd(); i++;
      for (const d of pend) {
        while (i < n) {
          let f = s.indexOf('\n', i); if (f < 0) f = n;
          const linha = s.slice(i, f).trim(); i = f + 1;
          if (linha === d) break;
        }
      }
      pend.length = 0; continue;
    }
    if (c === ';' || c === '|' || c === '(' || c === ')') { fimCmd(); i++; continue; }
    if (c === '&') {
      if (s[i + 1] === '>') { fimPalavra(); redir = 'out'; i += s[i + 2] === '>' ? 3 : 2; continue; } // &> e &>>
      fimCmd(); i++; continue;
    }
    if (c === '<') {
      if (s[i + 1] === '<' && s[i + 2] === '<') { fimPalavra(); redir = 'ign'; i += 3; continue; } // here-string
      if (s[i + 1] === '<') {
        fimPalavra();
        const m = s.slice(i + 2).match(/^-?[ \t]*(?:'([^']*)'|"([^"]*)"|([^\s;|&<>()]+))/);
        if (m) { pend.push(m[1] ?? m[2] ?? m[3]); i += 2 + m[0].length; } else i += 2;
        continue;
      }
      fimPalavra(); redir = 'ign'; i++; continue;
    }
    if (c === '>') {
      if (w !== null && /^\d+$/.test(w)) w = null; // 2> : o número é o descritor
      else fimPalavra();
      i++;
      if (s[i] === '&') { redir = 'ign'; i++; continue; } // >&2, 2>&1
      if (s[i] === '>' || s[i] === '|') i++;
      redir = 'out'; continue;
    }
    w = (w ?? '') + c; i++;
  }
  fimCmd();
  if (profundidade < 4) {
    for (const e of extras) if (e.trim()) out.push(...comandos(e, profundidade + 1, ps));
    for (const c of [...out]) {
      const w = semAtribuicoes(c.words);
      if (!w.length) continue;
      const base = w[0].replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase();
      let script = null; let scriptPs = ps;
      if (/^(bash|sh|zsh|dash|ksh)$/.test(base)) {
        const i = w.findIndex((a, k) => k > 0 && /^-[a-zA-Z]*c$/.test(a));
        if (i > 0 && w[i + 1] !== undefined) script = w[i + 1];
      } else if (/^(pwsh|powershell)$/.test(base)) {
        const i = w.findIndex((a, k) => k > 0 && /^-(c|command)$/i.test(a));
        if (i > 0) { script = w.slice(i + 1).join(' '); scriptPs = true; }
      } else if (base === 'eval') {
        script = w.slice(1).join(' ');
      }
      if (script && script.trim()) out.push(...comandos(script, profundidade + 1, scriptPs));
    }
  }
  return out;
}

// Tira atribuições de ambiente do início (FOO=bar cmd) e devolve as palavras do comando de fato.
const CONTROLE = new Set(['then', 'do', 'else', 'elif', 'if', 'while', 'until', '!', '{', '}']);
const ENVOLTORIOS = new Set(['env', 'sudo', 'doas', 'command', 'nohup', 'xargs', 'time', 'exec', 'builtin', 'nice', 'timeout', 'stdbuf']);
// Opções dos envoltórios que consomem o valor seguinte.
const COM_VALOR = {
  sudo: new Set(['-u', '-g', '-h', '-p', '-C', '-D', '-R', '-T', '-U', '-r', '-t']),
  xargs: new Set(['-n', '-I', '-P', '-d', '-L', '-E', '-s', '-a', '-l']),
  env: new Set(['-u', '-C', '-S']),
  timeout: new Set(['-k', '-s']),
  nice: new Set(['-n']),
  stdbuf: new Set(['-i', '-o', '-e']),
};

// Tira do início atribuições de ambiente (FOO=bar cmd), palavras de controle (if/then/do/{) e envoltórios
// (env, sudo, command, nohup, xargs, time…) e devolve as palavras do comando de fato.
export function semAtribuicoes(words) {
  let k = 0;
  for (let volta = 0; volta < 20; volta++) {
    while (k < words.length && /^[A-Za-z_]\w*=/.test(words[k])) k++;
    if (k >= words.length) break;
    if (CONTROLE.has(words[k])) { k++; continue; }
    const base = words[k].replace(/^.*[\\/]/, '').replace(/\.exe$/i, '').toLowerCase();
    if (!ENVOLTORIOS.has(base)) break;
    k++;
    while (k < words.length && (words[k].startsWith('-') || /^[A-Za-z_]\w*=/.test(words[k]))) {
      const opt = words[k]; k++;
      if (COM_VALOR[base]?.has(opt)) k++;
    }
    if (base === 'timeout') k++; // duração
  }
  return words.slice(k);
}

const OPCOES_GIT_COM_VALOR = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);

// Para "git [opções] sub args": { sub, args } ou null se não for git.
export function git(words) {
  const w = semAtribuicoes(words);
  if (!w.length || !/^git(\.exe)?$/i.test(w[0].replace(/^.*[\\/]/, ''))) return null;
  let k = 1;
  while (k < w.length && w[k].startsWith('-')) k += OPCOES_GIT_COM_VALOR.has(w[k]) ? 2 : 1;
  if (k >= w.length) return null;
  return { sub: w[k], args: w.slice(k + 1) };
}

// Remove caracteres de controle e quebras de linha, comprime espaços e limita o tamanho.
export function limpar(v, max = 120) {
  return String(v ?? '').replace(/[\x00-\x1f\x7f-\x9f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
