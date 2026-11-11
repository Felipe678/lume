O painel em glass que sobe da borda inferior no celular (a versão compact do menu de módulos e a base dos formulários), com o Diálogo centralizado como variante para confirmações curtas. Adição do Design System: o app não tem sheet nem diálogo padronizados hoje, e o menu de módulos no celular, os formulários e as confirmações das telas novas dependem deles.

## Quando usar
- **Sheet**: na classe compact, para escolher um módulo (`ModulesMenu`), preencher um formulário curto ou ver detalhes de um item, sem sair da tela.
- **Diálogo**: para uma pergunta curta com duas respostas ("Arquivar objetivo?"), em qualquer classe de largura.
- Em medium e wide o menu de módulos é o painel ancorado, não o sheet. Formulários longos viram tela própria, não sheet.
- Não empilhe um sheet sobre outro, nem abra um diálogo sobre um diálogo.

## O que o consumidor fornece
- `Widget child`: o conteúdo do sheet (cabeçalho, corpo rolável) e, se houver, as ações no fim.
- `String semanticLabel`: o nome do painel, lido ao abrir ("Módulos").
- Para o Diálogo: `title` (`title-sm`), `message` (`body-sm`) e até duas ações (`Widget`), a principal à direita.
- Fechamento controlado pelo chamador (`Navigator.pop`); `bool dismissible` (padrão verdadeiro) permite fechar por véu, arrastar e `Esc`. Confirmações destrutivas ou de perda de dados podem travar o véu e deixar só os botões.
- Usar `showModalBottomSheet` e `showDialog` com as transições abaixo.

## Anatomia e medidas
- **Sheet**: classe `glass` do kit (`surface-glass` a 80%, `backdrop-filter: blur(blur-glass) saturate(140%)`, `elev-3`, hairline-strong no topo), cantos superiores `radius-xl` (24), sem borda, largura total da tela, altura pelo conteúdo até 88% da tela (rola por dentro). O conteúdo da página aparece desfocado por trás.
- Alça de arrasto: barra de 36 por 4, `radius-full`, cor `border-control`, centralizada, dentro de uma área de 48 de altura (alvo de arrasto). À direita, botão Fechar de 48 (`text-secondary`).
- Corpo: margem lateral `space-16` (`page-pad-compact`), padding inferior `space-24` mais o inset da área segura. Título em `title-sm`, apoio em `body-sm` `text-secondary`.
- Blocos do menu dentro do sheet: `block` do kit (`surface-raised`, `radius-md`, hairline), padding `space-12`, altura mínima 96, ícone em `ico-tile sm` (8). Raios concêntricos: 24 → 12 → 8.
- Atrás: `scrim` cobrindo a tela toda, inclusive a `BottomNav`.
- **Diálogo**: `glass`, `radius-xl`, padding `space-24`, largura até 320 (menos `space-16` de cada lado em tela estreita), centralizado. Título `title-sm` `text-primary`, mensagem `body-sm` `text-secondary`, vão `space-12`, ações a `space-8` do texto, lado a lado, cada uma com altura mínima 48 (`btn secondary` e `btn primary` do kit).

## Estados
- **Fechado**, **aberto** e **arrastando** (o sheet acompanha o dedo, só para baixo).
- Botões e blocos dentro seguem seus próprios estados (normal, hover só com ponteiro fino, pressionado com mola, foco, desabilitado).
- Foco: anel de 2 `violet-ink`. Ao abrir, o foco vai ao botão Fechar do sheet ou à ação segura do diálogo ("Manter"); ao fechar, volta ao elemento que abriu.
- Carregando: o corpo mostra esqueleto (`skel`) no formato do conteúdo; o sheet já abre na altura final. Erro: mensagem no corpo com a ação "Tentar de novo".
- Ação principal desabilitada: 40% de opacidade, com o motivo em `caption` perto do botão.

## Mobile e desktop
- Compact: sheet pela borda inferior, ao alcance do polegar; diálogo centralizado.
- Medium e wide: diálogo centralizado; o menu de módulos usa painel ancorado. Um formulário curto pode usar sheet lateral ou diálogo, nunca sheet inferior em tela larga.
- Respeita a área segura: o padding inferior soma o inset da barra de gestos.

## Movimento
- **Sheet** abre em `dur-base` com `ease-out-quint`, subindo da borda inferior (translateY de 100% a 0) com o `scrim` aparecendo; fecha em `dur-exit` com `ease-in` (20% mais curto).
- **Diálogo** abre em `dur-base` com `ease-out-quint` (fade e escala de 0,96 a 1) e fecha em `dur-exit` com `ease-in`.
- Arrastar para baixo acompanha o dedo sem transição; ao soltar, fecha se passou de 30% da altura ou se o gesto foi rápido (em `dur-exit`); senão volta ao lugar.
- Reduzir movimento: sem deslocamento nem escala, só fade de no máximo `dur-instant`. O arrastar continua funcionando.

## Acessibilidade
- Papel de diálogo modal com rótulo; o diálogo de confirmação usa o papel de alerta, com título e mensagem associados.
- O foco fica preso no painel enquanto aberto; o conteúdo atrás fica inerte.
- `Esc` fecha o sheet e o diálogo; toque no `scrim` também (quando fechável). Arrastar é atalho: sempre existe o botão Fechar de 48.
- Contraste: `text-primary`, `text-secondary` e `text-muted` sobre `surface-glass` (80% sobre conteúdo desfocado e escurecido pelo `scrim`) ficam acima de 4,5:1 nos dois temas; a alça em `border-control` passa 3:1.
- Alvos de 48 em tudo que se toca.

## Faça e não faça
- Faça: título curto, uma ação principal e uma saída clara ("Manter" ao lado de "Arquivar").
- Faça: texto de ação que diz o que acontece ("Arquivar", não "OK").
- Não use vermelho nem tom de alarme numa confirmação rotineira; reserve `danger` para ações destrutivas de fato.
- Não esconda o botão Fechar atrás do gesto de arrastar.
- Não use glass em superfícies que não flutuam, nem coloque conteúdo que role na horizontal dentro do sheet.
