---
name: pausar
description: Pausa a tarefa em andamento salvando onde parou, o próximo passo exato e os arquivos em edição, no arquivo da tarefa, na passagem de contexto e no Jira, para retomar depois com /retomar (mesmo após /clear ou em outra sessão).
disable-model-invocation: true
---
# Pausar a tarefa em andamento

Observação do usuário: $ARGUMENTS

1. Leia `docs/tarefas/_atual`. Vazio: diga que não há tarefa em andamento e pare.
2. Acrescente ao fim de `docs/tarefas/LUME-<n>.log.md`, sob um título próprio `### Pausa · dd/MM/yyyy HH:mm` (na seção **Pausa**; se a seção faltar, crie-a):
   - data/hora (fuso America/Sao_Paulo) e **Etapa atual**;
   - o que foi feito nesta sessão (passos do plano concluídos);
   - **próximo passo exato** (agente + o que ele deve fazer) e os IDs dos agentes que ainda podem ser retomados;
   - arquivos alterados e ainda não commitados (`git status --short`);
   - decisões tomadas na conversa que não estão no arquivo, e a observação do usuário.
3. Grave a passagem de contexto `docs/tarefas/_retomada.md` (sobrescreva). Conteúdo completo: tarefa e etapa, estado, decisões, o que falta, arquivos, critérios de pronto e achados abertos. É a mesma passagem exigida quando o orçamento estoura.
4. Atualize a linha **Etapa atual** para `pausada` em `docs/tarefas/LUME-<n>.md` (o hook avisa o orquestrador n8n sozinho, com o evento `pausada`).
5. No Jira (via MCP Atlassian; não existe status "Pausada": pausada = Em andamento + label `impedimento`): `editJiraIssue` para acrescentar a label `impedimento` e `addOrEditJiraIssueComment` com `[bloqueio] pausada: <próximo passo>`. Não use `transitionJiraIssue`. Jira fora do ar: registre `[pendente-sync]` em `docs/progresso.md`.
6. Se houver mudanças não commitadas, pergunte se o usuário quer um commit `wip(LUME-<n>): <resumo>` (com a linha `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`). Não faça sem a resposta.
7. Responda em até 5 linhas: onde parou, qual passagem foi gravada e como retomar (`/retomar`).
