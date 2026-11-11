# LUME-71 · log

## Cenários extremos
Tabela do dev-edge-cases (11/11/2026), conferida sobre a preliminar do dev-techlead.

| # | Cenário | Área | Probabilidade | Impacto | Tratamento esperado | Quem trata | Situação |
|---|---|---|---|---|---|---|---|
| 1 | Troca de página pelo go_router usa a transição padrão do Material e ignora reduzir movimento | Navegação/a11y | Alta | Alto | `PageTransitionsBuilder` com fade quando `disableAnimationsOf`; ou pendência para a LUME-72 | techlead (decisão do Felipe), passo 1 | decidir |
| 2 | `AppTopBar` lê o scope com contexto fora do escopo → `reduced=false` silencioso | Menu/Escopo | Média | Alto | Ler com `buttonContext` dentro do escopo; teste abre o menu pela barra | passo 1, QA | tratar |
| 3 | `AppMotionScope.of` sem escopo acima | Escopo | Média | Médio | Fallback para `MediaQuery.disableAnimationsOf`, sem assert; testado com e sem a flag | passo 1, QA | tratar |
| 4 | Reduzido e fechar o menu (Esc, toque fora, Voltar, escolha de módulo) | Menu | Média | Médio | `reverseTransitionDuration = instant`; navegação segue; sem frame pendente | passo 1, QA | tratar |
| 5 | Saída reduzida fica em `exit` (160) em vez de `instant` | Menu | Média | Baixo | Os dois sentidos em `instant`; teste com `pump(instant)` | passo 1, QA | tratar |
| 6 | Teste "entrada não anima" passa por vacuidade (entrada é da LUME-72) | Teste | Alta | Médio | Comentário no teste, texto na issue e pendência; critério não dado como cumprido | QA + techlead | tratar |
| 7 | `MediaQuery` injetado ignorado pelo `MaterialApp` no teste | Teste | Média | Médio | `accessibilityFeaturesTestValue` + `addTearDown`; teste de sanidade no scaffold | QA | tratar |
| 8 | `disableAnimations` muda com a página montada | Escopo | Baixa | Baixo | `updateShouldNotify` compara `reduced`; scaffold relê em `build` | passo 1 | tratar |
| 9 | Sistema liga reduzir movimento com o menu aberto | Menu/a11y | Baixa | Baixo | Rota mantém o modo; próxima abertura lê o novo | — | aceitar |
| 10 | Código futuro usa `MediaQuery.of(context).disableAnimations` (rebuild desnecessário) | Código | Média | Baixo | Padronizar `disableAnimationsOf`; grep do QA procura o padrão antigo | QA | tratar |
| 11 | Tooltip do `bar_chart` e ripple do InkWell animam fora do `AppMotion` | Código/DS | Média | Baixo | Fora de escopo; pendência "animações implícitas do framework" | techlead | aceitar |
| 12 | `Cubic` da spring diverge de `easeOutBack` | Contrato | Alta | Baixo | `Cubic(0.34, 1.56, 0.64, 1)`; teste compara pontos e overshoot | passo 1, QA | tratar |
| 13 | Literais de movimento fora do menu | Código | Baixa | Baixo | grep ampliado (`Duration\(milliseconds|Curves\.|Cubic\(|AnimatedContainer|AnimatedSwitcher|Hero`); `Duration` de domínio fica | QA | tratar |
| 14 | Respiração 6 s (token) x 8 s (`motion.md`) | DS | Alta | Baixo | Seguir o token; pendência | techlead | aceitar |
| 15 | Fonte 1,3× e 320 px com menu reduzido | Layout | Baixa | Baixo | Testes de tamanho verdes + caso reduzido a 320 px | QA | tratar |

Pendências a registrar em `docs/pendencias.md` ao fim: toque duplo em Módulos empilha dois menus; animações implícitas do framework; breathe 6 s x 8 s; menu cubic/0,92 x quint/0,96 do catálogo; esqueleto 1,6 s sem token; critério "entrada da tela não anima" fecha na LUME-72.

## Relatórios

### dev-techlead · 11/11/2026 · plano
Resultado: concluído. Plano em `LUME-71.md`; 3 agentes em sequência (arquitetura → QA automação → design). Divergências do DS apontadas: spring (Cubic exato), breathe 6 s x 8 s, esqueleto sem token, menu quint/0,96, entrada da tela é da LUME-72.

### dev-edge-cases · 11/11/2026 · plano
Resultado: concluído. 15 cenários; 2 de impacto alto (linhas 1 e 2). Linha 1 muda o plano: proposta incluída no `LUME-71.md` como "(proposto)", aguardando o Felipe.

## Eventos n8n

## Pendências

## Pausa
### Pausa · 11/11/2026 14:38
- **Etapa atual:** pausada, com o plano pronto e aguardando aprovação do Felipe. Pausa feita porque o Felipe precisou desligar o PC.
- **Feito:** plano do dev-techlead e tabela de cenários do dev-edge-cases, gravados aqui e em `LUME-71.md`; comentário `[plano]` no Jira (commentId 10468); issue em "Fazendo".
- **Próximo passo exato:** mostrar o resumo do plano e pedir aprovação, incluindo a decisão da linha 1: incluir o `AppPageTransitionsBuilder` (fade com reduzir movimento) na LUME-71, que é a recomendação, ou deixar como pendência para a LUME-72. Com a aprovação: etapa `aprovado`, tirar os "(proposto)" do plano conforme a decisão e rodar o workflow `executar-plano` com `{ "codigo": "LUME-71" }`.
- **Agentes retomáveis:** nenhum, porque os IDs desta sessão se perdem com o desligamento. Os próximos agentes serão novos, com os briefings JSON do plano.
- **Não commitado:** `docs/tarefas/_atual` (LUME-71), `docs/tarefas/LUME-71.md`, `docs/tarefas/LUME-71.log.md` e `docs/tarefas/_retomada.md`. O `retomada.md` da raiz fica fora de commit.
- **Fora da tarefa:** o commit `fabf366` (planning do Sprint 1) ainda não teve push.
- **Ambiente:** Flutter em `C:\src\flutter\bin` (no Bash: `export PATH="/c/src/flutter/bin:/c/Program Files/nodejs:$PATH"`). App web: `cd app && node tool/dev_server.mjs 5500`. O dev server foi parado.

### Aprovação · 11/11/2026 13:30
Felipe retomou ("pode voltar a desenvolver agora"). Plano aprovado com a opção recomendada da linha 1: `AppPageTransitionsBuilder` (fade de `instant` com reduzir movimento) entra na LUME-71. Despacho manual dos 3 passos (o workflow `executar-plano` ainda não teve a opção `agentType` confirmada).

### dev-frontend-arquitetura · 11/11/2026 · passo 1
- **Feito:** `AppMotion` (8 durações, 7 curvas), `AppMotionScope`, escopo no `AppPageScaffold`, `ModulesMenuRoute(reduced)` com tokens (reduzido: só fade de `instant`), `AppTopBar` lê o escopo, `AppPageTransitionsBuilder` registrado nos temas claro e escuro.
- **Verificação:** `flutter analyze` limpo; `ci.mjs --resumo app` ok (110 testes); grep de `Duration(milliseconds|Curves.|Cubic(` só acha `app_motion.dart`.
- **Limite:** a duração de rota vem do builder da plataforma e não varia por flag; com reduzir movimento a página faz só fade, mas na duração padrão da plataforma, não em `instant`. Só o menu usa `instant`. Mudar isso exigiria sobrescrever `transitionDuration` (alteraria o normal).
- Desvio resolvido com Interval: builder recebe delegate por plataforma (mesmo mapa do padrão), repassa durações e, com a flag, o fade termina em `instant`.

### dev-qa-automacao · 11/11/2026 · passo 2
- **Feito:** testes de AppMotion (vs `tokens.json`), escopo, scaffold, menu reduzido/normal, builder de página (espião + navegação pelo menu) e higiene por grep. Cenários 2, 3, 4, 5, 6, 7, 8, 10, 12, 13 e 15 cobertos.
- **Verificação:** `ci.mjs --resumo app` ok (141 testes, 1 skip).
- **DEFEITO para o passo 1:** `AppMotion.inOut = Curves.easeInOut` é Cubic(0.42, 0, 0.58, 1); o DS pede (0.645, 0.045, 0.355, 1) = `Curves.easeInOutCubic`. Teste com `skip` até corrigir.
- **Ajuste de teste:** o overlay do menu sai no frame seguinte ao fim da animação; a saída normal é conferida em `exit` + 1 frame.
- **Pendente:** apagar `app/test/_tmp/dbg_test.dart` (placeholder; exclusão negada ao agente).
- **Atualização:** defeito do `inOut` corrigido no passo 1, `skip` removido; ci ok com 141 testes, 0 skip. `_tmp` já apagado.
- inOut corrigido para easeInOutCubic (tokens.json).

### dev-frontend-design · 11/11/2026 · passo 3
- **Bloqueia:** nada. Tokens de `AppMotion` (8 durações, 7 curvas, `inOut` corrigido) batem com `tokens.json`; sem valores soltos no diff; reduzir movimento respeitado (menu só com fade de `instant`; página só com fade); sem `Card`, sem cor nova.
- **Recomendo:**
  1. `AppMotion.spring` não tem guarda para reduzir movimento (DS: "desligada em reduzir movimento"). Antes do primeiro uso, expor algo como `AppMotion.springOf(reduced)` na LUME-72.
  2. Com reduzir movimento, a duração da rota segue a da plataforma (fade termina em `instant` via Interval, mas a rota fica aberta mais tempo); aceitável, registrado como limite.
- **Observações:** `AppMotionScope.of` sem escopo cai em `MediaQuery`, correto. Nenhuma tela nova, então sem golden/contraste neste passo.

#### Texto para docs/pendencias.md
- **LUME-71 · Desvios de movimento conhecidos do DS (DS x implementação):** (a) menu de módulos abre com escala 0,92 e curva `easeOutCubic`; o DS pede 0,96 e `ease-out-quint` para painéis; (b) `breathe` está em 6 s conforme `tokens.json`, mas `motion.md` cita 8 s: confirmar qual vale; (c) esqueleto de carregamento usa 1,6 s sem token em `tokens.json`; (d) entrada da tela (`dur-page`, hero + 2 ondas) fica para a LUME-72; (e) `spring` sem guarda para reduzir movimento. Decisão do Felipe/DS onde houver conflito.

### Review · 11/11/2026
- dev-frontend-design (ds-fidelidade): aprovado sem bloqueio; 5 desvios viraram pendência em `docs/pendencias.md`.
- dev-techlead: sem bloqueio. Recomendações: teste de higiene depende do cwd `app/` (aceito, o ci roda em `app/`); `findsNothing` de Scale/Slide é fraco (coberto pelo teste unitário do builder); formato do `.push(` no `AppTopBar` corrigido.
- dev-edge-cases: 11 cenários "tratar" tratados; bloqueios eram só registro (pendências gravadas e comentário da linha 6 em `page_transitions_test.dart`), resolvidos.
- ci final: analyze limpo, 141 testes verdes.
