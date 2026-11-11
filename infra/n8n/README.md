# n8n local do Lume

Orquestrador local (decisão D13): dois workflows mestres (orquestrador de desenvolvimento e de produto) e o painel de estado, versionados em `automations/`. **Só para laboratório local**, não é stack de produção.

## Pré-requisitos
- Docker Desktop ligado (Compose v2+).
- Node 20+ (a CLI `lume-n8n.mjs` não tem dependências).
- `infra/n8n/.env` (copie de `.env.example` e preencha os segredos; nunca versione).

## Versões fixadas
- n8n: `n8nio/n8n:2.47.3` (tag estável mais recente da linha 2.x em 2026-11-11; `2.48.0` ainda é a linha `next`).
- Postgres: `postgres:17.11-alpine` (sem porta publicada).
- Política de atualização: nunca `latest`/`next`. Para atualizar, escolha a tag que o Docker Hub marca como `stable`/`latest`, faça backup (abaixo), troque a tag em `docker-compose.yml`, atualize esta seção, rode `up` e `importar`, e confira o painel.

## Comandos
```
node infra/n8n/lume-n8n.mjs up                 # valida o .env, sobe e espera os healthchecks
node infra/n8n/lume-n8n.mjs status             # docker compose ps + /healthz
node infra/n8n/lume-n8n.mjs logs [-f]          # logs do n8n
node infra/n8n/lume-n8n.mjs importar           # importa automations/workflows/*.json e ativa os "active": true
node infra/n8n/lume-n8n.mjs credencial-token   # como configurar o token do webhook (sem imprimir o valor)
node infra/n8n/lume-n8n.mjs down               # para (os volumes são mantidos)
```

## URLs
- Editor: http://localhost:5678
- Webhook de eventos dos hooks: `http://localhost:5678/webhook/lume-dev-evento` (header `x-lume-token`)
- Painel de estado: `http://localhost:5678/webhook/lume-painel`
- Saúde: `http://localhost:5678/healthz`

A porta muda com `LUME_N8N_PORT` no `.env` (o `WEBHOOK_URL` acompanha).

## Primeiro acesso
O n8n 2.x não cria o usuário dono por variável nem por CLI. Passo manual, uma vez: abra http://localhost:5678, preencha e-mail, nome e senha do dono. Depois rode `importar`. (Opcional: Settings > n8n API > criar chave, se for usar a API pública em `/api/v1`, que está ligada.)

## Token do webhook
`LUME_N8N_TOKEN` é gerado no `.env` e repassado ao contêiner. O comando `importar` cria a credencial Header Auth `lume-token` a partir dele (sem exibir o valor) e os webhooks a usam. Rode `credencial-token` para ver o passo a passo. Os hooks do Claude Code leem o token de `infra/n8n/.env` e o enviam no header `X-Lume-Token`.

## Histórico de execuções como trilha do desenvolvimento
As execuções são guardadas por 30 dias (`EXECUTIONS_DATA_MAX_AGE=720`). Em **Executions** (menu lateral do editor) cada evento recebido do hook aparece como uma execução, com entrada, saída de cada nó e erros. Filtre por workflow para seguir o desenvolvimento em ordem cronológica. Os headers do webhook (inclusive o token) ficam nas execuções salvas: não compartilhe prints.

## Backup e restauração
Dados em dois volumes: `lume_n8n_pgdata` (workflows, execuções, credenciais criptografadas) e `lume_n8n_data`. A `LUME_N8N_ENCRYPTION_KEY` é obrigatória para ler as credenciais: guarde-a junto do backup, fora do repositório.
```
# backup do banco
docker compose -p lume-n8n -f infra/n8n/docker-compose.yml exec -T db pg_dump -U n8n -d n8n > lume-n8n-backup.sql
# restauração (ambiente limpo, mesmo .env)
node infra/n8n/lume-n8n.mjs up
docker compose -p lume-n8n -f infra/n8n/docker-compose.yml exec -T db psql -U n8n -d n8n < lume-n8n-backup.sql
```
Para zerar tudo (apaga dados): `docker compose -p lume-n8n -f infra/n8n/docker-compose.yml down -v`.

## Segurança do laboratório
- `N8N_SECURE_COOKIE=false`: necessário porque o acesso é `http://localhost` sem HTTPS. Não use assim em produção.
- Porta só em `127.0.0.1`; banco sem porta publicada; telemetria e avisos de versão desligados.
- `automations/` é montada somente leitura em `/data/automations`; `N8N_RESTRICT_FILE_ACCESS_TO` limita os nós de arquivo.

## Rede com inspeção SSL
Se o pull ou chamadas HTTPS falharem por certificado (antivírus/proxy), exporte a raiz do antivírus em PEM para `infra/n8n/certs/extra-ca.pem` (não é versionado). Sem o arquivo, o n8n só registra um aviso no log, que é inofensivo.

## Solução de problemas
- `.env` ausente ou variável vazia: a CLI avisa qual.
- `importar` falha: confira se o dono já foi criado e se o JSON é válido. Depois de importar/ativar, reinicie o n8n para registrar os webhooks.
- Porta ocupada: mude `LUME_N8N_PORT`.

