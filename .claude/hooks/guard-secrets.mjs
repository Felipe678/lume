// PreToolUse (Write|Edit|MultiEdit): bloqueia escrita em arquivos .env e conteúdo com cara de segredo.
// Dono: seg-lider. Saída 2 = bloqueia e devolve o motivo ao Claude.
import { basename } from 'node:path';

// Valores de exemplo (troque-isto, <segredo>, ${VAR}...) não contam como segredo.
const NAO_PLACEHOLDER = '(?!troque|change|seu|sua|your|xxx|exemplo|example|placeholder|<|\\$|\\{|\\.\\.\\.|\\*)';

const PADROES = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'chave da API Anthropic'],
  [/ATATT[A-Za-z0-9_=-]{20,}/, 'token de API Atlassian'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'chave de acesso AWS'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, 'token do GitHub'],
  [/-----BEGIN (RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/, 'chave privada'],
  [new RegExp(`JWT_SECRET["']?\\s*[=:]\\s*["']?${NAO_PLACEHOLDER}[^\\s"']{8,}`), 'valor de JWT_SECRET'],
  [/mongodb(\+srv)?:\/\/[^\s:@/"'<>]+:(?![<$*{])[^\s@/"'<>]+@/i, 'URI do MongoDB com usuário e senha'],
];

let input = '';
for await (const chunk of process.stdin) input += chunk;
let ti = {};
try {
  ti = JSON.parse(input || '{}')?.tool_input || {};
} catch {
  console.error('guard-secrets: entrada inválida (JSON) ignorada; ferramenta liberada.'); // nunca trava por erro do próprio hook
  process.exit(0);
}

const arquivo = basename(String(ti.file_path || '').replace(/\\/g, '/'));
if (/^\.env(\..+)?$/.test(arquivo) && arquivo !== '.env.example') {
  console.error(`Bloqueado: ${arquivo} guarda segredos e não é editado por agentes. Peça ao Felipe para preencher e documente a variável no .env.example.`);
  process.exit(2);
}

const conteudo = [ti.content, ti.new_string, ...(ti.edits || []).map((e) => e.new_string)]
  .filter(Boolean).join('\n');
for (const [re, nome] of PADROES) {
  if (re.test(conteudo)) {
    console.error(`Bloqueado: o conteúdo parece conter ${nome}. Use uma variável de ambiente e referencie só o nome.`);
    process.exit(2);
  }
}
