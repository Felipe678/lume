A ScreenTempo é a tela "Tempo e objetivos" no desktop: objetivos em carrossel no topo, o dia de hoje em dois grupos no mesmo painel (Cotidianas e De objetivos) e, à direita, o detalhe da atividade selecionada com passos, anotações e o botão que leva ao Foco. Adição do Design System: é a tela mais importante do produto e ainda não existe no app; esta é a referência de composição de `GoalCard`, `TaskGroupHeader`, `TaskRow` e `StepList`.

## Quando usar

- Como o destino "Tempo e objetivos" da barra superior, em telas wide (1080 px ou mais). Em compact, use `ScreenTempoMobile`; em medium, a mesma estrutura em uma coluna com o detalhe abaixo da lista.
- Para planejar: criar objetivo, criar atividade, dividir em passos, ajustar estimativas, ler anotações. Executar acontece no Foco, que esta tela só abre.

## O que o consumidor fornece

- `List<Goal> goals` (ativos, na fila, concluídos recentes) e `Goal? selectedGoal`.
- `DateTime day`, `List<Task> tasks` do dia (com `kind`, `steps`, `notes`), `String? selectedTaskId`, `DateTime now`.
- Callbacks: `onSelectGoal`, `onNewGoal`, `onPrevDay`, `onNextDay`, `onNewTask(kind)`, `onSelectTask`, `onToggleStep`, `onAddStep`, `onEditEstimate`, `onEnterFocus(taskId)`, `onMarkDone`, `onReschedule`.
- Estados da página: `loading`, `empty` (nenhuma atividade no dia) e `error` (`EmptyState` com "Tentar de novo").

## Anatomia e medidas

- Fundo `.aurora` (dois radiais `aurora-1` e `aurora-2`, textura e não decoração). Barra superior em `topbar` com hairline inferior, logo, navegação (indicador `violet-ink` de 2 px sob o item atual), data e hora em `caption` e avatar.
- Conteúdo centralizado até `content-max` (1048) com margem `page-pad-wide`, respiro `space-32` no topo e `space-40` embaixo, `space-32` entre seções.
- Seção Objetivos: título em `title` com "4 ativos · 1 na fila" em `body-sm` `text-secondary`; à direita, setas (`.btn.secondary.icon.sm`, 36 px) e "Novo objetivo" (`.btn.primary.sm`). Carrossel horizontal com `scroll-snap`, cards `GoalCard` compactos de 280 px e vão `space-16`; o quarto card aparece pela borda. Sem barra de rolagem visível; as setas rolam 296 px.
- Seção Hoje: "Hoje" em `title`, "segunda, 9 nov · 3 h 55 planejadas" em `body-sm`, setas de dia e "Nova atividade". Grade de 12 colunas: lista em 7 (`.card` com padding `space-8`, dois `TaskGroupHeader` e suas `TaskRow`) e detalhe em 5 (`.card.tint` com `elev-2`, padding `space-20`, `sticky` ao rolar).
- Na lista desktop as colunas da linha são: hora 48, principal, passos 56, duração 56, estado 88, ação 36 (botão só ícone que aparece em hover ou foco; sempre visível na linha de agora).
- Detalhe: pill do objetivo (ou "Rotina") e "AGORA" em `overline` `orange-ink`; título em `headline`; horário "14:00 – 15:00 · 60 min · faltam 40 min" em `caption`; `StepList` com a barra `.seg` da atividade e "3 de 5"; "Soma das estimativas: 60 min" em `caption` `text-muted`; bloco de anotações (contagem, botão "Anotar", cada nota em `.block` com hora e passo em `caption` e texto em `body-sm`); CTA `.btn.ember` de 48 px, largura total, com `.breathe`. É a única brasa da tela: nenhum outro botão é laranja.
- Raio concêntrico: cards 16, linhas e blocos 12, passos e chips 8, barras em pílula.
- Abaixo, dois quadros menores mostram o painel vazio ("Nenhuma atividade hoje" com próximo passo sugerido) e carregando (esqueleto de cabeçalhos e linhas).

## Estados

- Preenchido (padrão), com uma atividade "agora": a linha acende em laranja discreto e o detalhe mostra "Continuar em foco".
- Atividade futura selecionada: CTA "Entrar em foco". Feita: título e duração em `text-secondary`, CTA secundário "Rever atividade". Não feita: "Marcar feita" e "Remarcar", sem alerta.
- Objetivo selecionado no carrossel: `surface-tint` e contorno `violet-ink`; seleção única, clicar de novo desmarca.
- Grupo recolhido: chevron girado e linhas fora do fluxo; a contagem continua visível.
- Vazio: card com `ico-tile` `schedule`, "Nenhuma atividade hoje" em `title-sm`, explicação em `body-sm`, "Nova atividade" e "Ver objetivos", e a sugestão "Terminar módulo B2 · Inglês fluente · 60 min" em `caption`.
- Carregando: esqueletos na forma dos cabeçalhos e linhas; o carrossel usa o esqueleto do `GoalCard`.
- Erro: `EmptyState` com "Não deu para carregar o dia" e "Tentar de novo".

## Mobile e desktop

- Wide: como descrito; hover nas linhas e cards, `hit-min` de 32 px, teclado completo.
- Medium: carrossel igual; lista em largura total e o detalhe vira um card logo abaixo da lista (não sticky); botão de ação da linha sempre visível.
- Compact: ver `ScreenTempoMobile` (detalhe em Sheet, CTA fixo acima da BottomNav).

## Movimento

- Entrada em duas ondas dentro de `dur-page`: a seção Objetivos é o hero (`.rise.hero`, 240 ms); o cabeçalho de Hoje e a lista chegam na onda 0 (`--w:0`), o detalhe e os estados na onda 1 (`--w:1`). Nada de um card por vez.
- Selecionar uma linha troca o detalhe sem animar a página; só o fundo da linha muda em `dur-instant`.
- Concluir um passo no detalhe: check com mola (`ease-spring`), pulso de luz no passo (`dur-pulse`), o segmento esfria para `violet` e o próximo acende; a mini-barra da linha acompanha. Marcar a última etapa deixa a atividade "feita".
- Carrossel rola com `scroll-behavior: smooth` e snap; setas em `dur-fast`.
- CTA em brasa respira em `dur-breathe` (brilho 1 → 1,08). Único loop da tela além do esqueleto.
- Reduzir movimento: sem ondas de entrada, sem respiração, sem mola, carrossel sem rolagem suave.

## Acessibilidade

- Marcos: `header`, `main`, duas seções com `aria-labelledby`. A lista é um `listbox` ("Atividades de hoje") e cada linha uma opção com `aria-selected`; o carrossel também é um `listbox` de objetivos com `aria-pressed` por card.
- O detalhe é uma região `aria-live="polite"`: ao trocar a seleção, o leitor de tela anuncia o novo título.
- Ordem de foco: barra superior, setas e "Novo objetivo", cards do carrossel, setas de dia e "Nova atividade", cabeçalhos e linhas (setas para cima e para baixo trocam de linha; Enter seleciona; Tab chega ao botão de foco da linha), detalhe (checks, estimativas, anotações, CTA).
- Contraste: `text-secondary` sobre `surface`, `surface-tint` e `surface-raised` acima de 5,4:1 nos dois temas; `on-orange` sobre o CTA 8,0:1; `orange-ink` e `violet-ink` acima de 6:1 como texto.
- Nenhuma informação só por cor: estado em palavra, objetivo com nome, passo atual numerado e rotulado "atual".

## Faça e não faça

- Faça: mantenha os dois grupos no mesmo painel; trocar de aba para ver as cotidianas quebra o relance.
- Faça: deixe o detalhe ser o lugar de planejar (passos, estimativas, anotações) e o Foco o lugar de agir.
- Faça: uma brasa por tela: o CTA do detalhe. A linha de agora tem só uma luz discreta.
- Não faça: não mostre mais de 5 cards de objetivo sem o carrossel; não transforme o carrossel em grade no desktop.
- Não faça: nenhum vermelho, contador urgente ou texto de culpa para a atividade não feita.
