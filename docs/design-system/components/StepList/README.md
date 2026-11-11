A StepList é a lista de passos de uma atividade no detalhe de planejamento: número, título, estimativa editável em minutos, check com mola, contador de anotações por passo, reordenar e adicionar, com a barra segmentada da atividade acima. Adição do Design System: o modelo de atividade passa a ter passos com estimativa, e o brief exige que planejar (editar, reordenar, criar) aconteça aqui, nunca no Foco.

## Quando usar

- No detalhe da atividade da tela "Tempo e objetivos" (coluna da direita no desktop, Sheet no celular) e no formulário de nova atividade.
- Não use no Foco: lá o passo atual aparece sozinho (`FocusTimer` e `StepProgress`), sem edição.
- Não use para etapas de objetivo (marcos): são outra entidade, com o anel laranja do `GoalCard`.

## O que o consumidor fornece

- `List<Step> steps`: cada passo com `title`, `estimateMinutes`, `done`, `notesCount`.
- `int? currentIndex`: o passo em andamento (só quando a atividade está "agora"); sem ele, nenhum passo acende.
- Callbacks: `onToggle(index)`, `onEstimateChanged(index, minutes)`, `onReorder(from, to)`, `onAdd(title)`, `onDelete(index)`, `onOpenNotes(index)`.
- `bool loading` e `String? suggestion` para o vazio ("Começar com “Aquecer 5 min”").
- Nenhum filho além dos dados.

## Anatomia e medidas

- Bloco com vão `space-12`: rótulo "Passos da atividade" em `caption` `text-secondary` com a contagem "3 de 5" (número em `text-primary`); a barra `.seg` da atividade (6 px, um segmento por passo: feitos `violet`, atual `orange` com preenchimento parcial e `glow-orange`, pendentes `ring-track`); a lista; o campo de adicionar.
- Cada passo é uma grade de seis colunas com vão `space-8`: alça 16 px, número 20 px, check 24 px, título flexível, anotações automática, estimativa automática. Altura mínima 44 px, padding `space-4` vertical e `space-8` horizontal, raio `radius-sm` (dentro do card de `radius-lg` com padding `space-20`: 16 → 8).
- Alça `drag_indicator` em `text-muted`, visível só em hover ou foco no desktop. Número em `caption` `text-muted`, tabular; é sequência real, por isso pode ser numerado.
- Check `.check` do kit (24 px, `radius-sm`, contorno `border-control`; ligado em `violet` com ícone em `on-violet`).
- Título em `body`; feito fica `text-secondary` sem riscar; atual fica 600.
- Anotações: botão com `notes` e o número ("2") em `caption` `text-secondary`, 32 px de altura; some quando não há anotação.
- Estimativa: botão de 32 px com "10 min" em `label`, número em `text-primary` e unidade em `text-secondary`; ícone `edit` em `text-muted` aparece em hover. Ao clicar vira campo numérico de 44 px (`surface-raised`, contorno `border-control`, `radius-sm`) com "min" ao lado; Enter ou sair do campo salva, Esc cancela.
- Passo atual: fundo `surface-tint`, hairline forte no topo, número em `orange-ink`, contorno do check em `orange` e uma marca de 3 × 16 px em `orange` com brilho curto na borda esquerda. É o único elemento aceso da lista.
- Adicionar: linha com `add` em `violet-ink`, campo transparente "Adicionar passo" em `body` e a dica "Enter salva · 10 min" em `caption` `text-muted`; com foco, fundo `surface-raised` e contorno `border-control`.

## Estados

- Pendente, atual e feito, como acima. Vários feitos e um atual podem coexistir; feitos antes do atual são a regra.
- Editando estimativa: `.editing` troca o botão pelo campo.
- Arrastando: o passo arrastado fica a 50% e o alvo ganha uma linha de 2 px `violet-ink` no topo; ao soltar, os números se renumeram.
- Hover (só mouse): fundo `surface-raised` e alça visível. Foco: anel `violet-ink` de 2 px em check, anotações, estimativa e campo. Pressionado: o check encolhe e volta com mola.
- Vazio: bloco `.block` com "Divida em passos de 5 a 25 minutos." em `body`, apoio em `caption`, um botão `.btn.secondary.sm` com a sugestão e o campo de adicionar logo abaixo. Barra com um único segmento vazio.
- Carregando: esqueleto com rótulo, três segmentos e três linhas na forma dos passos.
- Erro ao salvar: o passo volta ao valor anterior e um `Toast` diz "Não deu para salvar. Tentar de novo".

## Mobile e desktop

- Compact: a alça some e cada passo ganha o botão "⋯" (32 px visuais, 48 px de toque) que abre um menu em glass (`surface-glass`, `blur-glass`, `elev-3`, `radius-md`) com "Mover para cima", "Mover para baixo", "Anotar" e "Excluir passo". O ícone `edit` da estimativa não aparece; tocar no valor já edita. Títulos longos terminam em reticências.
- Medium: como o desktop, com o menu "⋯" quando não há ponteiro fino.
- Wide: alça em hover, arrastar com o mouse, `hit-min` de 32 px nos controles.
- Teclado em qualquer largura: com foco no passo, Alt + seta para cima ou para baixo move o passo.

## Movimento

- Check: liga com `popin` do kit (`dur-base`, `ease-spring`) e o passo solta um `.pulse.go` em `violet` (`dur-pulse`, `ease-out-expo`). O segmento correspondente esfria de `orange` para `violet` em `dur-base` e o próximo acende.
- Alça e ícone de editar: opacidade em `dur-fast`, `ease-out`.
- Menu "⋯": entra com `rise` (`dur-base`, `ease-out-quint`) e sai em `dur-exit`.
- Reordenar: sem animação de posição; os números trocam no soltar.
- Reduzir movimento: alça e ícone sempre visíveis, check troca sem mola, sem pulso, menu aparece sem deslocar.

## Acessibilidade

- Lista ordenada com rótulo "Passos de Estudo de inglês". Cada check tem papel de caixa de seleção com `aria-checked` e rótulo "Anotar 3 frases novas, atual" ou ", concluído".
- Estimativa: rótulo "Estimativa: 10 minutos. Editar"; o campo tem rótulo "Minutos estimados". Anotações: "2 anotações em Anotar 3 frases novas".
- O passo atual não depende da cor: o rótulo diz "atual" e o número fica em 700.
- `text-secondary` sobre `surface` e `surface-tint` passa 5,4:1 ou mais nos dois temas; `orange-ink` escurece no claro.
- Teclado: Tab percorre check, anotações e estimativa de cada passo; Espaço marca; Enter abre a edição; Esc fecha edição e menu e devolve o foco.

## Faça e não faça

- Faça: sugira passos de 5 a 25 minutos; a soma das estimativas aparece em `caption` perto da duração, sem alerta quando passa.
- Faça: renumere ao reordenar e mantenha o passo atual como primeiro não feito.
- Faça: deixe excluir e mover só pelo menu no celular; nada de deslizar para excluir sem confirmação.
- Não faça: não risque o texto do passo feito; `text-secondary` basta.
- Não faça: não mostre esta lista no Foco; lá não se edita.
