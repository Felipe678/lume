O MetricRing é o anel de progresso com número no centro e uma cabeça luminosa na ponta do arco; três deles, lado a lado, formam os anéis do dia sob a saudação.

## Quando usar

- Para uma única proporção de 0 a 100% que se lê de relance: blocos do dia, dias da semana, etapas de objetivos.
- Os três papéis de cor são fixos: `violet` = blocos do dia, `cyan` = dias na semana, `orange` = etapas dos objetivos. Não troque, não crie um quarto anel.
- Não use para séries no tempo (use o `RhythmCard`) nem para valores sem teto natural.

## O que o consumidor fornece

- `double progress` de 0 a 1 (valores fora disso são limitados).
- `String centerLabel`: o texto curto do centro ("60%", "5/7").
- `Color accent`: a cor de preenchimento do papel (`violet`, `cyan` ou `orange`).
- `double size`: diâmetro. Medidas do DS: 88 no celular, 104 no desktop; 64 só em espaço apertado.
- `bool lit`: marca o anel em andamento (o do dia, "Blocos hoje"); só ele tem glow. Um por grupo.
- O `RingStatTile` acrescenta `String value` ("3 de 5") e `String label` ("Blocos hoje") e escolhe o layout com `bool compact`. O `DayRings` monta os três tiles; o `DayHeader` recebe `userName`, `now` e `compact`.

## Anatomia e medidas

- Disco com interior `hero-band`, preenchido, com hairline interna no topo (`hairline`).
- Trilho `ring-track`; arco na cor de acento, ponta arredondada, começando no topo e girando no sentido horário. Espessura 7 (64 e 88px) e 8 (104px).
- Cabeça luminosa: os últimos `glow-head` (24px) do arco recebem um gradiente da cor do acento até a cor misturada com 45% de branco, desenhado em SVG (segundo arco curto com `linearGradient` no fim). No Flutter, um `SweepGradient` curto no final do `CustomPainter`.
- Glow só no anel aceso (`lit`): `glow-violet` no disco e um brilho de 6px da mesma cor na cabeça. Os outros dois anéis não têm sombra.
- Rótulo central em `metric` (20/24, peso 700) com números tabulares, em `text-primary`.
- Tile compacto: anel, `title` com o valor ("3 de 5") e `body-sm` em `text-secondary` com o nome ("Blocos hoje"), centralizados, 12 de vão. Três colunas iguais com vão `space-8`.
- Tile largo: anel à esquerda e texto à direita, 12 de vão, 220 de largura; entre tiles, `space-40` na horizontal e `space-24` na vertical. Na Visão geral desktop, onde a coluna é estreita, os três tiles ficam em coluna (texto embaixo) com `space-40` entre eles.
- DayHeader: dia por extenso em `body-sm` e `text-secondary`, saudação "Boa tarde, Felipe" em `display` (celular) ou `display-lg` (desktop), e o rótulo "Seu dia" em `title-sm` `text-secondary` acima dos anéis, tudo sobre a faixa `hero-band` com hairline inferior.

Hoje no Flutter: anel de 64 (celular) e 72 (desktop), sem cabeça luminosa, brilho em todos os anéis, rótulo de 18 ou 16 em peso 600, e "Seu dia" em 28 ou 36 como título.

## Estados

- Normal: arco e rótulo no valor atual.
- 0%: só o trilho, sem ponto de arco nem cabeça. 100%: círculo completo, sem cabeça (não há ponta).
- Aceso (`lit`): glow no disco e na cabeça; só o anel em andamento.
- Hover, pressionado e foco: o anel não é controle. Se o tile virar atalho, ele ganha hover (`dur-instant`), escala 0,98 ao pressionar e anel de foco `violet-ink` de 2px com 2px de afastamento.
- Carregando: anel só com o trilho e o rótulo substituído por traço, com o pulso do esqueleto.
- Vazio e erro: sem dados, mostre 0% e o texto "0 de 0"; nunca esconda o anel.

## Mobile e desktop

- Celular: três anéis de 88px em três colunas, tile em coluna e rótulo embaixo; nenhum texto é cortado, o nome do tile quebra em duas linhas se precisar.
- Tablet e desktop: anéis de 104px; texto ao lado quando a linha comporta 3 × 220, senão em coluna.
- O DayHeader usa `display-lg` só no desktop.

## Movimento

- Primeira exibição da tela: o arco e a cabeça preenchem juntos de 0 ao valor em `dur-slow` com `ease-settle`, começando quando o hero termina de acender (240 ms).
- Atualizações depois disso interpolam em `dur-base`; o número do centro só conta quando o valor muda.
- Reduzir movimento: o anel aparece já no valor final, sem contagem.

## Acessibilidade

- Cada tile é lido como um só item: "Blocos hoje: 3 de 5, 60%". O anel em si é decorativo.
- Cor e glow nunca carregam o significado: todo anel traz valor e nome em texto ao lado ou embaixo.
- `text-primary` sobre `hero-band` e `text-secondary` sobre `hero-band` passam 4,5:1 nos dois temas; o arco colorido é preenchimento, não texto.
- Tile sem ação: nada recebe foco. Com ação, o alvo de toque tem `touch-min` (48px) e o foco aparece com `violet-ink`.

## Faça e não faça

- Faça: mantenha valor e nome em texto junto de cada anel.
- Faça: use o mesmo `size` nos três anéis da mesma linha e acenda só um.
- Faça: anime o preenchimento só na primeira exibição.
- Não faça: nenhuma cor nova nem inversão dos papéis (`violet`, `cyan`, `orange`).
- Não faça: nenhum aviso vermelho nem texto "meta não atingida" quando o anel está baixo.
