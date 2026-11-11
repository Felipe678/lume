# LUME-71 · AppMotion e AppMotionScope (movimento do DS v2)

- **Jira:** LUME-71 (épico LUME-67)
- **Etapa atual:** commit
- **Atualizado em:** 11/11/2026 13:30
- **Orçamento (ponderado):** 600.000
- **Gasto até agora:** `node scripts/dev/metricas.mjs --tarefa LUME-71`
- **UI:** sim
- **IA:** não

## Objetivo
Criar `AppMotion` (durações e curvas do DS v2) e `AppMotionScope` (reduzir movimento lido uma vez na página) e fazer o menu de módulos usá-los, sem literais.

## Definição de pronto
- [ ] `AppMotion` existe com 8 durações e 7 curvas iguais ao `tokens.json` → teste `app/test/core/theme/app_motion_test.dart` compara cada valor
- [ ] O menu de módulos usa `AppMotion.base/exit` e `easeOut/easeIn`, sem literal → `grep -rnE "Duration\(milliseconds|Curves\.|Cubic\(" app/lib` só acha `core/theme/app_motion.dart`
- [ ] `AppMotionScope` disponível no `AppPageScaffold`, lido uma vez com `MediaQuery.disableAnimationsOf` → teste: reduced=true com `disableAnimations`, false sem
- [ ] Com `disableAnimations: true`, o menu abre e fecha só com fade de no máximo `AppMotion.instant`, sem escala nem deslocamento → teste de widget (ver Contratos)
- [ ] Troca de página do go_router com `disableAnimations: true` é só fade de no máximo `AppMotion.instant`; sem a flag, a transição atual não muda → teste de widget navegando pelo menu
- [ ] A página com `disableAnimations: true` não tem transição de entrada nem frame agendado após o primeiro `pump` (guarda para a LUME-72; entrada real é da LUME-72) → teste de widget
- [ ] `flutter analyze` limpo e `flutter test` verde → `node scripts/dev/ci.mjs --resumo app`
- [ ] Fiel ao DS v2 "brasa": sem valor visual solto e movimento só opacity/transform → skill `ds-fidelidade`
- [ ] Desvios do DS registrados em `docs/pendencias.md` (breathe 6 s x 8 s, menu quint/0,96 x cubic/0,92, esqueleto 1,6 s sem token, critério "entrada da tela" cumprido na LUME-72)
- [ ] Cenários extremos tratados ou aceitos (`LUME-71.log.md`)
- [ ] QA aprovado · review do `dev-techlead` aprovado
- [ ] Commit `feat(LUME-71): resumo` e PR para `main` (`docs/org/fim-de-tarefa.md`)

## Contratos
- `app/lib/core/theme/app_motion.dart`: `abstract final class AppMotion` com `static const`. Durações (ms): `instant` 80, `fast` 140, `exit` 160, `base` 220, `slow` 360, `page` 480, `pulse` 600, `breathe` 6000. Curvas: `easeOut` = `Curves.easeOutCubic`, `easeIn` = `Curves.easeInCubic`, `settle` = `Cubic(0.16, 1, 0.3, 1)`, `outQuint` = `Curves.easeOutQuint`, `outExpo` = `Curves.easeOutExpo`, `inOut` = `Curves.easeInOut`, `spring` = `Cubic(0.34, 1.56, 0.64, 1)` (não `easeOutBack`, que é outra curva; `flutter.md` e `Motion/README` aceitam este `Cubic`). Comentário de uma linha por grupo com as regras do `motion.md`: entrar easeOut, sair easeIn e mais curto, só opacity e transform, nada acima de `page`.
- `app/lib/core/theme/app_motion_scope.dart`: `class AppMotionScope extends InheritedWidget` com `final bool reduced`; `static AppMotionScope of(BuildContext)`; `updateShouldNotify` compara `reduced`. Sem escopo acima, `of` devolve `reduced` lido de `MediaQuery.disableAnimationsOf`, para nunca ignorar o pedido do sistema.
- `AppPageScaffold` lê `MediaQuery.disableAnimationsOf(context)` uma vez em `build` e envolve o `Scaffold` em `AppMotionScope(reduced: ...)`. Assinatura pública não muda.
- `ModulesMenuRoute({required anchor, required currentPath, required bool reduced})`. O `AppTopBar` (dentro do escopo) passa `AppMotionScope.of(buttonContext).reduced`; a rota fica acima da página no Navigator e não enxerga o escopo. Durações: normal `transitionDuration = AppMotion.base`, `reverseTransitionDuration = AppMotion.exit`; reduzido, as duas = `AppMotion.instant`. Curvas `AppMotion.easeOut`/`easeIn`. Reduzido: só `FadeTransition`, sem `ScaleTransition` e `SlideTransition`. Normal: comportamento atual (escala 0,92, deslocamento -0,015) fica como está.
- `app/lib/core/theme/app_page_transitions_builder.dart`: `PageTransitionsBuilder` que, com `MediaQuery.disableAnimationsOf(context)`, devolve só `FadeTransition`; sem a flag, delega ao builder padrão da plataforma. Registrado no `pageTransitionsTheme` do `app_theme.dart` (temas claro e escuro). `app_router.dart` não muda.
- O `AppTopBar` lê `AppMotionScope.of(buttonContext)` com um contexto DENTRO do escopo; o teste abre o menu pela barra, nunca instanciando a rota com `reduced: true`.
- Fora do escopo: entrada da tela, anel, barras, respiração, pulso (LUME-72 em diante). Não criar widget de entrada nem token de esqueleto.
- Teste do reduzido: ligar com `tester.platformDispatcher.accessibilityFeaturesTestValue = FakeAccessibilityFeatures(disableAnimations: true)` (restaurar no `addTearDown`); se o `MaterialApp` ignorar o `MediaQuery` injetado, usar esta forma.

## Plano de despacho
QA da tarefa: `dev-qa-automacao` · Segurança: `não`
Dimensionamento: 3 agentes em sequência. O trabalho de código é pequeno e acoplado (classe, escopo, scaffold, rota e top bar compartilham o contrato), então 1 implementador evita conflito. QA separado escreve os testes novos. O `dev-frontend-design` só confere o DS.

| # | Agente | Entrada | Saída esperada | Depende de | Caminhos exclusivos | ID do agente | Status |
|---|--------|---------|----------------|------------|---------------------|--------------|--------|
| 1 | dev-frontend-arquitetura | Contratos acima | `AppMotion`, `AppMotionScope`, scaffold, rota e top bar atualizados; sem literais | — | `app/lib/core/theme/app_motion.dart`, `app/lib/core/theme/app_motion_scope.dart`, `app/lib/app/shell/app_page_scaffold.dart`, `app/lib/app/shell/app_top_bar.dart`, `app/lib/app/navigation/modules_menu_route.dart`, `app/lib/core/theme/app_page_transitions_builder.dart`, `app/lib/core/theme/app_theme.dart` | a849957238a918a18 | concluido |
| 2 | dev-qa-automacao | Código do passo 1 e cenários do log | Testes novos e ajuste dos existentes; ci verde | 1 | `app/test/core/theme/**`, `app/test/app/shell/**`, `app/test/app/navigation/modules_menu_test.dart` | a701057b82b1d19fe | concluido |
| 3 | dev-frontend-design | Diff dos passos 1 e 2 | Parecer `ds-fidelidade`; desvios listados para `docs/pendencias.md` | 2 | — | afeef49b1c50555ef | concluido |

### Briefings

#### Passo 1 · dev-frontend-arquitetura
```json
{
  "tarefa": "LUME-71",
  "passo": 1,
  "objetivo": "Criar AppMotion e AppMotionScope, ligar o escopo ao AppPageScaffold e migrar o menu de módulos para os tokens, com modo reduzido só fade",
  "contexto_minimo": ["docs/tarefas/LUME-71.md#Contratos", "docs/design-system/tokens.json (duration, easing)", "docs/design-system/motion.md (Reduzir movimento)", "app/lib/app/navigation/modules_menu_route.dart", "app/lib/app/shell/app_top_bar.dart (linha ~93)", "app/lib/app/shell/app_page_scaffold.dart"],
  "contratos": ["AppMotion", "AppMotionScope", "ModulesMenuRoute(reduced)"],
  "restricoes": ["um arquivo por classe", "abstract final class com static const, estilo AppPalette", "nenhum Duration(milliseconds) nem Curves.* em app/lib fora de app_motion.dart (Duration em now_builder e mock de dados é tempo de domínio, não movimento, e fica)", "só opacity e transform", "ler disableAnimations uma vez, no scaffold", "sem entrada de tela nem token de esqueleto", "comentários e textos em PT-BR", "não mexer em app/test"],
  "pronto_quando": ["flutter analyze limpo", "grep dos literais de movimento só acha app_motion.dart", "menu normal igual ao de hoje (220/160, easeOut/easeIn)", "testes existentes seguem verdes: node scripts/dev/ci.mjs --resumo app"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-71.log.md",
  "limite_resposta": "até 150 palavras + lista de arquivos"
}
```

#### Passo 2 · dev-qa-automacao
```json
{
  "tarefa": "LUME-71",
  "passo": 2,
  "objetivo": "Cobrir AppMotion, AppMotionScope e o menu em modo normal e reduzido com testes de widget",
  "contexto_minimo": ["docs/tarefas/LUME-71.md#Contratos", "docs/tarefas/LUME-71.log.md#Cenários extremos", "app/test/app/navigation/modules_menu_test.dart", "app/test/helpers/themed_app.dart"],
  "contratos": ["AppMotion", "AppMotionScope", "ModulesMenuRoute(reduced)"],
  "restricoes": ["não editar app/lib; defeito de código vai no relatório ao passo 1", "o teste de página reduzida verifica scope.reduced == true e ausência de frame agendado após o primeiro pump, sem exigir entrada (é da LUME-72)", "restaurar accessibilityFeaturesTestValue com addTearDown", "usar tokens do AppMotion nos tempos do teste, sem literal"],
  "pronto_quando": ["app_motion_test compara as 8 durações e 7 curvas com o tokens.json", "scope: reduced true com disableAnimations e false sem; sem escopo, of cai no MediaQuery", "menu reduzido: opaco após pump(AppMotion.instant), sem ScaleTransition e SlideTransition; fecha em no máximo instant", "menu normal: ainda anima (teste existente) e fecha em exit", "node scripts/dev/ci.mjs --resumo app verde"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-71.log.md",
  "limite_resposta": "até 150 palavras + lista de arquivos"
}
```

#### Passo 3 · dev-frontend-design
```json
{
  "tarefa": "LUME-71",
  "passo": 3,
  "objetivo": "Conferir o diff contra o DS v2 brasa e a skill ds-fidelidade",
  "contexto_minimo": ["git diff e arquivos não rastreados", "docs/design-system/motion.md", "docs/design-system/components/ModulesMenu/README.md", "docs/design-system/components/Motion/README.md"],
  "contratos": ["AppMotion", "AppMotionScope"],
  "restricoes": ["não editar nada; devolver parecer", "desvio conhecido (menu 0,92 e cubic x 0,96 e quint; breathe 6 s x 8 s) vai como pendência explícita, não como bloqueio"],
  "pronto_quando": ["parecer com Bloqueia / Recomendo / Observações e texto pronto para docs/pendencias.md"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-71.log.md",
  "limite_resposta": "até 150 palavras"
}
```

## Orçamento e acompanhamento
- Teto: o valor acima. Ao passar de 80%, o despachante avisa o usuário; ao passar de 100%, pausa (`/pausar`).
- Cada mudança de etapa gera um evento ao n8n (`docs/org/n8n.md`); falha do n8n não bloqueia.

## Riscos e decisões em aberto
- A issue pede teste "a entrada da tela não anima". Sem entrada (LUME-72), o teste cobre só o escopo e a ausência de frames agendados. Comentar na issue que o critério completo fecha na LUME-72.
- `spring` da issue é "≈ easeOutBack". O plano usa o `Cubic` exato do DS (decisão do TechLead; sem impacto hoje, ninguém usa a mola ainda).
- Divergência interna do DS: respiração de 6 s (token) x 8 s (`motion.md`). Seguimos o token; avisar o `dev-designer` via pendência.
- Menu sem as curvas/escala do catálogo (quint, 0,96): mudar é visual e fora do "pronto"; fica como pendência para decisão do Felipe.
- Sem dependência nova e sem gatilho de segurança (`seguranca: não`). Cenários extremos em `LUME-71.log.md`.
