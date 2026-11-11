---
name: status
description: Mostra o status do roadmap e do sprint, a tarefa em andamento, PRs abertos, o painel do orquestrador n8n e a próxima tarefa recomendada.
disable-model-invocation: true
---
# Status do roadmap e do sprint

1. Delegue ao `ops-gestor-demandas` (Jira via MCP Atlassian; `cloudId` por `getAccessibleAtlassianResources`):
   - sprint ativo: `searchJiraIssuesUsingJql` com `project = LUME AND sprint in openSprints() ORDER BY Rank ASC`, agrupando por status (feito/total, horas se houver estimativa);
   - progresso por épico: filhos dos épicos LUME-1 (E0), LUME-67 (E0.1), LUME-2 (E1) e seguintes (`parent = LUME-67` etc.), concluídos/total;
   - impedimentos: `project = LUME AND labels = impedimento AND statusCategory != Done`;
   - a tarefa de `docs/tarefas/_atual` e a Etapa atual do arquivo dela. Sem Jira, use `docs/progresso.md`.
2. Modo e pendências: leia `docs/tarefas/_modo` (`normal` ou `autonomo`) e conte os `- [ ]` abertos de `docs/pendencias.md`.
3. PRs abertos: `gh pr list --state open --base main` e, para cada um, `gh pr checks <n>`. PR parado (check pendente ou sem revisão) vai na lista. Sem `gh` logado: diga e siga.
4. Painel do n8n (opcional, só leitura): `http://localhost:5678/webhook/lume-painel` (por exemplo `curl -s` com timeout curto). Fora do ar: diga em uma linha e siga; nada depende dele.
5. Compare com o roadmap de `DECISOES_E_ROADMAP.md` (E0 → E7; hoje E0.1 antes da E1).
6. Responda em até 20 linhas: progresso geral e por épico, sprint (feito/total), tarefa em andamento e etapa, modo, PRs parados, impedimentos, pendências e a próxima tarefa recomendada. Atraso relevante: sugira cortar escopo e ofereça `/conselho`.
