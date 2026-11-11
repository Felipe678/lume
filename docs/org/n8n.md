# n8n: orquestração de desenvolvimento e produto (D13)

> Visão geral. O conteúdo técnico detalhado vive em [`automations/README.md`](../../automations/README.md) (workflows, validação, testes) e [`infra/n8n/README.md`](../../infra/n8n/README.md) (Docker Compose, variáveis, subir, atualizar, backup). Em caso de divergência, vale o README da pasta.

## Papel
O n8n **orquestra e observa**; quem decide e implementa são os agentes do Claude Code. Há uma única instância, do dono do Lume, rodando por `docker compose -f infra/n8n/docker-compose.yml ...`. Dois eixos:
1. **Desenvolvimento:** acompanha o andamento das tarefas `LUME-<n>` (etapa, agente, status), alimenta o painel e dispara lembretes.
2. **Produto:** automações do próprio Lume (rotinas, lembretes, resumos), sempre com os guardrails de `perfil.md` §5: dado de saúde só com consentimento, IA nunca recomenda dose, tom pró-humano.

## Contrato de eventos de desenvolvimento
O **despachante** (a sessão principal, não os agentes) envia a cada mudança de etapa:

```
POST {LUME_N8N_URL}/webhook/lume-dev-evento
X-Lume-Token: <LUME_N8N_TOKEN>
{"tarefa":"LUME-68","etapa":"implementação","agente":"dev-frontend-design","status":"concluido","resumo":"tokens v2 criados","sessao":"a","ts":"2026-11-11T14:30:00-03:00"}
```
- `etapa`: `plano | aprovado | implementação | qa | seguranca | review | commit | registro | concluida`.
- `status`: `iniciado | concluido | parcial | bloqueado | falhou`.
- `LUME_N8N_URL` e `LUME_N8N_TOKEN` vêm do ambiente (nunca no repositório, nunca no resumo). O resumo não leva dado de saúde nem pessoal.
- **O n8n nunca bloqueia a tarefa:** timeout curto, falha só vira linha em `docs/tarefas/<LUME-n>.log.md`.

## Como ler o painel
Abra `{LUME_N8N_URL}/webhook/lume-painel` no navegador. Ele mostra, por tarefa: etapa atual, último agente e status, tempo parado na etapa e impedimentos. Use para saber o que está travado sem abrir o Jira; o Jira continua sendo a fonte de verdade das issues, e `docs/progresso.md` o diário.

## Regras para workflows (resumo)
- Workflows versionados em `automations/` como JSON limpo, validados por `node automations/validar-workflows.mjs` (etapa `n8n` do `ci.mjs`).
- Nenhum segredo no JSON: credenciais por nome, valores no `.env` de `infra/n8n/` (que os agentes não leem; documente no `.env.example`).
- Webhook sempre com `X-Lume-Token`; payload mínimo; dado de saúde nunca trafega pelo n8n sem decisão registrada em `docs/decisoes/` e parecer do `seg-privacidade-dpo`.
- Quem cria e altera workflows: `dev-backend-integracoes` (lógica) e `dev-devops-infra` (instância); revisão `seg-appsec`.
