O GoalCard é o card de um objetivo: ícone escolhido pelo usuário, título, porquê, prioridade por palavra, etapas que acendem em laranja, consistência em sete pontos e horas investidas contra a estimativa. Adição do Design System: a tela "Tempo e objetivos" e a E1 precisam de um card que mostre o objetivo inteiro de relance e sirva de item de carrossel no celular e no desktop; hoje o app só tem o `GoalChip`.

## Quando usar

- No topo da tela "Tempo e objetivos", em carrossel horizontal (versão compacta de 280 px), e na lista de objetivos do desktop (versão larga, uma linha por objetivo).
- Como item selecionável: selecionar um objetivo filtra as atividades do dia e abre o detalhe.
- Não use para atividades (use `TaskRow`) nem como pílula de filtro (use `GoalChip`). Não use dentro do Foco: lá não se planeja.

## O que o consumidor fornece

- `Goal goal`: `title`, `why` (uma frase), `icon` (emoji ou `IconData` escolhido pelo usuário), `color` (um dos `GoalColor`, mapeado para `goal-*`), `priority` (`alta`, `media`, `baixa`), `stepsDone`, `stepsTotal`, `nextStep` (título da próxima etapa), `daysThisWeek` (0 a 7), `hoursSpent`, `hoursEstimated`, `status` (`ativo`, `naFila`, `concluido`, `arquivado`), `queuedAfter` (nome do objetivo anterior, quando na fila), `finishedAt` ou `archivedAt`.
- `GoalCardLayout layout`: `compact` (280 px, para carrossel) ou `wide` (linha inteira).
- `bool selected` e `VoidCallback? onTap`. Sem `onTap`, o card é só informativo e não tem hover nem pressionado.
- Nenhum filho: todo o conteúdo vem do `goal`.

## Anatomia e medidas

- Container `.card` (`surface`, `radius-lg`, `elev-1`), padding `space-20`, vão interno `space-16` entre blocos. Compacto: 280 px de largura. Largo: grade de três colunas (identidade 1,3fr, progresso 1,1fr, resumo automático) com vão `space-24`, altura mínima definida pelo conteúdo.
- Ícone em `.ico-tile` (40 px, `radius-md`) tingido pela cor do objetivo: gradiente de `goal-*` a 28% até 14% sobre `icon-tile`, hairline `hairline-strong` no topo e contorno interno de 1 px na cor a 30%. O emoji tem 20 px. O tile nunca é a única pista: a cor do objetivo sempre aparece junto do nome.
- Título em `title-sm`, até duas linhas com reticências (uma linha no largo). Porquê em `caption` e `text-secondary`, uma linha com reticências.
- Prioridade por palavra e ícone, em `caption` e `text-secondary`: "Alta" com `keyboard_double_arrow_up`, "Média" com `remove`, "Baixa" com `keyboard_arrow_down`. Nunca cor como único sinal. No compacto fica à esquerda da linha de etapas; no largo, à direita do título.
- Etapas: compacto usa `.bar.lit` de 6 px com `--g: orange` (laranja é o papel das etapas de objetivo) e cabeça luminosa de `glow-head`; largo usa anel de 44 px com traço de 4 px, trilho `ring-track` e arco `orange`, número "3/8" em 12 px 700 no centro. Rótulo "3 de 8 etapas" em `caption`, número em `text-primary`, resto em `text-secondary`.
- Próxima etapa: ícone `arrow_forward` em `orange-ink`, "Próxima:" em `text-secondary` e o título em 600 `text-primary`, uma linha com reticências.
- Consistência: sete pontos de 6 px com vão de 3 px, feitos em `cyan` (o papel de "dias na semana"), vazios em `ring-track`, seguidos de "5 de 7 dias" em `caption`.
- Horas: "12 h de 40 h" em `caption`, números tabulares, unidades em `text-secondary`. No largo vem com o ícone `schedule` em `text-muted`.
- Raio concêntrico: card 16, tile 12, barra em pílula.

## Estados

- Ativo: como descrito, barra acesa.
- Na fila: linha "Na fila · depois de Projeto Lume" com `hourglass_top`; a barra não acende (`bar-muted`, sem glow), o tile perde saturação e os pontos ficam vazios com "ainda não começou".
- Concluído: a barra esfria para `violet` sem glow, linha "Concluído em 2 nov" com `check_circle` em `violet-ink`. As horas podem passar da estimativa ("22 h de 20 h") sem nenhum tom de alerta.
- Arquivado: sem elevação (`box-shadow: inset 0 0 0 1px divider`, fundo transparente), título e porquê em `text-secondary`, tile sem saturação, linha "Arquivado em 14 out" com `inventory_2`.
- Selecionado: fundo `surface-tint`, `elev-2` e contorno interno de 2 px em `violet-ink`; `aria-pressed="true"`. Seleção única dentro do carrossel.
- Hover (só com mouse): `.card.lift` sobe 2 px e passa para `elev-2` em `dur-fast`.
- Pressionado: escala 0,98 em `dur-fast`. Foco: anel `violet-ink` de 2 px com 2 px de afastamento.
- Carregando: esqueleto na mesma forma (tile 40, duas linhas, barra em pílula, rodapé), com o pulso lento do `.skel`.
- Vazio: não se aplica ao card; a seção sem objetivos usa `EmptyState` com "Criar objetivo".

## Mobile e desktop

- Compact: carrossel horizontal com `scroll-snap-type: x mandatory`, cards de 280 px com vão `space-16`, o próximo card aparece pela borda (peek). Toque abre o detalhe; sem hover.
- Medium: o mesmo carrossel; se couberem todos, nada rola.
- Wide: carrossel com setas de rolagem (botões `.btn.secondary.icon`), ou a versão larga em lista quando a tela é a de objetivos. Hover e `hit-min` de 32 px.
- O texto nunca empurra o card: título em duas linhas, porquê e próxima etapa com reticências.

## Movimento

- Barra e anel preenchem em `dur-slow` com `ease-settle` só na primeira exibição; atualizações depois interpolam em `dur-base`.
- Concluir a última etapa: a barra esfria de `orange` para `violet` em `dur-base` e solta um `.pulse.go` (`dur-pulse`, `ease-out-expo`). Sem confete.
- Hover em `dur-fast` e `ease-out`; soltar o pressionado volta com `ease-spring`.
- Entrada da tela: o carrossel inteiro é um bloco da primeira onda (`.rise`), não um card por vez.
- Reduzir movimento: barra e anel aparecem no valor final; sem hover de elevação, sem mola, sem pulso.

## Acessibilidade

- O card é um botão com rótulo "Inglês fluente, prioridade alta, 3 de 8 etapas, 5 de 7 dias" e, quando for o caso, ", selecionado", ", na fila depois de Projeto Lume", ", concluído em 2 de novembro".
- Prioridade e status sempre em palavra; a cor do objetivo e do estado é redundante.
- `text-secondary` sobre `surface` e `surface-tint` passa 5,9:1 no escuro e 5,4:1 no claro. O emoji fica sobre um tile de baixa saturação para não disputar com o texto.
- Alvo de toque: o card inteiro (mínimo 48 px). Teclado: Tab percorre os cards na ordem visual; Enter ou Espaço seleciona; setas rolam o carrossel.

## Faça e não faça

- Faça: mostre a próxima etapa sempre que existir; é o que transforma o objetivo em ação.
- Faça: use `orange` para etapas e `cyan` para dias; não troque os papéis das cores.
- Faça: deixe o usuário escolher o ícone e aceite emoji; ele é o único emoji permitido no card.
- Não faça: nenhum vermelho ou aviso para objetivo parado ou com poucas horas; "ainda não começou" basta.
- Não faça: não coloque botões dentro do card (o card inteiro é o alvo); ações ficam no detalhe.
