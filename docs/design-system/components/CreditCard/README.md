Cartão de crédito em deep navy (`.navy` do kit) que mostra o valor disponível, o limite, o final do cartão, um chip metálico e uma bandeira ilustrativa. É o elemento aceso da tela de Finanças: a única luz da tela.

## Quando usar

- No topo da tela de Finanças, para o cartão principal, de relance.
- Não use para listar vários cartões (use uma linha compacta com o selo em `TransactionRow`) nem para mostrar o número completo: só os quatro últimos dígitos.

## O que o consumidor fornece

- `CreditCardSummary`: `available` e `limit` (reais, inteiros), `cardLabel`, `card.lastDigits` e `card.brandMark` (círculos ou palavra).
- Opcional, o cabeçalho acima do cartão (`CardHeader`): `bankName`, `productName` e `title`, com `bool compact`.
- O rótulo semântico é montado pelo componente: "Cartão Aurora final 4821, disponível R$ 3.450 de R$ 5.000".

## Anatomia e medidas

- Proporção 330 por 200 (largura máxima 330; no desktop até 420 mantendo a proporção). Altura mínima 200, que cresce com a fonte do sistema.
- Fundo: `.navy` do kit, gradiente 135° `card-1` 0%, `card-2` 38%, `card-3` 72%, `card-4` 100%, hairline interna de 14% no topo, brilho `shadow-glow-card`, raio `radius-lg`. Um radial de `card-glow` a 45% no canto superior direito dá a luz. Padding `space-20`.
- Textos: disponível em `display` com `tabular-nums` (`card-fg`); "Limite de crédito" em `caption` `card-fg-muted`; limite em `title-sm`; rodapé "Aurora ····4821" em `body-sm` `card-fg-muted`. Valor e rodapé ganham reticências em vez de quebrar o cartão.
- Bandeira ilustrativa no canto superior direito: dois círculos de 22px em `card-fg` (90% e 45%, sobrepostos) ou uma palavra em itálico 800 de 16px. Nunca a marca real.
- Chip metálico à direita, um pouco abaixo do centro: 44 por 34, raio `radius-sm`, gradiente de três paradas em `ember` misturado com `card-fg` e `orange` (quente, metálico), hairline clara no topo, sombra curta; linhas de contato em traço de 1px.
- Cabeçalho: "Banco · Produto" em `body` (`text-primary`, separador em `text-secondary`) e título em `display` no celular e `display-lg` no desktop.

Hoje no Flutter: o cabeçalho usa 28 e 36 soltos, padding 22 e raio 16; o chip e a bandeira têm cores fixas. O DS usa `display`, `display-lg`, `space-20`, `radius-lg` e tokens.

## Estados

- Normal: único estado visual; o cartão não é interativo.
- Valor longo: reticências ou `FittedBox` no valor e no rodapé.
- Sem cartão cadastrado: não mostre o cartão; use `EmptyState` com "Adicionar cartão".

## Mobile e desktop

- Celular: ocupa a largura disponível até 330, cabeçalho em `display`.
- Desktop: cabeçalho em `display-lg`; o cartão fica ao lado de outros blocos na grade, sem esticar além de 420.

## Movimento

- O cartão é o elemento aceso: `.breathe` (brilho de 1 a 1,08 em `dur-breathe`). Nenhum outro elemento da tela brilha.
- Entrada da tela: chega na onda do hero (`.rise.hero`, 240ms). Reduzir movimento: sem respiração, só fade.

## Acessibilidade

- Contraste: `card-fg` sobre o gradiente mínimo 10,3:1; `card-fg-muted` mínimo 6,6:1, nos dois temas.
- Um único `Semantics` com o texto completo; chip e bandeira são decorativos.
- Nunca exiba o número completo nem o CVV.

## Faça e não faça

- Faça: `tabular-nums` nos valores.
- Faça: manter o texto branco em `card-fg` nos dois temas.
- Não faça: deep navy em botões ou fundos de tela; ele é do cartão e do card Agora.
- Não faça: bandeira ou chip como marca oficial.
- Não faça: mais que os quatro últimos dígitos.
