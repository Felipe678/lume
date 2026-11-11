# scripts/dev

Utilitários de desenvolvimento do Lume. Node 18 ou superior, **sem dependências**. Nenhum lê `.env` nem usa segredos. Nome do Node no Windows: `C:\Program Files\nodejs\node.exe` (use o caminho completo se `node` não estiver no PATH).

## ci.mjs
Roda as verificações por etapa, igual para o despachante, os agentes e (futuramente) o GitHub Actions.

```bash
node scripts/dev/ci.mjs [--resumo] [app] [legado] [servidor] [n8n] [tudo]
```

| Etapa | O que roda |
|---|---|
| `app` | `flutter analyze` e `flutter test` em `app/` |
| `legado` | `npm run lint` e `npm test` na raiz (app React, só referência) |
| `servidor` | `npm --prefix server test` (Express, só referência) |
| `n8n` | `node automations/validar-workflows.mjs`; pulada com aviso se o validador ainda não existir |
| `tudo` | todas (também é o padrão sem etapa) |

- `--resumo`: uma linha por comando e só as falhas, até 40 linhas. **Agentes usam sempre `--resumo`.**
- Procura `flutter`, `npm` e `node` no PATH e em caminhos padrão do Windows. Código de saída 0 = tudo ok, 1 = falha, 2 = uso incorreto. Falha sempre vem com mensagem `ERRO: ...`.
- `legado` e `servidor` exigem `npm install` feito antes (o script avisa se faltar `node_modules`).

## metricas.mjs
Resumo de custo dos agentes a partir de `docs/metricas/execucoes.csv`.

```bash
node scripts/dev/metricas.mjs [--tarefa LUME-68] [--desde dd/MM/yyyy]
```
- Ponderado = entrada + saída × 5 + escrita de cache × 1,25 + leitura de cache × 0,1. Orçamento padrão por tarefa: 2.000.000.
- CSV com cabeçalho `data;tarefa;agente;entrada;saida;escrita_cache;leitura_cache;ferramentas;duracao_ms` (aceita `;` ou `,`). Quem grava o arquivo é o hook de métricas; fora de tarefa, o rótulo é `sessao`.
- Arquivo ausente ou vazio: avisa e sai com 0.

## validar-agentes.mjs
```bash
node scripts/dev/validar-agentes.mjs
```
Confere os 25 agentes de `.claude/agents/`: frontmatter (`name` igual ao arquivo, `description`, `model`, `maxTurns` entre 5 e 50, `tools`), referência ao `docs/org/protocolo.md`, ausência dos agentes que não existem (`ceo`, `cfo`, `coo`, `posvenda-onboarding`, `qual-lider`), hierarquia e modelos do `docs/org/organograma.md` (divergência de modelo ou maxTurns é aviso), skills com `SKILL.md` e citações a agentes inexistentes em `docs/org/`, skills e agentes. Termos de stack vêm de `docs/projeto/perfil.md` (seção 6). Sai com 1 se houver `ERRO`.
