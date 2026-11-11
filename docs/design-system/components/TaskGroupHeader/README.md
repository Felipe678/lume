O TaskGroupHeader é o cabeçalho de um grupo de atividades ("Cotidianas", "De objetivos") no painel do dia: nome, contagem do que foi feito, barra fina do grupo, ação "Nova" discreta e chevron para recolher. Adição do Design System: o brief pede os dois tipos de atividade no mesmo lugar, separados por grupos com progresso; hoje a lista de atividades do app não tem grupos.

## Quando usar

- Acima de cada grupo de `TaskRow` na tela "Tempo e objetivos", desktop e celular. Sempre em pares: um grupo "Cotidianas" e um "De objetivos", nessa ordem, mesmo que um deles esteja vazio.
- Não use como título de seção da página (use `SectionTitle`) nem dentro do Foco.

## O que o consumidor fornece

- `String name` ("Cotidianas" ou "De objetivos").
- `int done`, `int total` e, opcional, `int inProgress` (vira o sufixo "· 1 agora").
- `bool expanded` e `ValueChanged<bool> onToggle`.
- `VoidCallback onNew`: cria uma atividade já com o tipo do grupo.
- `Widget child`: a lista de `TaskRow` do grupo, que o cabeçalho mostra ou esconde.

## Anatomia e medidas

- Linha flexível com vão `space-12`, altura mínima 44 px, padding `space-4` (esquerda `space-8`), raio `radius-md`. Entre grupos, `space-8`.
- Botão de recolher: chevron `expand_more` de 20 px em `text-secondary` seguido do nome em `title-sm`; área de 36 px com raio `radius-sm`, hover em `surface-raised`. O chevron gira -90° quando recolhido.
- Contagem em `caption`, `text-secondary`, números tabulares: "1 de 3 feitas", "0 de 4 feitas · 1 agora". Com tudo feito, ganha `check_circle` em `violet-ink`.
- Barra `.bar` de 4 px e 96 px de largura, trilho `ring-track`, preenchimento `violet` (o papel de "blocos do dia"). É progresso do grupo, não de objetivo, por isso não é laranja e não tem glow.
- "Nova": `.btn.ghost.sm` em `text-secondary` com `add` em `violet-ink`, alinhado à direita (`margin-left: auto`). Hover em `violet-ink` sobre fundo violeta a 10%.
- Linhas do grupo ficam num `.card` comum com padding `space-8`; o cabeçalho não tem fundo próprio.

## Estados

- Expandido (padrão) e recolhido (`aria-expanded`); recolhido esconde a lista e o chevron aponta para a direita.
- Nada feito: "0 de 4 feitas", barra vazia. É só um número; sem cor de alerta.
- Tudo feito: check em `violet-ink` e barra cheia.
- Grupo vazio: contagem "nenhuma hoje" e o `child` mostra uma linha de convite ("Adicionar cotidiana") em vez de lista vazia.
- Hover (só mouse) no botão de recolher e em "Nova". Foco: anel `violet-ink` de 2 px nos dois botões. Pressionado: escala 0,97 do botão.
- Carregando: esqueleto com chevron, nome, contagem, barra e botão nas mesmas medidas.

## Mobile e desktop

- Compact: a barra encurta para 48 px e "Nova" vira só o ícone (`add`), com 44 px visuais e 48 px de toque; o rótulo fica em `aria-label`. A contagem perde a palavra: "1 de 3".
- Medium e wide: como descrito, com hover. `hit-min` de 32 px respeitado pelos 36 px dos botões.
- Recolher persiste por grupo e por dispositivo; no celular, "De objetivos" pode começar recolhido quando "Cotidianas" ocupa a tela.

## Movimento

- Chevron: `transform: rotate` em `dur-base` com `ease-in-out` (elemento que já está na tela e muda de forma).
- Recolher: as linhas somem com opacidade em `dur-exit` e `ease-in`, depois saem do fluxo. Expandir: entram com o `rise` do kit (`dur-base`, `ease-out-quint`). Só `opacity` e `transform` animam; a altura não é interpolada.
- Barra do grupo: preenche em `dur-slow` com `ease-settle` na primeira exibição; depois interpola em `dur-base` quando uma linha é marcada.
- Reduzir movimento: chevron troca sem girar; lista aparece e some sem transição.

## Acessibilidade

- O botão de recolher tem `aria-expanded` e `aria-controls` apontando para a lista; o nome do grupo é o rótulo do botão.
- A barra tem papel de barra de progresso com `aria-valuenow`, `aria-valuemax` e rótulo "Cotidianas feitas". A contagem em texto é redundante para quem não vê a barra.
- "Nova" tem rótulo específico ("Nova cotidiana", "Nova atividade de objetivo"), também quando é só ícone.
- `text-secondary` sobre `surface` passa 5,9:1 no escuro e 5,4:1 no claro; `violet-ink` passa 6,2:1.
- Teclado: Tab chega ao botão de recolher e depois a "Nova"; Enter ou Espaço alternam. Recolher não tira o foco do cabeçalho.

## Faça e não faça

- Faça: mantenha os dois grupos sempre visíveis, mesmo vazios; a pessoa precisa saber que os dois existem.
- Faça: use a barra só para "feitas de total"; progresso de passos é das linhas.
- Faça: escreva a contagem em palavras ("feitas"); no celular pode encurtar para "1 de 3".
- Não faça: nenhuma cor laranja ou glow no cabeçalho; a luz da lista é da linha de agora.
- Não faça: não anime a altura ao recolher; só opacidade e o giro do chevron.
