---
name: daily
description: Daily assíncrona - gera feito (últimas 24h), próximo e impedimentos a partir do Jira e do git, registra no Jira e aponta riscos ao prazo do sprint.
disable-model-invocation: true
---
# Daily

1. `ops-gestor-demandas` levanta (Jira via MCP Atlassian):
   - feito nas últimas 24 h: `project = LUME AND status changed to Done AFTER -1d` (ou o status equivalente), mais `git log --since="24 hours ago" --oneline` e `docs/tarefas/_atual`;
   - em andamento: `project = LUME AND sprint in openSprints() AND status = "Em andamento"`;
   - impedimentos: `project = LUME AND labels = impedimento AND statusCategory != Done`.
2. Monte em até 10 linhas:
   - **Feito:** histórias e subtarefas concluídas e commits;
   - **Próximo:** tarefa em andamento e próximo passo;
   - **Impedimentos:** issues com a label `impedimento` e pendências de `docs/pendencias.md`;
   - **Sprint:** o que resta × dias restantes. Se não cabe, diga o que corre risco.
3. Mostre ao usuário e registre como comentário na tarefa em andamento (ou, sem tarefa, na história mais recente do sprint) com `addOrEditJiraIssueComment`, prefixo `[daily]`.
4. Risco ao prazo do sprint ou ao roadmap: sugira cortar escopo ou `/conselho`.
