O RhythmCard mostra, em barras, as horas dedicadas nos últimos 14 dias, com o dia de hoje aceso em cyan e uma frase que resume a semana.

## Quando usar

- No dashboard, para mostrar o ritmo de dedicação a rotinas e objetivos ao longo de duas semanas.
- Não use para comparar com outras pessoas, para metas diárias com cobrança, nem para séries financeiras (essas têm legenda própria e cores `data-*`).

## O que o consumidor fornece

- `List<DailyEffort> effort`: um item por dia, com `date` e `hours` (valor de 0 em diante). Em geral 14 itens.
- `DateTime now`: define qual barra é "hoje" e quais são os últimos 7 dias.
- O `BarChart` (em `core/widgets`) recebe `List<BarChartEntry>` com `label` (número do dia), `value`, `color`, `labelColor`, `glow` e `tooltip` ("09/11: 2 h 30"), mais `emptyMessage`.
- A frase de resumo vem de `EffortComparison` (horas dos últimos 7 dias contra os 7 anteriores).

## Anatomia e medidas

- Card: classe `card` do kit: `surface`, raio `radius-lg`, elevação `elev-1` (hairline interna no topo mais sombra curta e média), sem borda sólida. Padding `space-24` (`space-16` no celular). Largura de 522 no desktop. Título "Ritmo da semana" em `title`, `space-16` até o gráfico.
- Gráfico: 165 de altura, 4 divisões com linhas de 1px em `divider`, com folga de 20% acima do maior valor, arredondada para que cada divisão seja um número inteiro de horas (0, 1, 2, 3, 4 h).
- Eixo Y e eixo X em `micro` com `text-muted`; no eixo X, o número do dia. O dia de hoje fica em `cyan-ink` e peso 700.
- Barras: largura de 60% da faixa, no máximo 18, topo com `radius-xs`.
  - Hoje: `cyan`, aceso com `glow-cyan` (anel de 1px a 35% e brilho de 32px a 30%). É o único elemento aceso do card.
  - Os 6 dias recentes antes de hoje: `violet` cheio.
  - Os 7 dias anteriores: `bar-muted`.
- Leitura do dia selecionado em `body-sm` e `text-primary` ("09/11 (hoje): 2 h 30"). Resumo em `body-sm` e `text-secondary`.
- Legenda em `caption` com `text-secondary` e uma amostra de cor de 12px (`radius-xs`) antes de cada palavra: Hoje, Últimos 7 dias, 7 dias anteriores.
- Na Visão geral desktop o card ocupa 7 das 12 colunas, ao lado de "Frentes da vida"; o resumo fica rente ao rodapé do card quando a linha é mais alta que o gráfico.

Hoje no Flutter: o destaque de hoje já é `cyan` e os 7 dias recentes `violet` cheio, e os anteriores `bar-muted` (mantido). Mudam: o card tem raio 24, padding 26, borda e sombra preta (vira `card`: `radius-lg`, `space-24`, `elev-1`); o eixo usa 11 (vira `micro`, 10) e passa a existir legenda e resumo em texto.

## Estados

- Normal: barras nos valores do dia.
- Hover (só com ponteiro fino): a barra clareia e a leitura mostra o dia sob o ponteiro. Pressionado e toque: a barra fica selecionada, com contorno de 2px em `text-primary`, e a leitura é atualizada.
- Foco: cada barra é um botão com o anel `violet-ink` de 2px; as setas esquerda e direita andam entre os dias.
- Desabilitado: não se aplica.
- Carregando: esqueleto (`skel`) na altura do gráfico (165).
- Vazio: "Sem registros de dedicação ainda", centralizado num `block` da mesma altura do gráfico, sem eixo nem legenda.
- Erro: mostre "Não foi possível carregar o ritmo agora." com a ação "Tentar de novo", na mesma altura.

## Mobile e desktop

- Celular: largura da página, padding `space-16`, 14 barras mais estreitas (cerca de 12px). A legenda quebra em duas linhas se precisar.
- Desktop: 522 de largura (7 colunas), barras de até 18px.
- Nunca rolagem horizontal: o gráfico encolhe, o texto quebra.

## Movimento

- Na primeira exibição, as barras crescem da base em `dur-slow` com `ease-settle`, 30 ms entre elas, depois que o card chegou na segunda onda da entrada. O glow de hoje não anima.
- Reduzir movimento: as barras aparecem já na altura final.

## Acessibilidade

- A cor nunca é o único canal: a legenda nomeia as três cores, a leitura mostra o valor por extenso e a frase resume a semana em texto.
- Cada barra tem rótulo próprio ("09/11 (hoje): 2 h 30") e é alcançável por Tab; a leitura é anunciada com `aria-live="polite"`.
- `micro` fica só nos eixos: informação essencial vive em `body-sm` e `caption`, sobre `text-muted` e `text-secondary` com 4,5:1 ou mais.
- No celular o alvo de cada barra é a faixa inteira do dia, ao menos 24px de largura útil; a leitura em texto é a alternativa quando o toque preciso é difícil.

## Faça e não faça

- Faça: mantenha a frase de resumo gentil ("Constância vale mais que intensidade.") quando o ritmo cai.
- Faça: arredonde o teto do eixo para um número inteiro de horas por divisão.
- Faça: acenda só a barra de hoje; o resto é preenchimento chapado.
- Não faça: nenhuma cor de alerta, seta para baixo ou comparação com meta quando a semana foi mais curta.
- Não faça: não anime as barras de novo a cada abertura nem a cada troca de dia selecionado.
