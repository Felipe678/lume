# LUME-68 · Tokens de cor v2 em AppColors e AppPalette (dark + light)

- **Jira:** LUME-68 (épico LUME-67). Relacionada: LUME-27 (link "relates to" já existe). Tema claro provisório até a LUME-23; testes completos na LUME-78.
- **Etapa atual:** concluida (PR #4 aguardando merge)
- **Atualizado em:** 15/11/2026 07:25
- **Orçamento (ponderado):** 500.000
- **Gasto até agora:** `node scripts/dev/metricas.mjs --tarefa LUME-68`
- **UI:** sim (o design confere o DS; não há tela nova, só tokens)
- **IA:** não · **Segurança:** não (sem saúde, autenticação, documentos nem IA)

## Objetivo
Alinhar `AppColors` (28 campos por tema) e `AppPalette` (cores fixas) aos valores exatos do `tokens.json` do DS v2 e remover todo hex solto do restante de `app/lib`.

## Definição de pronto
- [ ] `AppColors.dark` e `AppColors.light` expõem os 28 campos do contrato, com os valores de `tokens.json` → `app/test/core/theme/app_colors_test.dart` lê `docs/design-system/tokens.json`, converte `#RRGGBB[AA]` em `Color(0xAARRGGBB)` e compara campo a campo nos dois temas e **percorre o JSON nos dois sentidos**: todo token `{dark, light}` tem campo e todo campo tem token (28 e 28).
- [ ] `AppPalette` expõe os tokens fixos do contrato → `app_palette_test.dart` (mesma comparação).
- [ ] `copyWith` e `lerp` cobrem todos os campos → `lerp(other, 0) == this`, `lerp(other, 1) == other` e `copyWith()` sem argumentos igual ao original.
- [ ] O teste falha com mensagem clara se `tokens.json` não existir (sem `skip`) e o parser aceita valor String ou Map `{dark, light}` (o helper de `app_motion_test.dart` só aceita String: não copiar).
- [ ] Nenhum hex solto fora dos dois arquivos de tema → deve sair vazio: `grep -rnE "Color\(0x|Color\.from|0x[0-9A-Fa-f]{8}" app/lib | grep -vE "core/theme/app_(colors|palette)\.dart"`
- [ ] Nomes antigos removidos, sem camada de compatibilidade → deve sair vazio, rodando em Git Bash: `grep -rnE "\b(background|topBar|cardForeground)\b|AppPalette\.(onCard|red|mint|purple|yellow)\b" app/lib` (o `flutter analyze` acusa o que sobrar; `Colors.white/black/transparent` ficam fora de propósito)
- [ ] Sem duplo alpha: nenhum `withValues`/`withOpacity` sobre token que já tem alpha (`cardFgMuted`, `cardBorder`, `scrim`, `hairline*`, `surfaceGlass`, `aurora*`); `now_card.dart:28` (0,72) passa a usar `cardFgMuted`; o 0,15 de `now_card.dart:117` fica.
- [ ] Teste de contraste mínimo nos dois temas (Decisão 1) → `app/test/core/theme/contrast_test.dart` verde.
- [ ] `flutter analyze` limpo e `flutter test` verde, sem baixar de 141 testes → `node scripts/dev/ci.mjs --resumo app`
- [ ] Fiel ao DS v2 "brasa": valores só do `tokens.json`, divergências registradas → skill `ds-fidelidade` (passo 3)
- [ ] `docs/pendencias.md` atualizado com os resíduos sem token (contratos) e as pendências da Decisão 3
- [ ] Cenários extremos tratados ou aceitos (`LUME-68.log.md`)
- [ ] QA aprovado · review do `dev-techlead` aprovado
- [ ] Commit `feat(LUME-68): resumo` e PR para `main` (`docs/org/fim-de-tarefa.md`)

### Decisão 1: teste de contraste
Fica **na LUME-68, em versão mínima**: o critério 3 da issue o cita e ele protege a correção do `textMuted`.
- **LUME-68 faz:** `textPrimary`, `textSecondary` e `textMuted` sobre `bg`, `surface`, `surfaceRaised`, `chip` e `heroBand`, nos dois temas, mínimo 4,5:1 (30 pares); `onViolet/violet`, `onCyan/cyan`, `onOrange/orange`, `onGreen/green` e `onDanger/danger`. Inclui o helper `app/test/helpers/contrast.dart`, que a LUME-78 reaproveita.
- **LUME-78 faz:** goldens, a matriz completa (`*-ink`, `surface-tint` 6,5:1, foco e `border-control` a 3:1, `card-fg`), fonte 1,3× e classes de tela.
- **Aceito:** `violet` sobre `bg` dá 2,7:1 (limite conhecido do DS, `README.md` linha 41); fora do teste.
- Os números citados no `tokens.json` não foram recalculados no plano: o teste é quem confirma.

### Decisão 3: achados do `dev-edge-cases` (aceitos, viram pendência em `docs/pendencias.md`, dono `dev-designer`)
- **Borda violet:** `module_menu_tile.dart:37` usa `AppPalette.violet` como borda de 1,5 px (2,7:1, abaixo de 3:1). A troca certa é `violetInk`; fica para a tarefa do menu.
- **`danger` na categoria "café":** `finance_visuals.dart:56` mantém o vermelho de hoje via `colors.danger`; "erro, raro, não pune" pede uma cor de categoria própria. Sem token novo.
- **`blue`/`cyan`/`green` como ícone ou texto sobre escuro** (`finance_visuals.dart:54`): o DS pede `*Ink`; contraste dos `*Ink` na LUME-78.
- **`ThemeData` sem `colorScheme`** (`app_theme.dart:17-45`): só `bg` entra em `scaffoldBackgroundColor`; para a LUME-23 e as tarefas de componente.

## Mapa de impacto (grep em `app/lib`)
- `AppColors` em 31 arquivos. **Só 2 nomes mudam:** `background` → `bg` (`app_theme.dart:21`, `module_menu_tile.dart:48`, `life_module_tile.dart:35`, `finance_visuals.dart:62`) e `topBar` → `topbar` (`app_top_bar.dart:21`).
- `AppPalette` em 12 arquivos: `cardForeground` → `cardFg` (`now_card.dart`, `credit_card_visual.dart`); `mint`/`purple`/`yellow` → `dataMint`/`dataPurple`/`dataYellow`; `red` sai (`finance_visuals.dart:56` usa `colors.danger`, a função passa a receber `AppColors`); `onCard` sai (`app_top_bar.dart:56` usa `onOrange`; `finance_visuals.dart:55` fica como pendência); `blue` muda de `#2F6BFF` para `#2b64f5`.
- Hex solto fora do tema (11): `dashboard_visuals.dart:8,14-21` → `AppPalette.goalObligatory` e `goal*`; `card_chip.dart:15,17` → constantes "sem token" em `AppPalette`.
- Testes: nenhum arquivo de `app/test` referencia `AppColors`, `AppPalette` nem `Color(0x`. **Estratégia: renomear tudo de uma vez**, sem camada de compatibilidade (o analyzer acusa qualquer nome esquecido).
- Fora do escopo: `Colors.white`/`Colors.black` (9 usos) → `scrim`, `onViolet` etc. mudam o visual (ex.: `barrierColor` de 25% para 60%); ficam como pendência para as tarefas de componente.

### Decisão 2: resíduos sem token
`badgeRed`, `badgeBlue`, `badgeNeutral`, `mastercardRed`, `mastercardYellow`, `chipGradient`, `onCard` (ícone Apple sobre fundo branco) e os dois cinzas do chip do cartão. **Não inventar token:** ficam em `app_palette.dart`, na seção "sem token no DS (pendência)", e entram em `docs/pendencias.md` para o `dev-designer`.

## Plano de despacho
QA da tarefa: `dev-qa-automacao` · Segurança: `não`

**Dimensionamento:** 3 agentes em 2 ondas. Um único implementador (`dev-frontend-arquitetura`) cuida dos dois arquivos de tema e dos 12 consumidores, porque tudo compila junto. O QA escreve os testes **em paralelo** (só precisa dos nomes do contrato e do `tokens.json`). O `dev-frontend-design` só confere o DS, para a revisão não ser de quem escreveu.

| # | Agente | Entrada | Saída esperada | Depende de | Caminhos exclusivos | ID do agente | Status |
|---|--------|---------|----------------|------------|---------------------|--------------|--------|
| 1 | dev-frontend-arquitetura | contratos + `tokens.json` | `AppColors` e `AppPalette` v2, consumidores migrados, hex fora, `ci app` verde | — | `app/lib/**` | | pendente |
| 2 | dev-qa-automacao | contratos + `tokens.json` | testes de valores, `copyWith`/`lerp` e contraste mínimo | — (paralelo ao 1) | `app/test/core/theme/app_colors_test.dart`, `app_palette_test.dart`, `contrast_test.dart`, `app/test/helpers/contrast.dart` | | pendente |
| 3 | dev-frontend-design | diff dos passos 1 e 2 | parecer `ds-fidelidade` e texto das pendências | 1, 2 | — | | pendente |

### Briefings

#### Passo 1 · dev-frontend-arquitetura
```json
{
  "tarefa": "LUME-68",
  "passo": 1,
  "objetivo": "Reescrever AppColors e AppPalette com os valores exatos do tokens.json e migrar os consumidores sem camada de compatibilidade",
  "contexto_minimo": ["docs/tarefas/LUME-68.contratos.md (todas as seções)", "docs/design-system/tokens.json (color.tokens)", "docs/design-system/flutter.md (Estrutura de tema)", "app/lib/core/theme/app_colors.dart", "app/lib/core/theme/app_palette.dart"],
  "contratos": ["AppColors (28 campos)", "AppPalette", "Renomeações", "Conversão de alpha", "Resíduos sem token"],
  "restricoes": ["copiar valores do tokens.json, nunca inventar", "alpha: #RRGGBBAA vira Color(0xAARRGGBB)", "um arquivo por classe", "AppPalette segue abstract final class com static const", "manter o comentário 'Provisório' no tema claro", "não migrar Colors.white/black nem aplicar surfaceGlass, hairline ou aurora nas telas", "token com alpha embutido não recebe withValues/withOpacity: now_card.dart:28 usa cardFgMuted", "borda violet, danger do café, blue como ícone e ThemeData ficam como estão (Decisão 3)", "não editar app/test nem docs", "comentários em PT-BR"],
  "pronto_quando": ["grep de hex solto vazio", "grep de nomes antigos vazio", "node scripts/dev/ci.mjs --resumo app verde (141 testes ou mais)"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-68.log.md",
  "limite_resposta": "até 150 palavras + lista de arquivos"
}
```

#### Passo 2 · dev-qa-automacao
```json
{
  "tarefa": "LUME-68",
  "passo": 2,
  "objetivo": "Provar que AppColors e AppPalette igualam o tokens.json e que o contraste mínimo de texto passa nos dois temas",
  "contexto_minimo": ["docs/tarefas/LUME-68.contratos.md#Testes", "docs/tarefas/LUME-68.md#Decisão 1: teste de contraste", "docs/design-system/tokens.json", "app/test/core/theme/app_motion_test.dart (estilo)"],
  "contratos": ["AppColors (28 campos)", "AppPalette", "Conversão de alpha"],
  "restricoes": ["não editar app/lib; defeito de código vai no relatório ao passo 1", "ler ../docs/design-system/tokens.json pelo cwd de app/ (Directory.current)", "o parser converte #RRGGBBAA em 0xAARRGGBB e tem teste próprio com scrim e hairline", "parser aceita String ou Map {dark, light}; arquivo ausente falha com mensagem clara, sem skip; não copiar o helper de app_motion_test.dart", "percorrer o JSON nos dois sentidos: 28 tokens temáticos e 28 campos", "não escrever golden nem matriz completa de contraste (LUME-78)", "helper contrast.dart com razão WCAG, reaproveitável"],
  "pronto_quando": ["app_colors_test cobre os 2 temas e copyWith/lerp", "app_palette_test cobre os fixos", "contrast_test passa com os 30 pares de texto e os fills on-*", "node scripts/dev/ci.mjs --resumo app verde"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-68.log.md",
  "limite_resposta": "até 150 palavras + lista de arquivos"
}
```

#### Passo 3 · dev-frontend-design
```json
{
  "tarefa": "LUME-68",
  "passo": 3,
  "objetivo": "Conferir o diff contra o DS v2 brasa (skill ds-fidelidade)",
  "contexto_minimo": ["git diff e arquivos não rastreados", "docs/design-system/tokens.json", "docs/design-system/README.md (seção Cor)", "docs/tarefas/LUME-68.contratos.md#Resíduos sem token"],
  "contratos": ["AppColors", "AppPalette"],
  "restricoes": ["não editar nada; devolver parecer", "divergência do DS vai como pendência explícita para dev-designer, não como bloqueio"],
  "pronto_quando": ["parecer Bloqueia / Recomendo / Observações e texto pronto para docs/pendencias.md"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-68.log.md",
  "limite_resposta": "até 150 palavras"
}
```

## Riscos e decisões em aberto
- **Hex em duas fontes:** `flutter.md:7` omite `surfaceGlass`, `surfaceTint`, `hairline`, `hairlineStrong`, `aurora1`, `aurora2`; `flutter.md:8` omite `ember`, `data*` e `goalObligatory`. **Vale o `tokens.json`.**
- **Contagem de testes desatualizada:** `perfil.md:38` e `flutter.md:48` dizem 110; a issue diz 141. Não bloqueia.
- **Nomes:** a issue e o `flutter.md` usam `bg`/`topbar`; o código usa `background`/`topBar`. Segue a issue.
- **Teste depende de `docs/`:** lê `../docs/design-system/tokens.json` a partir de `app/`. Se o DS mudar (`ORIGEM.md`), o teste acusa de propósito.
- **Prazo:** Sprint 1 vence em 17/11; estimativa de 5 h; cabe em 1 ciclo mais 1 rodada de correção.
- **Para o Jira:** comentar que o critério 3 fica mínimo aqui e completo na LUME-78.
