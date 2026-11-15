# LUME-68 · contratos

## AppColors (28 campos, por tema)
`app/lib/core/theme/app_colors.dart`: `ThemeExtension<AppColors>`; construtor privado, `dark`, `light`, `of`, `copyWith` e `lerp` com todos os campos. Mapa token → campo (valores dark e light vêm do `tokens.json`):

| Campo | Token | Campo | Token |
|---|---|---|---|
| `bg` | `bg` | `ringTrack` | `ring-track` |
| `topbar` | `topbar` | `barMuted` | `bar-muted` |
| `heroBand` | `hero-band` | `borderControl` | `border-control` |
| `surface` | `surface` | `scrim` | `scrim` |
| `surfaceRaised` | `surface-raised` | `aurora1` | `aurora-1` |
| `surfaceGlass` | `surface-glass` | `aurora2` | `aurora-2` |
| `surfaceTint` | `surface-tint` | `textPrimary` | `text-primary` |
| `chip` | `chip` | `textSecondary` | `text-secondary` |
| `iconTile` | `icon-tile` | `textMuted` | `text-muted` |
| `divider` | `divider` | `violetInk` | `violet-ink` |
| `hairline` | `hairline` | `cyanInk` | `cyan-ink` |
| `hairlineStrong` | `hairline-strong` | `orangeInk` | `orange-ink` |
| `danger` | `danger` | `greenInk` | `green-ink` |
| `onDanger` | `on-danger` | `blueInk` | `blue-ink` |

## AppPalette (fixo)
`abstract final class AppPalette` com `static const`:
- Marca e preenchimentos: `violet`, `onViolet`, `cyan`, `onCyan`, `orange`, `onOrange`, `ember`, `green`, `onGreen`, `blue`.
- Dados: `dataYellow`, `dataMint`, `dataPurple`.
- Logo: `brandFrom`, `brandTo`, e `brandGradient` montado com os dois.
- Cartão deep navy: `card1`, `card2`, `card3`, `card4`, `cardGlow`, `cardFg`, `cardFgMuted`, `cardBorder`. O `cardGradient` (paradas 0, 38, 72 e 100%) é montado com `card1` a `card4`.
- Objetivos: `goalAmber`, `goalSky`, `goalEmerald`, `goalRose`, `goalViolet`, `goalLime`, `goalCyan`, `goalFuchsia`, `goalObligatory`. `DashboardVisuals` passa a apontar para eles.

## Conversão de alpha
No `tokens.json`, `#RRGGBBAA` tem o alpha no fim. No Dart, `Color(0xAARRGGBB)` tem o alpha no início. Exemplos: `#00000099` vira `Color(0x99000000)`; `#ffffff0f` vira `Color(0x0FFFFFFF)`; `#ffffffb8` vira `Color(0xB8FFFFFF)`.

## Renomeações
`background` → `bg`; `topBar` → `topbar`; `cardForeground` → `cardFg`; `mint`, `purple`, `yellow` → `dataMint`, `dataPurple`, `dataYellow`; `red` sai (usa `colors.danger`); `onCard` sai (`app_top_bar` usa `onOrange`).

## Resíduos sem token
`badgeRed`, `badgeBlue`, `badgeNeutral`, `mastercardRed`, `mastercardYellow`, `chipGradient`, o ícone Apple sobre o fundo branco (hoje `onCard`) e os dois cinzas do chip do cartão. Ficam em `app_palette.dart`, numa seção "sem token no DS (pendência)". As constantes novas para o `card_chip.dart` e para o ícone Apple recebem nomes descritivos (ex.: `cardChipBorder`, `cardChipLine`).

## Testes
- **Parser:** `#RRGGBB[AA]` vira `Color` com alpha no início. Teste próprio com `scrim` e `hairline`.
- **Valores:** para cada token com `{dark, light}`, compara `AppColors.dark` e `AppColors.light`. Para cada token fixo, compara `AppPalette`.
- **Extension:** `copyWith()` sem argumentos é igual ao original; `lerp(other, 0)` é igual a `this` e `lerp(other, 1)` é igual a `other` em todos os 28 campos.
- **Contraste:** razão de luminância WCAG em `app/test/helpers/contrast.dart`. Mínimo 4,5:1, conforme a Decisão 1 do plano.
