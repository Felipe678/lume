# LUME-68 · log

## Cenários extremos
Tabela preliminar do `dev-techlead` (15/11/2026 05:15), a conferir pelo `dev-edge-cases`.

| # | Cenário | Área | Probab. | Impacto | Tratamento esperado | Quem trata | Situação |
|---|---|---|---|---|---|---|---|
| 1 | Byte de alpha trocado (CSS `#RRGGBBAA` × Dart `0xAARRGGBB`) em `scrim`, `hairline*`, `surfaceGlass`, `aurora*`, `cardFgMuted`, `cardBorder` | cor | média | alto | Teste lê o `tokens.json` e compara | QA | tratar |
| 2 | Campo esquecido em `copyWith` ou `lerp` (28 campos) | tema | média | médio | Teste de identidade e dos extremos do `lerp` | QA | tratar |
| 3 | Valor mudou no tema claro (`textMuted` #8A8A93 → #62626C) e piorou o contraste | acessibilidade | baixa | alto | `contrast_test` nos dois temas | QA | tratar |
| 4 | Hex escapa por outro formato (`Color.fromARGB`, `0x...` sem `Color(`) | cor | média | médio | Grep cobre os três formatos | arquitetura | tratar |
| 5 | `AppPalette.red` sai e `danger` passa a depender do tema | finanças | média | médio | A função recebe `AppColors` | arquitetura | tratar |
| 6 | Tema claro é provisório (LUME-23) | design | alta | baixo | Aceito: valores do `tokens.json` light, comentário mantido | design | aceito |
| 7 | `blue` muda de `#2F6BFF` para `#2b64f5`: tom diferente nas finanças | design | alta | baixo | Aceito: nenhum teste ou golden depende de cor hoje | design | aceito |

Conferência do `dev-edge-cases` (15/11/2026): #1, #2, #3, #5 mantêm "tratar"; #6 e #7 mantêm "aceito"; **#4 vira "já coberto"** (o grep já tem `Color\.from` e `0x[0-9A-Fa-f]{8}`). Cenários novos:

| # | Cenário | Área | Probab. | Impacto | Tratamento esperado | Quem trata | Situação |
|---|---|---|---|---|---|---|---|
| A | Contrato dizia 29 campos; são **28** (14+14; `ember` é fixo) | contrato | alta | alto | Corrigido para 28 no plano, contratos e briefings; teste percorre o JSON nos dois sentidos | techlead | **tratado** |
| B | `app_motion_test.dart:8-17` lê o JSON com `value as String`: quebra em `{dark, light}`; `skip` por arquivo ausente passaria sem rodar | teste | média | médio | Parser String ou Map; falha clara, sem skip; roda igual no CI e em `flutter test` a partir de `app/` | QA | tratar |
| C | `AppPalette.violet` como borda de 1,5 px (`module_menu_tile.dart:37`): 2,7:1 | acessibilidade | alta | médio | Aceito; pendência (`violetInk`) | design | aceito + pendência |
| D | `red` → `colors.danger` na categoria "café" (`finance_visuals.dart:56`) contradiz "pró-humano" | finanças | alta | médio | Mantém o vermelho de hoje; pendência de cor de categoria; sem token novo | arquitetura, design | aceito + pendência |
| E | `blue`/`cyan`/`green` como ícone ou texto sobre escuro (`finance_visuals.dart:54`); DS pede `*Ink` | acessibilidade | média | baixo | Aceito; pendência; contraste dos `*Ink` na LUME-78 | design | aceito |
| F | Grep de nomes antigos com falso positivo/negativo; `grep -v` falha no PowerShell | processo | média | baixo | Rodar em Git Bash com `\b(background\|topBar\|cardForeground)\b`; `flutter analyze` complementa | arquitetura | tratar |
| G | Duplo alpha: `now_card.dart:28` faz `cardForeground.withValues(alpha: 0.72)` e `cardFgMuted` já é B8 (0,7216) | cor | baixa | médio | `cardFgMuted` direto; proibido `withValues` sobre token com alpha; o 0,15 (`now_card.dart:117`) fica | arquitetura | tratar |
| H | `ThemeData` sem `colorScheme` (`app_theme.dart:17-45`): tokens novos não mudam os widgets Material | tema | baixa | baixo | Aceito; pendência para LUME-23 e componentes | arquitetura | aceito |
| I | `Colors.white` fixo sobre `violet`: seguro nos dois temas | tema | baixa | baixo | Nada | design | já coberto (#6) |
| J | `lerp(other, 1) == other` por arredondamento | teste | baixa | baixo | Nada: `a*(1-t) + b*t` é exato nos extremos | QA | aceito |

## Relatórios
Relatórios dos agentes (protocolo §4) e registros do comando, do mais antigo para o mais novo.

### dev-techlead · 15/11/2026 05:15 · planejamento
Resultado: concluído. Plano gravado em `LUME-68.md` e `LUME-68.contratos.md`. Não rodou testes (só leitura e grep).

### Aprovação · 15/11/2026 05:35
Felipe aprovou o plano (28 campos, renomear tudo de uma vez, contraste mínimo na LUME-68, pendências da Decisão 3). Etapa `aprovado`; segue `executar-plano`.
### dev-frontend-arquitetura · 15/11/2026 · passo 1 (cores)
Resultado: concluído. AppColors (28 campos) e AppPalette reescritos a partir do tokens.json (gerados por script, alpha convertido). Consumidores migrados sem camada de compatibilidade. Desvio: `spendingCategoryIconColor` ganhou o parâmetro `AppColors colors` para usar `colors.danger` no café (único chamador atualizado). `_subtitle` do NowCard virou const (usa cardFgMuted). Resíduos sem token em AppPalette: badges, mastercard, chipGradient, appleIconOnWhite, cardChipBorder, cardChipLine. Greps de hex solto e nomes antigos vazios. ci app: analyze limpo, 141 testes verdes.

## Eventos n8n

## Pendências
- **Orçamento (15/11/2026):** o hook de métricas registrou 845.303 tokens ponderados com o plano ainda sem implementação (referência 500.000; teto 1.000.000 = 2x). Medido por `metricas.mjs --tarefa LUME-68`: 100% é uma execução do `dev-techlead` (21 chamadas, 1.380.011 brutos, cache 66%). Motivo: o planejamento leu o DS (`tokens.json`, `flutter.md`), o tema e os consumidores no app para montar o mapa de impacto, além de pedir um plano completo com briefings. O teto de 2x (1.000.000) vale para a implementação que falta. O script mostra 2.000.000 como orçamento ("padrão, ajuste no plano da tarefa"): o `LUME-68.md` diz 500.000, e o hook usa o do plano. Daqui em diante: briefings objetivos, agentes só onde dividem trabalho, sem retrabalho. Passando de 1.000.000, pausar com passagem de contexto completa.

## Pausa

## Passo 2 · dev-qa-automacao
- Resultado: concluído. `ci app` verde: analyze limpo, 194 testes passando.
- Testes novos (core/theme): `app_colors_test` (parser, 28x28 nos dois sentidos, valores dark/light, copyWith, lerp), `app_palette_test` (32 fixos nos dois sentidos, gradientes), `contrast_test` (30 pares de texto + on-violet/cyan/orange/green e on-danger nos 2 temas, todos >= 4,5:1).
- Helpers: `app/test/helpers/contrast.dart` (razão WCAG) e `tokens_json.dart` (parser, String ou Map, falha clara se o arquivo faltar).
- Desvio: `tokens_json.dart` não estava na lista de caminhos; é utilitário de teste compartilhado entre os 2 testes de valores.
- Defeitos de produção: nenhum. Lacunas: matriz completa, `*-ink`, golden (LUME-78).

## Passo 3 · ds-fidelidade (parecer)
Conferido: todos os valores de cor do `tokens.json` (dark e light) existem em `AppColors`/`AppPalette`; conversão de alpha correta; renomeações aplicadas; `cardFgMuted` (B8 = 72%) coerente com o uso anterior; objetivos e dados apontam para `AppPalette`.
**Bloqueia:** nada.
**Recomendo:** `app_top_bar.dart` usa `onOrange` como cor do ícone de perfil; confirmar que o fundo é `orange` (preenchimento), senão trocar por token de texto.
**Observações:** resíduos sem token mantidos em seção própria; `light` segue provisório (DS admite).
Texto para `docs/pendencias.md`:
- [LUME-68][dev-designer] Sem token no DS: `badgeRed`, `badgeBlue`, `badgeNeutral`, `mastercardRed`, `mastercardYellow`, `chipGradient`, `appleIconOnWhite`, `cardChipBorder`, `cardChipLine`. Definir tokens ou aprovar como exceção. Hoje ficam em `app_palette.dart` ("sem token no DS").

## Passo 2 (reconferência) · dev-qa-automacao
- Resultado: concluído. `ci app` verde: analyze limpo, 260 testes passando.
- Sem defeito de produção.
- `app_top_bar.dart:55-56`: ícone de perfil usa `onOrange` sobre `CircleAvatar` com `backgroundColor: AppPalette.orange` (preenchimento). Correto; o par está coberto no `contrast_test`.
- Lacunas para a LUME-78: matriz completa de contraste (hoje há texto sobre 8 fundos e `*-ink`/danger sobre bg/surface/surfaceRaised/chip/heroBand), golden por tema. `*-ink` no tema claro sobre chip/heroBand fica abaixo de 4,5:1 (não exigido; pendência de DS).

## Fechamento · 15/11/2026 07:25
- **Resultado:** concluída; PR #4 (https://github.com/Felipe678/lume/pull/4) aguardando merge. Jira em "Fazendo" até o merge. CI local: `flutter analyze` limpo e 260 testes verdes (conferido pela sessão principal, não só pelos agentes).
- **Custo (metricas.mjs):** 4.092.468 ponderados, 13 execuções, 134 chamadas. Referência do plano 500.000 (8x); passou do teto de 2x (1.000.000). Por agente: techlead 26% (2 execuções), arquitetura 25% (3), qa-automacao 23% (4), edge-cases 14%, ops-gestor 5%, design 4%.
- **Causa provável (não verificada a fundo):** a tarefa era pequena no código (2 arquivos de tema e 10 consumidores), mas o workflow rodou 2 rodadas de correção, e o `dev-qa-automacao` entrou 4 vezes (o script sinalizou "possível loop") e o arquitetura 3 vezes. O review só bloqueou por documentação (`docs/pendencias.md`), que a sessão principal resolveu em minutos. Quando uma pendência é só de documentação, não precisa de nova rodada de agentes de código.
- **Desvios aceitos:** `app/test/helpers/tokens_json.dart` fora da lista de caminhos exclusivos (utilitário compartilhado pelos dois testes de valores); `spendingCategoryIconColor` ganhou o parâmetro `AppColors`.
- **Contagem de testes:** os relatórios divergiram (194 e 260); valeu a execução da sessão principal: 260.
