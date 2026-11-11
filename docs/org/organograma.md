# Organograma

> Os agentes do Claude Code estão em `.claude/agents/`. A orquestração de desenvolvimento e produto pelo n8n está em `n8n.md`. O `scripts/dev/validar-agentes.mjs` lê a tabela abaixo (colunas Agente, Modelo, maxTurns e Reporta a) e confere com os arquivos.

## Como a hierarquia funciona
Um subagente **não chama** outro. A **sessão principal é o despachante**: os comandos (`/proxima-tarefa`, `/conselho`, `/seguranca`…) chamam os agentes. Os líderes devolvem **planos de despacho** (`protocolo.md` §5) e o comando grava e executa. A hierarquia define **responsabilidade, decisão e escalonamento**, não chamadas aninhadas.

```
                         Usuário (aprova planos, escopo, riscos e direções)
                                            │
        ┌───────────────┬───────────────────┼─────────────────────┬──────────────────────┐
       cto           produto            seg-lider      qual-melhoria-continua    qual-revisor-critico
        │               │            (veto de release)
   dev-techlead   ops-gestor-demandas   appsec · dados · privacidade/DPO
        │
  backend ×3 · frontend ×3 · devops ×2 · qa ×3 · edge-cases · designer · ia-produto · Explore
```

## Agentes (25)

| Setor | Agente | Modelo | maxTurns | Reporta a | Papel |
|---|---|---|---|---|---|
| Decisão | `cto` | opus | 12 | usuário | Arquitetura, tecnologia, dependências, licenças, ADRs |
| | `produto` | sonnet | 12 | usuário | Roadmap, escopo, regras de produto, priorização, critérios de aceite de negócio |
| Desenvolvimento | `dev-techlead` | sonnet | 15 | cto | Quebra a demanda, plano de despacho, code review, padrões |
| | `dev-edge-cases` | sonnet | 20 | dev-techlead | Cenários extremos no plano e na revisão |
| | `dev-backend-dominio` | sonnet | 30 | dev-techlead | Regras de negócio e domínio (Java/Quarkus hexagonal; porte do domínio React) |
| | `dev-backend-dados` | sonnet | 30 | dev-techlead | PostgreSQL, Flyway, auditoria, soft delete, locking, sync por módulo |
| | `dev-backend-integracoes` | sonnet | 30 | dev-techlead | APIs, webhooks, n8n (`automations/`), mensageria |
| | `dev-frontend-arquitetura` | sonnet | 30 | dev-techlead | Clean Architecture Flutter, estado, rotas, catálogo de módulos |
| | `dev-frontend-design` | sonnet | 30 | dev-techlead | Fidelidade ao DS v2 "brasa", movimento, responsividade, acessibilidade |
| | `dev-frontend-performance` | sonnet | 30 | dev-techlead | Integração com API, erro/carregamento, performance de render, goldens |
| | `dev-devops-cicd` | sonnet | 30 | dev-techlead | CI/CD, `scripts/dev/ci.mjs`, GitHub Actions, releases |
| | `dev-devops-infra` | sonnet | 30 | dev-techlead | Docker, `infra/n8n/`, PostgreSQL, ambientes, backups |
| | `dev-designer` | sonnet | 30 | dev-techlead | UX, fluxos, evolução do DS (com aprovação do usuário) |
| | `dev-ia-produto` | sonnet | 30 | dev-techlead | Funcionalidades de IA: prompts, guardrails, avaliação, custo |
| | `dev-qa-funcional` | sonnet | 20 | dev-techlead | Critérios de aceite, testes funcionais |
| | `dev-qa-automacao` | sonnet | 20 | dev-techlead | Automação, regressão, goldens, integração |
| | `dev-qa-extremos` | sonnet | 20 | dev-techlead | Testes de borda, carga, acessibilidade e usabilidade |
| Qualidade | `qual-revisor-critico` | opus | 15 | usuário | Gate final de entregas relevantes (fim de épico, release) |
| | `qual-melhoria-continua` | sonnet | 15 | usuário | Causa raiz, lições, ajustes nos agentes e no protocolo |
| Segurança e privacidade | `seg-lider` | opus | 12 | usuário | Política, riscos, **veto de release**, consolida auditorias |
| | `seg-appsec` | opus | 12 | seg-lider | Segurança de aplicações (app, API, automações, IA) |
| | `seg-dados` | sonnet | 12 | seg-lider | Criptografia, armazenamento, auditoria, backups |
| | `seg-privacidade-dpo` | sonnet | 12 | seg-lider | LGPD, consentimento, dados de saúde (art. 11), direitos do titular |
| Operação | `ops-gestor-demandas` | haiku | 15 | produto | Scrum master: **único** que escreve no Jira (MCP), daily, progresso |
| Exploração | `Explore` | haiku | 15 | dev-techlead | Busca somente leitura (substitui o built-in) |

Não existem `ceo`, `cfo`, `coo`, `posvenda-onboarding` nem `qual-lider`: o Lume tem um único dono (o usuário), e a decisão de negócio fica com ele, assessorada por `produto` e `cto`.

## Quem decide o quê
| Decisão | Quem propõe | Quem decide |
|---|---|---|
| Plano de uma tarefa | `dev-techlead` (+ `dev-edge-cases`) | usuário |
| Tecnologia nova, dependência, licença, desvio da arquitetura | `dev-techlead` → `cto` | `cto`; usuário se mudar decisão registrada |
| Escopo, roadmap, prioridade do backlog e do sprint | `produto` com `ops-gestor-demandas` | usuário |
| Mudança visual fora do DS v2 "brasa" | `dev-designer` | usuário (ADR) |
| Funcionalidade de IA | `dev-ia-produto` | usuário, após `seg-privacidade-dpo` |
| Release com risco de segurança alto/crítico | `seg-lider` | **`seg-lider` veta**; só o usuário aceita o risco, por escrito em `docs/decisoes/` |
| Aceite do fim de épico | `qual-revisor-critico` | usuário |

## Fluxos padrão
| Fluxo | Sequência |
|---|---|
| Tarefa de código | `dev-techlead` (plano) + `dev-edge-cases` → usuário aprova → implementadores (paralelo quando independentes) → 1 QA → [`seg-*` se `seguranca: sim`] → `dev-techlead` (code review) → commit e PR (`fim-de-tarefa.md`) → `ops-gestor-demandas` |
| Tarefa de UI | idem, com `dev-frontend-design` obrigatório e a skill `ds-fidelidade` antes do QA |
| Funcionalidade de IA | `dev-ia-produto` (desenho + guardrails) → `seg-privacidade-dpo` → implementação → `dev-qa-extremos` (injeção, dose, vazamento) |
| Fim de épico / release | + `qual-revisor-critico` + `seg-lider` |
| Decisão estratégica | `/conselho`: `cto`, `produto`, `seg-lider` em paralelo, consolidado pelo usuário |
| Auditoria de segurança | `/seguranca`: `seg-appsec`, `seg-dados`, `seg-privacidade-dpo` em paralelo → `seg-lider` consolida |
| Incidente | `/incidente`: `seg-appsec` (contenção) + `seg-privacidade-dpo` (notificação) → `seg-lider` |
| Erro repetido | `qual-melhoria-continua` → `docs/dev/licoes.md` + ajuste do `.md` do agente |
| Rotina Scrum | `/sprint-planning` · `/daily` · `/sprint-review` (`scrum.md`) |

## Custos
- **opus** só onde o erro é caro e raro: `cto`, `seg-lider`, `seg-appsec`, `qual-revisor-critico`. **haiku** para rotina estruturada (`ops-gestor-demandas`, `Explore`). O resto em **sonnet**.
- Cada tarefa chama só os agentes do plano de despacho, nunca o time inteiro.
- **`maxTurns`** (frontmatter; o validador exige 5 a 50): executores e designer 30 · QA 20 · `seg-*`, `cto` e `produto` 12 · `dev-techlead`, `qual-*`, `ops-gestor-demandas` e `Explore` 15 · `dev-edge-cases` 20 (como QA). Ao bater o limite, o despachante retoma o mesmo agente pelo ID.
- **Orçamento:** 2.000.000 tokens ponderados por tarefa (`node scripts/dev/metricas.mjs --tarefa <LUME-n>`), uma tarefa por sessão, testes só por `ci.mjs --resumo`.
- **Workflows** de `.claude/workflows/` por padrão em `/proxima-tarefa`, `/conselho` e `/seguranca`.

