# Perfil do projeto

> Única parte da organização de agentes que muda de um projeto para outro. Os agentes leem este arquivo antes de trabalhar (protocolo §1).

## 1. Configuração (lida pelos scripts)

```yaml
projeto: "Lume: ERP pessoal (gerenciador de uma vida)"
fuso: America/Sao_Paulo
idioma: pt-BR
roadmap_fonte: DECISOES_E_ROADMAP.md
jira_project_key: LUME
jira_site: felipeoliveiranogueira.atlassian.net
codigo_tarefa: "^LUME-\\d+$"
branch_trabalho: new-plan/mudanca_de_escopo
branch_pr_base: main
sprint_dias: 7
```

## 2. Documentos de referência
- `DECISOES_E_ROADMAP.md`: visão do produto, decisões D1 a D13, roadmap E0 a E7 e Jira. Em conflito, vale ele (o usuário atualiza; agentes propõem).
- **Design System v2 "brasa" (D12):** cópia de referência em **`docs/design-system/`** (comece por `ORIGEM.md` e `README.md`; tokens em `tokens.json`, tradução Flutter em `flutter.md`, componentes e telas em `components/`). Fonte original: artefato https://claude.ai/artifact/9TAdTj4LkKjQRPiaVbH9XK; em conflito vale o artefato. É a fonte visual; `ds-fidelidade` verifica.
- `app/README.md` (app Flutter), `docs/org/` (organização), `docs/decisoes/` (ADRs), `docs/dev/licoes.md`.
- n8n: `automations/README.md` e `infra/n8n/README.md`.
- `src/` (app React) e `server/` (Express + MongoDB) são **legado de referência**: portar o domínio de `src/domain/`, não copiar telas.

## 3. Stack e comandos oficiais
| Parte | Stack | Pasta | Comandos |
|---|---|---|---|
| App | Flutter/Dart, Clean Architecture, `go_router`, `intl` | `app/` | `flutter analyze` · `flutter test` (em `app/`) · dev server com auto reload: `node tool/dev_server.mjs` (em `app/`, porta 5500; mudar `pubspec.yaml` exige reiniciar) |
| Backend (não iniciado) | Quarkus, hexagonal, MapStruct, PostgreSQL, Flyway | `server-quarkus/` (a definir no ADR) | `./mvnw test` · `./mvnw verify` · `./mvnw quarkus:dev` (Windows: `mvnw.cmd`). PostgreSQL via Docker (sem `psql` local); Java 25 e Maven disponíveis |
| n8n | n8n self-hosted via Docker | `infra/n8n/`, `automations/` | `docker compose -f infra/n8n/docker-compose.yml up -d` · `... ps` · `... logs -f` · `... down`; validação: `node automations/validar-workflows.mjs` |
| Legado React | React 19, Vite, TypeScript, Zustand, Vitest | raiz | `npm test` · `npm run lint` |
| Legado servidor | Express, MongoDB, JWT | `server/` | `npm --prefix server test` |
| CI local | Node sem dependências | `scripts/dev/` | `node scripts/dev/ci.mjs [--resumo] [app\|legado\|servidor\|n8n\|tudo]` |

- **Agentes usam sempre `node scripts/dev/ci.mjs --resumo <etapa>`** (uma linha por comando e só as falhas, até 40 linhas). Etapa `app` = `flutter analyze` + `flutter test`; `legado` = `npm run lint` + `npm test`; `servidor` = `npm --prefix server test`; `n8n` = valida os JSONs de `automations/`.
- Estado de referência do app: `flutter analyze` limpo e 110 testes (relógio injetado, seis tamanhos de tela, dois temas, fonte 1,3×).
- Métricas de custo: `node scripts/dev/metricas.mjs --tarefa LUME-<n>`. Validação dos agentes: `node scripts/dev/validar-agentes.mjs`.
- Permissões desses comandos ficam em `.claude/settings.json`.

## 4. Convenções
- Comunicação, telas e textos em **português do Brasil**. Código em inglês, consistente dentro do projeto.
- Dinheiro: **R$ 1.234,56**. Backend com `BigDecimal` escala 2, nunca `double`. Flutter com `intl` e locale `pt_BR`.
- Datas `dd/MM/yyyy`, fuso `America/Sao_Paulo`. **Testes com relógio injetado** (nunca `DateTime.now()` solto no domínio).
- Commits: `tipo(LUME-68): resumo`, tipos `feat|fix|docs|chore|test|refactor|ci`. Sem `--no-verify`, sem `push --force`.
- Trabalho na branch `new-plan/mudanca_de_escopo`; PRs com `gh` para `main` (`docs/org/fim-de-tarefa.md`).
- **Clean Architecture** no Flutter: `lib/features/<feature>/{domain,data,presentation}`; `domain` sem Flutter nem I/O; dependências apontam para dentro.
- **Um arquivo por classe.** Exceção **pendente de aprovação** (DECISOES §6): o par `StatefulWidget`/`State` pode ficar no mesmo arquivo (ex.: `now_builder.dart`, `LumeApp`). Até o usuário aprovar, não generalize a exceção.
- Gamificação sem vício (D3): "consistência" (ex.: 5 de 7 dias), sem punição nem comparação.
- Uma tarefa por vez; plano curto antes de codar; testes e PR ao final.

## 5. Regras de domínio por papel

**Backend (`dev-backend-*`)**
- Quarkus com arquitetura hexagonal: `domain/` (puro, sem framework) · `application/` (casos de uso e portas) · `adapters/in/` (REST, jobs) · `adapters/out/` (banco, APIs). Verificada por teste ArchUnit.
- **MapStruct** (`componentModel = "jakarta-cdi"`) para DTO ↔ domínio ↔ entidade, nos adaptadores; sem mapeamento manual campo a campo. Lombok sem `@Data`/`@Setter` no domínio; domínio muda por métodos com intenção de negócio.
- Um caso de uso por classe; dependências pelo construtor; sem `null` de retorno no domínio. REST com OpenAPI.
- Porte do domínio de Tempo (atividade, passo, anotação, consistência, LUME-82) a partir de `src/domain/` com os mesmos casos de teste, em Java e Dart onde couber.
- Regras de cálculo (consistência, IMC, evolução de dose, fluxo do mês) com teste unitário obrigatório e relógio injetado.

**Dados (`dev-backend-dados`)**
- PostgreSQL com **Flyway** (migração nunca editada depois de aplicada), auditoria (quem e quando), **soft delete**, **optimistic locking** (`version`) e **UUID público** (id interno não sai da API).
- **Sync por módulo ou por registro**, nunca por documento único como no legado (`StateDoc`). Conflito num registro não sobrescreve outros módulos.
- Dinheiro em `numeric(19,2)`; datas com fuso explícito; índices nas chaves de busca e de sync.
- Documentos (E7) em armazenamento dedicado e **criptografado**, nunca no estado da aplicação nem em coluna do banco principal.

**Frontend Flutter (`dev-frontend-*`)**
- Estrutura e catálogo único de módulos em `app/lib/core/modules/` (menu e dashboard mudam juntos); navegação por `go_router`; rotas inválidas voltam à Visão geral.
- Tema centralizado em `app/lib/core/theme/`: **nenhum valor visual solto nas telas** (cor, raio, sombra, espaçamento, duração, fonte vêm de tokens). Tipografia Inter local.
- Responsivo em três classes (compact, medium, wide); layouts por classe, não escala de pixels. Widgets grandes são divididos.
- Testes de widget em seis tamanhos (320 px a desktop), nos dois temas e com fonte 1,3×; goldens e teste de contraste (LUME-78); `disableAnimations` respeitado.
- Dados de exemplo só em `*_mock_datasource.dart`; trocar por dados reais é tarefa própria (LUME-64).

**Design System v2 "brasa" (D12), `dev-frontend-design`, `dev-designer`, `dev-qa-*`**
Seguir **fielmente**; divergir só com ADR aprovado pelo usuário.
- **Uma fonte de luz por tela:** brilho com respiração de 6 s, **só** no elemento que está acontecendo agora (ex.: o card "Agora", a atividade em foco). Nunca mais de uma.
- **Superfícies em camadas:** `surface` com linha fina no topo e sombras em duas camadas (`elev-1/2/3`). **Proibido o `Card` do Material.**
- **Aurora de fundo:** dois gradientes radiais, **uma vez por página**, no scaffold (`AppPageScaffold` v2, LUME-72).
- **Vidro** (`surface-glass` + blur 20) **somente** em elementos flutuantes: BottomNav, Sheet, menu de módulos e Toast. Nunca em conteúdo de página.
- **Raios concêntricos 16 → 12 → 8 → 4:** elemento interno usa o raio do nível abaixo do contêiner.
- **Progresso que "acende":** barra ou anel com cabeça luminosa laranja → brasa; passos concluídos esfriam para violeta.
- **Movimento:** `ease-out` para entrar; `ease-in`, mais curto, para sair; **mola só** ao soltar botão, marcar check ou trocar de passo. Menu de módulos: 220 ms abrindo, 160 ms fechando (fade + escala). `MediaQuery.disableAnimations` respeitado em **tudo**.
- **Navegação** compact (BottomNav em vidro), medium e wide. Estados padrão (carregando, vazio, erro) são componentes do DS (LUME-76).
- Temas claro e escuro desde a fundação (D2); o claro definitivo faz parte do DS v2 (LUME-23). A paleta da D9 está **substituída** pelos tokens da D12 (LUME-68).
- Tom visual: profissional, contraste forte, layout limpo. Nada de gatilho de vício, comparação ou punição (D3).
- A skill `ds-fidelidade` é obrigatória em toda tarefa de UI, antes do QA.

**IA (`dev-ia-produto`, com `seg-privacidade-dpo`)**
- IA só em funcionalidades **dinâmicas** (resumos, sugestões, leitura de documento), nunca em regra determinística que o código resolve.
- **Nunca recomenda dose** de medicamento (caneta, Mounjaro/tirzepatida ou qualquer outro): o app **registra** doses; a IA, se perguntada, orienta procurar o profissional de saúde, sem número.
- **Dado de saúde é sensível (LGPD art. 11):** só entra em prompt com consentimento explícito, minimizado e sem identificadores; nunca em log. Preferir processamento local ou provedor com contrato adequado, decidido em ADR.
- **Pró-humano:** caminho do meio, linguagem gentil, sem culpa, comparação, urgência artificial ou punição (D3).
- Todo prompt, esquema de saída e teto de custo versionados; avaliação com casos de injeção, pedido de dose e saída fora de formato; fallback sem IA.

**Infra (`dev-devops-*`)**
- Imagens com versão fixa (nunca `latest`), healthcheck e restart em todo serviço; PostgreSQL e n8n nunca expostos sem proteção.
- `infra/n8n/` com README (subir, atualizar, backup, restaurar); backup do PostgreSQL com teste de restauração documentado.
- CI em `scripts/dev/ci.mjs` e GitHub Actions chamando o script; segredos só por variável de ambiente, `.env.example` atualizado.

**Segurança e privacidade (`seg-*`)**
- Lei: **LGPD** (autoridade: ANPD). Dados de saúde: art. 11, com **criptografia, consentimento explícito e trilha de auditoria** antes da E2.
- Documentos (E7) em armazenamento dedicado criptografado; URLs assinadas e curtas; nenhum documento ou dado de saúde em log, URL ou mensagem de erro.
- Autorização por usuário em toda rota (sem IDOR por UUID); JWT com expiração e rotação; segredos fora do repositório; dependências do legado com vulnerabilidades conhecidas (5, 3 altas) não migram para o novo código.
- Direitos do titular (exportar, corrigir, excluir) previstos desde o modelo de dados; soft delete não é exclusão para a LGPD.

**QA (`dev-qa-*`)**
- Um QA por tarefa. Critérios de aceite verificáveis; testes de limite de horário (início incluso, fim excluso), meia-noite, estados vazios.
- Regressão: `ci.mjs --resumo app` limpo; goldens e contraste nos dois temas; seis tamanhos de tela e fonte 1,3×.
- Extremos: `docs/org/cenarios-extremos.md` (IA pedindo dose, offline, conflito de sync, dado sensível em log).

## 6. Termos de stack
Lista usada por `scripts/dev/validar-agentes.mjs` para garantir que os agentes genéricos não citam a stack (regra específica vai para este perfil):

```yaml
termos_stack: [Quarkus, Flutter, Dart, Flyway, MapStruct, PostgreSQL, go_router, Lombok, ArchUnit, n8n, Mounjaro, tirzepatida, R$, BigDecimal, brasa]
```
