Anel fino do passo em andamento, com a ponta acesa em ember e o tempo restante do passo em 72px tabular no centro; o tempo da atividade aparece só como rodapé discreto. Adição do Design System: o Modo Foco mostra dois tempos (passo e atividade) e precisa que apenas um deles seja o protagonista.

## Quando usar

- No centro do Modo Foco (desktop e celular), um por tela: é o elemento aceso da tela.
- Não use em cards de lista, no dashboard ou em diálogos; fora do Foco o tempo é texto ("40 min") ou `MetricRing`.
- Não use para tempo da atividade: ele fica no rodapé em `caption` `text-secondary` ("32 min restantes na atividade · termina 15:00").

## O que o consumidor fornece

- `Duration remaining` do passo (pode ser negativa quando passou do tempo) e `Duration estimate` do passo.
- `Duration activityRemaining` e `DateTime activityEnd` para o rodapé.
- `bool paused`.
- `String? label` abaixo do número (padrão "restantes neste passo"; "Pausado" quando pausado; "além dos 10 min estimados" quando passou).
- `bool compact` para o celular (anel 176px, número 56px).
- Em Flutter: `CustomPainter` para o anel ou dois `CircularProgressIndicator` sobrepostos; o número em `Text` com `FontFeature.tabularFigures()`.

## Anatomia e medidas

- Anel de 220px (232px na tela do Foco; 176px no celular), traço de 7px (`--stroke`), três círculos SVG com `pathLength="100"`: trilho em `ring-track`; arco em `orange` com `stroke-dasharray: p 100` e pontas arredondadas; cabeça de 24px (`glow-head`, cerca de 3,5% da circunferência) em `ember` com um filtro de desfoque leve (feGaussianBlur 4) que faz o brilho.
- Número: 72px / 76px, peso 800, tracking -2px, `tabular-nums`, `text-primary`. Celular: 56px / 60px, tracking -1,5px. Quando passou do tempo: 56px (44px no celular) para "+02:10" caber no anel.
- Legenda sob o número: `body-sm` (celular `caption`) em `text-secondary`.
- Rodapé: `caption` `text-secondary`, tabular, centralizado, 16px abaixo do anel.
- Nada de fundo sólido atrás do anel: ele fica direto na `.aurora`; na tela do Foco há um radial local de `orange` a 6% atrás (a brasa).
- Raio: o anel é `radius-full`; o número não tem container.

## Estados

- Em andamento: `.breathe` no anel (brilho oscila em `dur-breathe`), cabeça acesa.
- Pausado: `.breathe` sai, a cabeça perde o filtro e vira `orange` plano, o número passa a `text-secondary`, a legenda vira "Pausado" com ícone `pause` de 16px.
- Passou do tempo: arco completo em `orange` estável, cabeça oculta, número "+02:10" em `text-secondary`, legenda "além dos 10 min estimados". Sem `danger`, sem piscar.
- Reiniciando (troca de passo): o arco volta a 0, o número troca por cross-fade e o arco começa a preencher o novo passo.
- Carregando: `.skel` circular do mesmo tamanho.

## Mobile e desktop

- Celular (compact): `compact` com 176px e número 56px; o anel fica logo abaixo do título e acima da linha de pontos; o rodapé da atividade vem antes do CTA fixo.
- Desktop (wide): 220 a 232px, centralizado na coluna de conteúdo; as duas ações ficam a 24px abaixo.
- Fonte do sistema maior: o número encolhe por `FittedBox` até caber dentro do anel; nunca estoura.

## Movimento

- Primeira exibição: o arco preenche de 0 ao valor em `dur-slow`, `ease-settle`. Depois atualiza a cada segundo sem transição perceptível.
- Troca de passo: `stroke-dasharray` vai a 0 em `dur-base`, `ease-in-out`; o anel dá um leve impulso de escala (0,96 → 1) em `ease-spring`; o número sai subindo 8px (`dur-fast`, `ease-in`) e o novo entra de baixo (`dur-fast`, `ease-out`). 200ms depois o arco começa a preencher com `ease-settle`.
- Respiração: só em andamento, `dur-breathe`; para quando pausado, quando passou do tempo e em reduzir movimento.
- Reduzir movimento: sem respiração, sem mola, cross-fade vira troca direta; o arco aparece já no valor.

## Acessibilidade

- O centro é `role="timer"` com `aria-live="off"` (não anunciar a cada segundo) e `aria-label` legível ("6 minutos e 40 segundos restantes do passo"); mudanças de estado (pausado, passou do tempo) são anunciadas uma vez via `aria-live="polite"` em região separada.
- Contraste: `text-primary` e `text-secondary` sobre `bg` passam 4,5:1; `orange` sobre `bg` como gráfico passa 3:1 nos dois temas; a legenda textual acompanha sempre.
- O anel não é alvo de toque; as ações ficam nos botões abaixo.
- Em Flutter: `Semantics(liveRegion: false, label: ...)` no anel e `ExcludeSemantics` no SVG decorativo.

## Faça e não faça

- Faça: um anel por tela e só o tempo do passo dentro dele.
- Faça: tempo da atividade em rodapé `text-secondary`, nunca em um segundo anel.
- Faça: passou do tempo em laranja estável e número em `text-secondary`.
- Não faça: anel vermelho, pulsante ou com segundos piscando; não use som nem vibração ao zerar.
- Não faça: colocar o anel sobre um card com fundo; ele vive na aurora.
