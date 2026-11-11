---
name: sprint-review
description: Review e retrospectiva do sprint - compara entregue x planejado e estimado x gasto, mede qualidade, gera de 1 a 3 ações de melhoria como issues e fecha o sprint no Jira.
disable-model-invocation: true
---
# Sprint review + retro

Jira via MCP Atlassian (`cloudId` por `getAccessibleAtlassianResources`).

## Review
1. Em paralelo:
   - `ops-gestor-demandas`: entregue × planejado do sprint (`searchJiraIssuesUsingJql` com `sprint in openSprints()` ou o id do sprint), horas estimadas × gastas se houver, carry-over e `docs/progresso.md`;
   - `qual-melhoria-continua`: voltas de QA/review, bugs por severidade, retrabalho e custo em tokens por tarefa (a partir dos `LUME-*.log.md` e do hook de métricas), tarefas acima do orçamento e possíveis loops.
2. Mostre ao usuário: meta atingida? o que foi entregue (e o que já dá resultado no app), o que não foi e por quê.

## Retro
3. `qual-melhoria-continua` recebe os números, o Log das tarefas do sprint e `docs/dev/licoes.md`, e propõe **de 1 a 3 ações** (problema → causa → ação → como medir). `qual-revisor-critico` contesta se alguma ação parecer cosmética.
4. Com o "ok" do usuário: crie cada ação no **backlog** do Jira (`createJiraIssue`, tipo tarefa, label `melhoria`) e aplique as lições aprovadas em `docs/dev/licoes.md` e no `.md` dos agentes afetados (via `/novo-agente` ou edição direta).

## Fechar
5. Feche o sprint (via `discover` → operação de completar sprint, com `executeWrite`; se não houver, peça ao usuário para fechar no board). O que não terminou volta ao backlog com comentário `[próximo]`. Sugira `/sprint-planning`.
