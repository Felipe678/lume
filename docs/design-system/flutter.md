# Como aplicar no Flutter

Este documento traduz os tokens para o código de `app/lib/core/theme`. Ele é um guia de aplicação: nada aqui altera o app até alguém implementar.

## Estrutura de tema

- `AppColors` (ThemeExtension) continua sendo a fonte das cores por tema. Acrescente os campos que faltam e renomeie para os nomes dos tokens: `bg`, `topbar`, `heroBand`, `surface`, `surfaceRaised`, `chip`, `iconTile`, `divider`, `ringTrack`, `barMuted`, `borderControl`, `scrim`, `textPrimary`, `textSecondary`, `textMuted`, `violetInk`, `cyanInk`, `orangeInk`, `greenInk`, `blueInk`, `danger`, `onDanger`.
- `AppPalette` guarda o que não muda com o tema: `violet`, `onViolet`, `cyan`, `onCyan`, `orange`, `onOrange`, `green`, `onGreen`, `blue`, as séries de dados, o gradiente da logo, o gradiente deep navy (`card1` a `card4`, `cardGlow`, `cardFg`, `cardFgMuted`, `cardBorder`) e as cores `goal*`.
- Crie `AppSpacing` (`s2`, `s4`, `s8`, `s12`, `s16`, `s20`, `s24`, `s32`, `s40`, `s48`, `s56`), `AppRadius` (`xs`, `sm`, `md`, `lg`, `xl`, `full`), `AppShadows` (`sm`, `md`, `lg`, `glowCard`, `glowRing`), `AppMotion` (durações e curvas) e `AppLayout` (os breakpoints e `touchMin`, `hitMin`). Todas como `abstract final class` com `static const`, no mesmo estilo de `AppPalette`.
- `AppTextStyles`: um `TextStyle` por estilo de tipo (`displayLg`, `display`, `headline`, `title`, `titleSm`, `body`, `bodySm`, `label`, `caption`, `overline`, `micro`, `metric`), ligado ao `textTheme` do `ThemeData` para que `Theme.of(context).textTheme` devolva a mesma escala.

## A linguagem "brasa" em widgets

- **Aurora:** um `DecoratedBox` atrás do `Scaffold` com dois `RadialGradient` (`aurora-1` em `Alignment(-0.85, -1)`, raio 0.6; `aurora-2` em `Alignment(1, 1)`, raio 0.5). Um só, no `AppPageScaffold`.
- **Card em camadas:** `Container` com `surface`, `radius-lg`, `boxShadow: AppShadows.elev1` (lista de 2 `BoxShadow`) e uma hairline desenhada como `Border(top: BorderSide(color: hairline))`. Não use `Card` do Material.
- **Vidro:** `ClipRRect` + `BackdropFilter(ImageFilter.blur(20, 20))` + `Container(color: surface-glass)`. Só em `ModulesMenu`, `Sheet`, `Toast` e `BottomNav`.
- **Ícone em tile:** `AppIconTile(icon, tone)` com `LinearGradient` vertical (cor a 100% → 88%) e hairline. Tons: neutro, violet, orange, cyan.
- **Glow e respiração:** `AnimatedBuilder` com um `AnimationController` de `dur-breathe` em `repeat(reverse: true)`, animando a opacidade do `BoxShadow` de 0.28 a 0.36. Pare o controller em `disableAnimations` e quando a atividade está pausada.
- **Barra que acende:** `CustomPainter` que pinta o trilho e o preenchimento, com um `ui.Gradient.linear` de `glow-head` no fim (orange → ember) e um `MaskFilter.blur` leve para o brilho.
- **Segmentos:** `Row` de `Expanded` com `AnimatedContainer`; feito = violet, atual = trilho + preenchimento laranja (`AnimatedFractionallySizedBox`), pendente = trilho.
- **Pulso:** `TweenAnimationBuilder` de 0 a 1 em `dur-pulse` com `ease-out-expo`, pintando um círculo com `strokeWidth` que cresce e opacidade que cai.
- **Mola:** `Curves.easeOutBack` é a tradução aproximada de `ease-spring`; para o botão use `AnimatedScale(scale: pressed ? 0.97 : 1, curve: pressed ? easeOutCubic : easeOutBack)`.

## Valores

| Token | Dart |
|---|---|
| `radius-xs` a `radius-xl` | 4, 8, 12, 16, 24 |
| `dur-instant`, `dur-fast`, `dur-exit`, `dur-base`, `dur-slow`, `dur-page` | `Duration(milliseconds: 80, 140, 160, 220, 360, 480)` |
| `ease-out`, `ease-in` | `Curves.easeOutCubic`, `Curves.easeInCubic` |
| `ease-settle` | `Cubic(0.16, 1, 0.3, 1)` |
| `bp-medium`, `bp-wide`, `content-max` | `600`, `1080`, `1048` (hoje só `Breakpoints.desktop` e `contentMaxWidth` existem) |

## Responsivo

- Troque o teste `constraints.maxWidth >= Breakpoints.desktop` de `AppPageScaffold` por uma enumeração `ScreenClass { compact, medium, wide }` calculada uma vez no scaffold e passada adiante (ou lida de um `InheritedWidget`).
- No `compact`, `ModulesMenuRoute` abre um `showModalBottomSheet`; no `medium` e `wide`, o painel ancorado atual. A `BottomNav` só aparece no `compact`.
- Alvos de toque: envolva controles menores que 48px em `ConstrainedBox(minWidth: AppLayout.touchMin, minHeight: AppLayout.touchMin)` no `compact`.

## Movimento

- Leia `MediaQuery.of(context).disableAnimations` uma vez na página; se verdadeiro, use `Duration.zero` ou o fade de `dur-instant` (veja "Movimento e animações").
- Anel e barras animam com `TweenAnimationBuilder` no primeiro frame da tela; atualizações posteriores interpolam em `dur-base`.
- Entrada da tela: `AnimatedSlide` + `AnimatedOpacity` por cartão com `Interval` de 40ms entre eles, no máximo 6.

## Testes

- Mantenha os testes atuais (110) e acrescente: um golden por componente nos dois temas e nas classes `compact`, `medium` e `wide`, com fonte a 1,3×.
- Um teste de contraste lê `AppColors.dark` e `AppColors.light` e falha se algum par de texto declarado nas notas de uso dos tokens ficar abaixo de 4,5:1.
