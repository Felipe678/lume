Linha de transação com ícone em tile na cor da categoria, nome do estabelecimento, categoria e data, selo do cartão e valor tabular com sinal e palavra. Dentro de "Últimas transações" ela forma uma lista que se lê de relance.

## Quando usar

- Em listas de lançamentos: últimas transações do cartão, extrato de uma categoria.
- Não use para resumos por categoria (tile em `FinanceTiles`) nem para valores soltos sem data.

## O que o consumidor fornece

- `CardTransaction`: `merchant`, `date`, `amount`, `category` (define ícone e tom do tile) e `card` (`lastDigits`, `productName`); direção do valor (entrada ou saída).
- `bool compact`: no celular esconde o selo e o bloco do cartão.
- Opcional `VoidCallback? onTap` para abrir o detalhe.
- A seção `LastTransactionsSection` recebe a lista e mostra o vazio "Nenhuma transação ainda".

## Anatomia e medidas

- A lista fica dentro de um `.card` (`surface`, `radius-lg`, `elev-1`) com padding `space-16` (`space-20` no largo). Linhas com `radius-md`, altura mínima 56, padding `space-8` na vertical e `space-12` na horizontal, vão `space-12` entre as partes, `space-2` entre linhas.
- Ícone em `.ico-tile.sm` (32px, `radius-sm`, gradiente e hairline), ícone de 18px. Tom por categoria: `violet` (objetivos, assinaturas), `cyan` (saúde, entradas), `orange` (alimentação) ou neutro (o resto, ícone em `text-secondary`). No máximo três tiles coloridos seguidos; a cor é só apoio.
- Nome em `title-sm` (`text-primary`), uma linha com reticências. Categoria e data em `caption` com `text-muted`: "Alimentação · 08/11" no compacto, data completa no largo.
- Selo do cartão (só largo): `chip` com `radius-xs`, hairline, dois círculos ilustrativos de 10px em `text-secondary` e os quatro dígitos em `caption` tabular. Ao lado, "Cartão de crédito" e o nome do produto em `caption` `text-muted`.
- Valor à direita em `title-sm` `tabular-nums`, alinhado à direita, com "Entrada" ou "Saída" abaixo em `caption`. Entrada: `green-ink` com "+". Saída: `text-primary` com "−" (menos tipográfico). Formato "R$ 1.234,50".

Hoje no Flutter: ícone de 28 com raio 7, nome em 14, detalhes em 11, valor em 18 em `FittedBox` com larguras fixas de 112 e 124; o DS usa 32, `radius-sm`, `title-sm`, `caption` e largura que cresce com o conteúdo.

## Estados

- Normal: fundo transparente sobre `surface`.
- Hover (só `@media (hover: hover) and (pointer: fine)`, linha clicável): fundo `surface-raised` com hairline no topo.
- Pressionado: escala 0,98 em `dur-fast`; solta com `ease-spring`.
- Foco: anel de 2px `violet-ink`, afastado 2px.
- Sem `onTap`: linha só leitura, sem hover nem escala.
- Vazio: `.block` com tile neutro `receipt_long` e frase em `body-sm` `text-secondary` dizendo quando as transações aparecerão.

## Mobile e desktop

- Celular (compact): sem selo nem bloco do cartão; valor e palavra à direita em duas linhas; alvo de toque de 56px; sem hover, o retorno é o pressionado.
- Desktop (wide): selo e bloco do cartão visíveis; hover; seta e `Enter` abrem o detalhe; nome longo recebe reticências e nunca empurra o valor.

## Movimento

- Hover em `dur-instant` (cor) e `dur-fast` (hairline). Pressionar em `dur-fast` `ease-out`, soltar em `ease-spring`.
- A lista entra na segunda onda da tela (`.rise` com `--w:1`), não linha a linha.
- Reduzir movimento: sem escala nem mola.

## Acessibilidade

- Cada linha tem um único rótulo semântico: "Mercado Bom Preço, Alimentação, 8 de novembro, saída de 142 reais e 90 centavos".
- Sinal e palavra carregam o significado; `green-ink` só reforça e passa 4,5:1 sobre `surface` e `surface-raised` nos dois temas; `text-muted` também.
- Selo e tile são decorativos para leitores de tela.
- Alvo de toque de 56px no celular e `hit-min` no desktop.

## Faça e não faça

- Faça: sinal, palavra e valor juntos, com `tabular-nums` para a coluna alinhar.
- Faça: reticências no nome; o valor sempre visível.
- Não faça: pintar saída de vermelho; despesa não é falha.
- Não faça: encolher o valor até ficar ilegível; deixe a linha crescer.
- Não faça: todas as linhas com tile colorido; o neutro é o padrão.
