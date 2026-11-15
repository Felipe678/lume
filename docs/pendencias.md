# Pendências

> Itens em aberto que não cabem numa tarefa específica. Cada linha tem dono sugerido. Itens resolvidos saem daqui (o histórico fica em `docs/progresso.md`).

## Aguardando decisão do usuário
- [ ] **Exceção "um arquivo por classe"** para o par `StatefulWidget`/`State` (`DECISOES_E_ROADMAP.md` §6). Dono: usuário; registrar em ADR quando decidir.
- [ ] **Local e nome do projeto Quarkus** (`server-quarkus/` é só sugestão do perfil). Dono: `cto`.
- [ ] **Provedor de IA e política de dados de saúde** (processamento local × provedor externo, contrato, retenção) antes de qualquer funcionalidade de IA com dado de saúde. Dono: `dev-ia-produto` + `seg-privacidade-dpo`.
- [ ] **Respiração: 6 s ou 8 s?** O `tokens.json` diz `dur-breathe` 6 s (seguido no `AppMotion.breathe`); o `motion.md` cita 8 s. Decidir qual vale e corrigir o outro no DS. Origem: LUME-71. Dono: usuário + `dev-designer`.
- [ ] **Menu de módulos fora do catálogo do DS:** hoje abre com escala 0,92 e `easeOutCubic`; o catálogo (`components/ModulesMenu`) pede 0,96 e `ease-out-quint`. Mudar é visual; decidir se alinha. Origem: LUME-71. Dono: usuário + `dev-frontend-design`.

## Fundação técnica (E0)
- [ ] Backend Quarkus (hexagonal + MapStruct) e PostgreSQL com Flyway. Dono: `dev-backend-dominio`, `dev-backend-dados`.
- [ ] Desenho do sync por módulo/registro. Dono: `cto` + `dev-backend-dados`.
- [ ] Criptografia, consentimento e auditoria de dados de saúde, antes da E2. Dono: `seg-dados` + `seg-privacidade-dpo`.
- [ ] Instância n8n (`infra/n8n/`) e workflows de desenvolvimento em `automations/` (D13). Dono: `dev-devops-infra`, `dev-backend-integracoes`.

## Legado e documentação
- [ ] `README.md` da raiz desatualizado (descreve só o app React). Dono: `dev-techlead`.
- [ ] 5 vulnerabilidades no `npm install` do React (3 altas); decidir se corrige ou apenas aposenta o legado. Dono: `seg-appsec`.
- [ ] Decidir quando aposentar o app React (após a E1). Dono: `produto`.
- [ ] Ícones e imagens do Eclipse substituídos por equivalentes (LUME-27). Dono: `dev-designer`.

## Design System v2 · movimento (LUME-71)
- [ ] **Critério "entrada da tela não anima" só fecha na LUME-72.** A LUME-71 deixou o `AppMotionScope` e um teste-guarda (sem frame agendado após o primeiro pump); a entrada real (`dur-page`) e seu teste reduzido nascem na LUME-72. Dono: `dev-frontend-design`.
- [ ] **`AppMotion.spring` sem guarda de reduzir movimento.** O DS pede mola desligada no modo reduzido; tratar antes do primeiro uso (LUME-72). Dono: `dev-frontend-design`.
- [ ] **Esqueleto de carregamento (1,6 s) sem token** em `tokens.json`; criar o token quando o esqueleto for implementado. Dono: `dev-designer`.
- [ ] **Animações implícitas do framework** (Tooltip do `bar_chart`, ripple do `InkWell`) animam fora do `AppMotion` e não respeitam o escopo. Avaliar se tematiza. Dono: `dev-frontend-design`.
- [ ] **Toque duplo em Módulos empilha dois menus.** Guardar a rota aberta no `AppTopBar`. Dono: `dev-frontend-arquitetura`.
- [ ] **Sistema liga reduzir movimento com o menu aberto:** a rota mantém o modo em que abriu; a próxima abertura lê o novo (aceito). Dono: —.
- [ ] **Troca de página reduzida mantém a duração da plataforma;** só o fade termina em `instant` (via `Interval`). Aceito: a duração da rota não varia por flag no Flutter 3.47. Dono: —.

## Design System v2 · cores (LUME-68)
- [ ] **Tema claro: *-ink (cyan, orange, green, blue) abaixo de 4,5:1 sobre `chip` e `heroBand`** (teste de contraste). Ajustar token ou evitar o par. Dono: `dev-designer`.
- [ ] **Sem token no DS:** `badgeRed`, `badgeBlue`, `badgeNeutral`, `mastercardRed`, `mastercardYellow`, `chipGradient`, `appleIconOnWhite`, `cardChipBorder`, `cardChipLine`. Hoje ficam em `app_palette.dart`, na seção "sem token no DS". Definir tokens ou aprovar como exceção. Dono: `dev-designer`.
- [ ] **Borda do tile selecionado do menu usa `AppPalette.violet` (2,7:1, abaixo de 3:1)** em `module_menu_tile.dart:37`. Trocar por `violetInk` na tarefa do menu. Dono: `dev-designer`.
- [ ] **Categoria "café" em vermelho de erro** (`finance_visuals.dart:56`, `colors.danger`): o DS reserva `danger` a erro ou ação destrutiva, e o produto não pune. Definir cor de categoria própria, sem criar token por conta própria. Dono: `dev-designer`.
- [ ] **`blue`, `cyan` e `green` como ícone ou texto sobre fundo escuro** (`finance_visuals.dart:54`): o DS pede os `*Ink`. Migrar com a matriz de contraste da LUME-78. Dono: `dev-designer`.
- [ ] **`ThemeData` sem `colorScheme`** (`app_theme.dart`): só `bg` entra em `scaffoldBackgroundColor`; os widgets Material herdam o M3 padrão e não consomem os tokens. Tratar na LUME-23 e nas tarefas de componente. Dono: `dev-frontend-arquitetura`.
- [ ] **`Colors.white`/`Colors.black` fixos (9 usos)** que deveriam virar `scrim`, `onViolet` etc. Mudam o visual (ex.: `barrierColor` de 25% para 60%); migrar nas tarefas de componente. Dono: `dev-frontend-design`.
- [ ] **Matriz completa de contraste, goldens e fonte 1,3×** ficam na LUME-78; o helper `app/test/helpers/contrast.dart` já existe. Dono: `dev-qa-automacao`.
