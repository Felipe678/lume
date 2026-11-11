---
name: retomar
description: Retoma a tarefa em andamento (ou a informada) do ponto exato em que parou, lendo a passagem de contexto, o arquivo da tarefa e o Jira, e continua o ciclo do /proxima-tarefa a partir da etapa registrada.
disable-model-invocation: true
---
# Retomar tarefa

Tarefa: $ARGUMENTS (se vazio, a de `docs/tarefas/_atual`). Valide: só `^LUME-\d+$`.

1. Passagem de contexto: `docs/tarefas/_retomada.md`. Depois leia `docs/tarefas/LUME-<n>.md` (Etapa atual, plano de despacho), o último bloco `### Pausa · …` e o último relatório `###` do `LUME-<n>.log.md`, e a issue no Jira (`getJiraIssue` e `listJiraIssueComments`, via MCP Atlassian; `cloudId` por `getAccessibleAtlassianResources`) para ver comentários recentes e a label `impedimento`.
2. Confira o estado real: `git status --short`, `git branch --show-current` e `git log --oneline -5`. Divergência entre o arquivo e o repositório (ex.: passo marcado pendente, mas arquivos já existem): mostre e pergunte.
3. Resuma ao usuário em até 6 linhas: tarefa, etapa, o que falta e o próximo passo. Espere o "ok" (em `/KeepWORKING`, siga sem esperar).
4. Grave o código em `docs/tarefas/_atual`, comente no Jira `[próximo] retomada` e remova a label `impedimento` (`editJiraIssue`). Só use `transitionJiraIssue` para "Em andamento" se o status atual for outro. Atualize a Etapa atual do arquivo da tarefa (o evento de retomada segue sozinho para o n8n). Continue o fluxo do `/proxima-tarefa` **a partir da etapa registrada**: não refaça etapas concluídas, o plano aprovado continua aprovado. Reutilize o workflow `executar-plano` se a etapa for `implementação`, pulando passos já concluídos.
5. Não apague a passagem `_retomada.md` aqui. Ela sai no passo 9 do `/proxima-tarefa`, quando a tarefa termina.
