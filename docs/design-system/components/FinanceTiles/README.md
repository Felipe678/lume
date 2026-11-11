Conjunto de três peças de Finanças que resumem os gastos do mês: o tile de categoria em bloco com barra que acende, o chip de gasto recorrente e o card de tendência com mini-gráfico de cabeça luminosa.

## Quando usar

- Tile de categoria (`TopCategoryTile`): quanto uma categoria pesa no mês, em linha com outros tiles.
- Chip de gasto recorrente (`RecurringExpenseChip`): compromissos fixos (aluguel, internet) em forma compacta.
- Card de tendência (`SpendingTrendCard`): o ritmo dos gastos dia a dia e as principais categorias num só bloco.
- Não use o card de tendência para comparar com outras pessoas nem para pressionar; ele só informa.

## O que o consumidor fornece

- Tile: `CategorySpending` (`category`, `amount`), a fatia do mês (0 a 1) e o `tone` (`violet`, `cyan`, `orange` ou neutro).
- Chip: `RecurringExpense` (`label`, `amount`, `tone` do ponto).
- Card: `List<DailySpending>` (`day`, `amount`, `isToday`), `List<CategorySpending>` e `double monthOverMonthChange`. O texto-resumo é montado pelo componente.

## Anatomia e medidas

- Tile: `.block` do kit (`surface-raised`, `radius-md`, hairline) dentro de um `.card`; padding `space-16`, altura mínima 136. Ícone em `.ico-tile` (40px, `radius-md`) na cor da categoria: `orange` (alimentação), `violet` (assinaturas, objetivos), `cyan` (saúde) ou neutro (ícone em `text-secondary`). Nome em `body-sm` (`text-secondary`), valor em `title` `tabular-nums`, percentual em `caption` `text-muted`. Barra `.bar.lit` de 6px com `--g` na cor da categoria: trilho `ring-track`, preenchimento com cabeça luminosa (`glow-head`).
- Chip: `.chip` do kit (36px, `chip`, `radius-full`, hairline). Ponto de 8px, rótulo em `label` (reticências após 24 caracteres) e valor em `body-sm` peso 700 tabular. Entre chips, `space-8`.
- Card de tendência: `.card` (`surface`, `radius-lg`, `elev-1`), padding `space-20` (`space-24` no largo), título em `title`. Gráfico de 112px com base e linha de topo em `divider`, escala única de zero ao máximo (rótulo em `micro`), dias em `micro` `text-muted`. Barras em `violet` (`radius-xs` no topo), dias sem gasto relevante em `bar-muted`, hoje em `cyan` com cabeça luminosa (gradiente de `glow-head` para 60% de branco) e luz de 12px: a única luz do card, e o dia em `cyan-ink`. Abaixo: leitura do dia em `body-sm`, legenda em `caption`, resumo em `body-sm` e "Principais categorias do mês" em `title-sm` com os tiles.

Hoje no Flutter: o card usa padding 26, raio 24 e sombra própria; o DS usa `space-20`/`space-24`, `radius-lg` e `elev-1`. O tile usa padding 14 e raio 12, com o logo de uma marca sobre branco; o DS usa ícone genérico em `.ico-tile`. O chip tem 34 de altura e ponto de 6; o DS usa 36 e 8.

## Estados

- Normal: como descrito.
- Hover (só `@media (hover: hover) and (pointer: fine)`, tile): sobe 2px e passa a `elev-2`.
- Barra selecionada (toque, clique ou teclado): contorno em `text-primary` e valor do dia na linha de leitura.
- Foco: anel de 2px `violet-ink` na coluna da barra.
- Vazio: sem gastos no período, o gráfico some e entra "Sem gastos no período. Quando você registrar um gasto, a tendência aparece aqui."
- Carregando: `.skel` na mesma forma (raio e altura).

## Mobile e desktop

- Celular: gráfico na largura toda do card, tiles em duas colunas; sem hover, o equivalente é tocar na barra e ler o valor abaixo.
- Desktop: card de até 560; três tiles numa linha; hover nos tiles e nas barras; setas esquerda e direita percorrem as barras.

## Movimento

- Barras crescem da base em `dur-slow` com `ease-settle`, 30ms entre barras, só na primeira exibição. A barra de hoje já nasce acesa, sem animar. A barra de categoria acende em `dur-slow`.
- Hover do tile em `dur-fast`, `ease-out`.
- Reduzir movimento: barras e preenchimentos aparecem já no valor final, sem subida de 2px.

## Acessibilidade

- O gráfico nunca depende só da cor: há o texto-resumo e a leitura do valor de cada dia; cada barra é um botão com rótulo "Dia 8: R$ 210,00". Hoje também tem legenda.
- Tile com rótulo único ("Alimentação: R$ 640, 38% dos gastos do mês"); chip lido como "Aluguel R$ 1.800".
- Contraste: `text-secondary` e `text-muted` sobre `surface` e `surface-raised` acima de 4,5:1; barras têm pelo menos 3:1 sobre o fundo (não são texto); `data-*` e `cyan` nunca como texto.
- Colunas do gráfico com 112px de altura; no celular a área de toque tem pelo menos 48px.

## Faça e não faça

- Faça: escala única do zero ao máximo, para a altura das barras ser honesta.
- Faça: a variação do mês em palavras, em tom neutro.
- Faça: legenda sempre ao lado das cores.
- Não faça: aumento de gasto em vermelho nem setas de alerta.
- Não faça: mais de uma barra acesa; só hoje tem luz.
