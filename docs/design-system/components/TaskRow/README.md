A TaskRow é a linha de uma atividade do dia: hora, título, pill do objetivo (ou "Rotina"), passos em mini-segmentos, duração, estado e o botão que leva ao Foco. Adição do Design System: a tela "Tempo e objetivos" lista cotidianas e atividades de objetivo no mesmo painel e precisa de uma linha que mostre passos e estado sem abrir nada; o `ActivityRow` atual não tem passos nem o atalho de foco.

## Quando usar

- Em listas de atividades agrupadas por `TaskGroupHeader` ("Cotidianas", "De objetivos") na tela "Tempo e objetivos", desktop e celular.
- Quando a linha precisa ser selecionável (abre o detalhe ao lado ou em Sheet) e oferecer o atalho "Entrar em foco".
- Não use no dashboard (lá fica o `ActivityRow`, mais simples) nem dentro do Foco.

## O que o consumidor fornece

- `Task task`: `title`, `start` (hora), `durationMinutes`, `kind` (`cotidiana` ou `deObjetivo`), `goal` (nome e `GoalColor`, só em `deObjetivo`), `repeat` (`todoDia` ou lista de dias, só em `cotidiana`), `steps` (lista com `done` por passo; pode ser vazia), `currentStep` (índice, quando a atividade está em andamento), `status` (`proxima`, `agora`, `feita`, `naoFeita`, `futura`) e `startsIn` (texto "em 1 h 10", só na próxima).
- `bool selected`, `VoidCallback onSelect` (abre o detalhe) e `VoidCallback onFocus` (vai para o Foco). Para a linha feita, `onFocus` vira "Rever"; para a não feita, "Marcar feita".
- Nenhum filho.

## Anatomia e medidas

- Grade de seis colunas com vão `space-12`: hora 52 px, principal flexível, passos 56 px, duração 64 px, estado 112 px, ação 148 px. Altura mínima 56 px, padding `space-8` vertical e `space-12` horizontal, raio `radius-md` (a lista está num `.card` de `radius-lg` com padding `space-8`: raio concêntrico 16 → 12).
- Hora em `label`, números tabulares, `text-secondary`; na linha de agora fica `text-primary` em 700.
- Título em `title-sm`, uma linha com reticências. Linha de apoio em `caption`: pill do objetivo (`.chip` compacta de 22 px com ponto de 8 px na cor `goal-*` e o nome) ou pill "Rotina" com ícone `repeat`, seguida de "todo dia" ou "seg, qua, sex", ou de "passo 3 de 5".
- Passos: `.seg.mini` (4 px de altura, vão 3, 56 px), um segmento por passo: feitos em `violet`, o atual em `orange` com preenchimento parcial (`--p`) e brilho curto, pendentes em `ring-track`. Atividade sem passos deixa a coluna vazia.
- Duração em `label`, número em `text-primary` e unidade "min" em `text-secondary` (`<small>`).
- Estado em `caption` e `text-secondary`: "próxima · em 1 h 10"; "feita" com `check_circle` em `violet-ink`; "não feita" com `history` em `text-muted` e o apoio diz "fica para amanhã"; agora usa o `overline` "AGORA" em `orange-ink` com um ponto de 6 px aceso. Futuras não mostram estado.
- Ação: `.btn.secondary.sm` com `play_arrow` e "Entrar em foco" (ou "Continuar", "Rever", "Marcar feita"). O ícone é `text-secondary`; só na linha de agora é `orange-ink`.

## Estados

- Normal (futura): sem estado escrito, botão oculto até hover ou foco.
- Próxima: "próxima · em 1 h 10".
- Agora: fundo `surface-raised`, hairline forte no topo e luz laranja discreta (`0 0 0 1px orange a 30%` + `0 4px 18px orange a 16%`); botão sempre visível. É a única linha com luz na lista.
- Feita: título e duração em `text-secondary`, segmentos todos em `violet`, "feita" com check. Sem riscar o texto.
- Não feita: título em `text-secondary`, estado em `text-muted`, apoio gentil. Nunca vermelho, nunca "perdida" ou "atrasada".
- Selecionada: fundo `surface-tint` e contorno interno de 1 px `hairline-strong`; `aria-selected="true"`. Agora e selecionada somam as duas luzes.
- Hover (só mouse): fundo `surface-raised` e o botão aparece (opacidade 0 → 1 e 4 px de deslize) em `dur-fast`.
- Pressionado: escala 0,98 do botão; a linha não escala.
- Foco: anel `violet-ink` de 2 px por dentro da linha (`outline-offset: -2px`); o botão tem o próprio anel. Com foco dentro da linha o botão fica visível.
- Carregando: esqueleto com hora, duas linhas, barra de 4 px, duração e estado.

## Mobile e desktop

- Compact: três colunas (hora 44 px, principal, ação 44 px) e duas linhas: título e pill em cima; passos, duração e estado embaixo. O botão vira ícone (`.btn.secondary.icon`, 44 px visuais e 48 px de toque pelo `::after`) e fica sempre visível. Tocar a linha abre o detalhe como Sheet; tocar o ícone vai direto ao Foco.
- Medium: como o desktop, com o botão sempre visível quando não há ponteiro fino.
- Wide: seis colunas, botão em hover ou foco. `hit-min` de 32 px na linha e 36 px no botão.

## Movimento

- Botão de ação: opacidade e `translateX(4px → 0)` em `dur-fast` com `ease-out`. Fundo em `dur-instant`.
- Segmento atual: preenche em `dur-slow` com `ease-settle`; ao concluir o passo, esfria para `violet` em `dur-base` e o próximo acende.
- Marcar feita: o check aparece com `ease-spring` (`dur-base`) e a linha solta um `.pulse.go` em `dur-pulse`. Sem confete.
- Reduzir movimento: botão sempre visível, sem deslize; cores trocam sem transição.

## Acessibilidade

- A linha tem papel de opção dentro de uma lista ("Atividades de hoje") com rótulo completo: "14:00, Estudo de inglês, objetivo Inglês fluente, passo 3 de 5, 60 minutos, agora". `aria-selected` reflete a seleção.
- O botão tem rótulo próprio ("Entrar em foco em Revisão de código"); o ícone sozinho no celular leva `aria-label`.
- Estado sempre em palavra ou ícone com texto; a cor do objetivo é redundante ao nome na pill.
- `text-secondary` sobre `surface`, `surface-raised` e `surface-tint` passa 5,4:1 ou mais nos dois temas; `orange-ink` escurece no claro (`#a85a00`).
- Teclado: Tab chega à linha, Enter ou Espaço seleciona, setas para cima e para baixo trocam de linha, Tab de novo chega ao botão. O botão nunca depende de hover: aparece com foco e no toque.

## Faça e não faça

- Faça: mostre os passos como segmentos, um por passo; nunca como percentual.
- Faça: escreva a unidade da duração em `text-secondary` ("60 min"), com números tabulares para as colunas alinharem.
- Faça: use "Rotina" para a cotidiana e o nome do objetivo para a de objetivo; nunca os dois.
- Não faça: nenhuma cor de alerta ou texto de culpa na não feita; "fica para amanhã" é o tom.
- Não faça: não acenda mais de uma linha; a luz laranja é só da atividade de agora.
