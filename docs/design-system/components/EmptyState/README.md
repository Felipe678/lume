O EmptyState diz o que aparecerá em um espaço sem dados e o próximo passo para começar, com um ícone em tile grande, um título, uma frase curta e, no máximo, uma ação. Adição do Design System: hoje cada seção escreve o texto vazio solto; a regra de estados (carregando, vazio, erro, preenchido) e as telas da E1 precisam de um componente único, com o esqueleto de carregamento no mesmo lugar.

## Quando usar

- Quando uma lista, um card ou um módulo não tem dados ainda: "Sem rotina hoje", "Nenhum objetivo ativo", módulo "Em breve · E2".
- Use o esqueleto (`.skel`) enquanto os dados carregam, na forma do conteúdo final.
- Não use para erro de rede (mensagem com "Tentar de novo") nem como tela de boas-vindas.

## O que o consumidor fornece

- `IconData icon`: um ícone Material Rounded que lembra o conteúdo ausente.
- `tone`: neutro, `violet`, `orange` ou `cyan` para o tile. Neutro é o padrão; a cor é só apoio.
- `String title`: curto, em caixa de frase, sem culpa ("Sem rotina hoje").
- `String message`: uma ou duas frases com o próximo passo.
- `String? actionLabel`, `VoidCallback? onAction` e `actionVariant` (primário, secundário ou fantasma).
- `Widget? badge` opcional para o selo "Em breve · E2".
- `bool inline`: layout em linha (tile ao lado, texto à esquerda) para cards largos.
- O esqueleto é um widget à parte, `SkeletonBox`, com `width`, `height` e `radius`; o consumidor monta a forma do conteúdo.

## Anatomia e medidas

- Centralizado: coluna com padding `space-24` na vertical e `space-16` na horizontal, vão `space-12`.
- Ícone em `.ico-tile` grande: 56 por 56, raio `radius-lg`, gradiente vertical sutil e hairline-strong no topo (como o kit), ícone de 28px. Tile neutro: ícone em `text-secondary`. Tile colorido (`violet`, `orange`, `cyan`): ícone em `on-*`, com luz suave da própria cor. Um tile colorido por tela no máximo.
- Título em `title-sm`, `text-primary`. Texto em `body-sm`, `text-secondary`, até 40 caracteres de largura.
- Ação: `Button` primário, secundário ou fantasma, 44px (48 de toque no celular), com vão `space-4` extra acima.
- Em linha: tile de 56 ao lado, texto à esquerda, vão `space-16`, ação fantasma à direita.
- Selo "Em breve · E2": `caption`, `text-secondary`, fundo `chip`, `radius-xs`, hairline, ao lado do título.
- Esqueleto: `.skel` do kit (gradiente `surface-raised` e `chip` que corre em 1,6s), com o mesmo raio e a mesma altura do conteúdo real: `radius-xs` em textos, `radius-full` em mini-segmentos, `radius-lg` em cards. A linha de atividade tem 56 de altura.

## Estados

- Normal: tile, título e texto; a ação aparece só quando há um caminho útil.
- A ação herda os estados do `Button` (hover só com mouse, pressionado com mola, foco em anel, desabilitado a 40% com o motivo no texto).
- Carregando: esqueleto, `aria-busy` no contêiner.
- Vazio: este é o componente. Erro: não é deste componente; use texto com "Tentar de novo".

## Mobile e desktop

- Celular: centralizado, margem lateral de `space-16`, ação com 48px de altura, largura total quando for a ação da tela.
- Desktop: centralizado em painéis, ou em linha dentro de cards largos; ação com 44px e hover.
- O texto quebra dentro do container; nada rola na horizontal.

## Movimento

- O vazio não anima por conta própria: chega com a onda de entrada do card em que está.
- Esqueleto: brilho que corre em 1,6s, `ease-in-out`, em loop. É um dos dois loops permitidos (o outro é a respiração do elemento aceso).
- Reduzir movimento: o esqueleto fica estático.

## Acessibilidade

- O ícone é decorativo (`aria-hidden`); título e texto carregam o sentido.
- O esqueleto tem papel de status e rótulo ("Carregando atividades"); o contêiner usa `aria-busy="true"` até os dados chegarem.
- `text-primary`, `text-secondary` sobre `surface` e `on-violet`, `on-orange`, `on-cyan` sobre os tiles passam 4,5:1 nos dois temas.
- A ação é um botão nativo, alcançável por Tab e ativado com Enter ou Espaço.

## Faça e não faça

- Faça: explique o que aparecerá e como começar, em frases curtas e no tom de um parceiro calmo.
- Faça: ofereça uma única ação, no máximo.
- Faça: dê ao esqueleto a mesma forma e altura do conteúdo para a tela não pular.
- Não faça: texto de culpa ("Você ainda não...") nem emoji decorativo.
- Não faça: spinner sozinho em tela cheia no lugar do esqueleto; tile colorido em todo vazio da tela.
