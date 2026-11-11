# Fim de tarefa por Pull Request

Vale para toda tarefa de código. O fechamento é feito pelo comando (`/proxima-tarefa`), nunca por um agente (protocolo §3). Branch de trabalho atual: `new-plan/mudanca_de_escopo`; PRs vão para `main`.

## Pré-requisitos (todos verdes antes do commit)
- Definição de pronto do plano cumprida e QA aprovado; review do `dev-techlead` aprovado.
- `seguranca: sim` → revisão `seg-*` aprovada. UI → `ds-fidelidade` aprovada.
- Testes só pelo resumo: `node scripts/dev/ci.mjs --resumo <app|legado|servidor|n8n|tudo>` (conforme o que a tarefa tocou).

## Passos
1. **Commit** com a mensagem em arquivo (`git commit -F <arquivo>`): `tipo(LUME-<n>): resumo`, tipos `feat|fix|docs|chore|test|refactor|ci`. Terminar com a linha de coautoria definida pela sessão. Nunca `--no-verify`.
2. **Push:** `git push -u origin <branch>`. Nunca `--force`.
3. **Abrir o PR** (idempotente): `gh pr list --head <branch> --state open --json number,url`; se existir PR aberto, reutilize. Senão:
   ```bash
   gh pr create --base main --title "$(cat <arquivo-titulo>)" --body-file <arquivo-corpo>
   ```
   - Título numa linha, no padrão `tipo(LUME-<n>): resumo` (≤ 100 caracteres), gravado em arquivo e lido por `$(cat …)`, nunca digitado entre aspas no comando.
   - Corpo: resumo, como testar, checklist da definição de pronto, riscos, link da issue. Termina com a linha de atribuição da sessão.
   - Tarefa encadeada a outra ainda não mesclada: `--draft`.
4. **Mesclar:** o merge na `main` é decisão do usuário. O comando relata "PR aberto" com a URL e para. Sem `--admin`, sem `--squash` automático.
5. **Ajustes:** `/revisao-pr` lê comentários e checks, corrige e dá push na mesma branch.
6. **Conflito com `main`:** `git fetch origin main` e `git merge origin/main` na própria branch. Nunca rebase nem `--force` com PR aberto.
7. **Registro:** `ops-gestor-demandas` comenta `[feito]` no Jira (MCP), move a issue, acrescenta a linha em `docs/progresso.md` e, se mudou decisão, o usuário atualiza `DECISOES_E_ROADMAP.md`.
8. **Evento n8n:** o despachante envia o evento da etapa `concluida` (`docs/org/n8n.md`).
9. **`gh` sem login ou GitHub fora:** pare no push, registre "PR pendente" no log e em `docs/pendencias.md`. Não faça merge local na `main`.
