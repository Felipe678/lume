---
name: melhoria
description: Registra uma melhoria (processo, agente, código, ferramenta) como issue no backlog do Jira, com problema, proposta e critério de sucesso. Uso - /melhoria "<descrição>"
disable-model-invocation: true
---
# Registrar melhoria

Pedido: $ARGUMENTS

1. Reescreva em: **Título** (até 10 palavras) · **Problema** · **Proposta** · **Como saber que funcionou** · **Área responsável** (pelo organograma em `docs/org/organograma.md`).
2. Se o problema já aconteceu mais de uma vez, chame `qual-melhoria-continua` para a causa raiz antes de registrar.
3. Mostre ao usuário. Com o "ok", `ops-gestor-demandas` cria a issue com `createJiraIssue` (MCP Atlassian; projeto LUME, tipo tarefa, label `melhoria`) e responde com a chave criada. A melhoria fica no **backlog**; nunca a coloque direto no sprint ativo.
