---
name: sprint-planning
description: Planning do sprint - propõe a meta e as histórias do próximo sprint a partir do backlog priorizado e da capacidade, valida prioridades com o produto, e após aprovação cria e inicia o sprint no Jira. Uso - /sprint-planning [capacidade em horas]
disable-model-invocation: true
---
# Sprint planning

Capacidade informada: $ARGUMENTS (se vazio, a de `docs/projeto/perfil.md`). Regras em `docs/org/scrum.md`. Jira via MCP Atlassian (`cloudId` por `getAccessibleAtlassianResources`).

1. Se houver sprint ativo vencido, sugira `/sprint-review` antes (`sprint in openSprints()` com `sprint` expirada).
2. `ops-gestor-demandas` monta a proposta lendo o backlog (`searchJiraIssuesUsingJql`: `project = LUME AND sprint is EMPTY AND statusCategory != Done ORDER BY Rank ASC`) e o roadmap de `DECISOES_E_ROADMAP.md`: impedimentos e bugs de segurança/críticos → histórias da entrega prevista (hoje E0.1 · LUME-67, antes da E1) respeitando dependências → melhorias → resto, até a capacidade. Histórias sem estimativa ficam de fora (liste-as).
3. `produto` valida a ordem (valor, dependências, DS v2 antes das telas da E1) e propõe a **meta do sprint** em uma frase. Se houver trade-off técnico relevante, `dev-techlead` opina em paralelo.
4. Mostre ao usuário: datas, meta, histórias (chave, título, horas), total × capacidade, o que ficou de fora. **Espere aprovação** e aplique os ajustes pedidos.
5. Aprovado: crie e inicie o sprint e mova as histórias para ele. O MCP Atlassian pode não ter operação de sprint como ferramenta primária: use `discover` ("create sprint", "add issues to sprint", "start sprint") e rode a operação com `executeWrite`. Se não existir, entregue ao usuário a lista exata de chaves para arrastar no board e registre em `docs/progresso.md`.
6. Responda com o link do board e a primeira tarefa sugerida (`/proxima-tarefa`).
