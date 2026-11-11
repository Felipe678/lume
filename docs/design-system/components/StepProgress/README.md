Barra de progresso da atividade dividida em um segmento por passo, com os passos feitos em violeta, o atual aceso em laranja e os próximos vazios, mais a linha de pontos e o rótulo "Passo 3 de 5". Adição do Design System: o Modo Foco e a lista de atividades precisam mostrar progresso por passos, não por porcentagem; a barra contínua do card Agora não serve para isso.

## Quando usar

- No topo do Modo Foco, como a barra da atividade (altura 8px, largura até 640px).
- Na linha da lista de atividades, na versão `.seg.mini` (56 × 4px), ao lado de "3/5".
- No detalhe da atividade e no encerramento (`FocusEnd`), com todos os segmentos em `.done`.
- Não use para progresso contínuo (tempo, dinheiro, etapas de um objetivo): aí é a `.bar.lit`. Não use com mais de 8 passos; acima disso a atividade está planejada demais e a barra vira ruído.

## O que o consumidor fornece

- `int total` (número de passos, 1 a 8) e `int current` (índice do passo em andamento, ou `total` quando a atividade acabou).
- `double progress` do passo atual, de 0 a 1, para o preenchimento do segmento aceso (`--p`).
- `bool over` quando o passo passou do tempo estimado, e `Duration? extra` ("+02:10") para o rótulo.
- `bool paused` para apagar o glow sem mexer no preenchimento.
- `VoidCallback? onStepDone` só para disparar o pulso; a barra em si não é interativa.
- Opcional: `bool showDots` (linha de pontos) e `bool showLabel` ("Passo 3 de 5").

## Anatomia e medidas

- Container `.seg` do kit: `display: flex`, vão de 4px (6px na versão de 8px de altura), altura 6px por padrão, 8px no Foco, 4px na `.mini`. Cada segmento tem `radius-full`.
- Segmento vazio: `ring-track`. Feito (`.done`): `violet`. Atual (`.now`): trilho `ring-track` com `glow-orange` e preenchimento em gradiente `orange` → `ember` até `--p`.
- Passou do tempo: segmento `.now.over` cheio (`--p: 100%`) em `orange` estável, sem cabeça `ember`. O excedente aparece ao lado do rótulo em `caption` `text-secondary` com o ícone `schedule` de 16px: "+02:10". Sem `danger`.
- Pausado: o container recebe `--glow-orange: none`; o preenchimento permanece.
- Rótulo: `label` em `text-primary` ("Passo 3 de 5"); estado em `caption` `text-muted` quando houver. Números tabulares.
- Pontos: círculos de 8px com vão de 10px; feitos em `violet`, atual em `orange` com sombra de 10px a 70% e escala 1,25; próximos em `ring-track`.
- Na lista de passos ao lado, o atual usa `surface-tint` com hairline no topo, ícone `radio_button_checked` em `orange-ink`; feitos com `check_circle` em `violet-ink` e título em `text-secondary`.

## Estados

- Começando: `--p` próximo de 0, só o glow marca o segmento.
- Em andamento: preenchimento proporcional ao tempo do passo, atualizado a cada segundo sem salto.
- Passou do tempo: cheio em laranja, rótulo com o extra.
- Pausado: sem glow.
- Concluída: todos `.done`, rótulo "5 de 5 passos".
- Carregando: `.skel` com a mesma altura e raio. Vazio (atividade sem passos): a barra não aparece; o detalhe mostra "Sem passos. Adicione na tela da atividade."

## Mobile e desktop

- Celular: mesma barra em largura total com `page-pad-compact`; na lista, a `.mini` de 56px sempre visível à direita.
- Desktop: no Foco a barra tem no máximo 640px e fica centralizada; na lista, a `.mini` acompanha a coluna de duração.
- A barra não tem alvo de toque; o rótulo e os pontos são só leitura.

## Movimento

- Concluir passo: o segmento atual recebe `.pulse.go` com `--c: var(--orange)` (anel que expande 18px e some em `dur-pulse`, `ease-out-expo`); 220ms depois ele vira `.done` (`background-color` em `dur-base`, `ease-out`) e o próximo vira `.now` com `--p` partindo de 0.
- Preenchimento: `width` do `::after` em `dur-slow`, `ease-settle` na primeira exibição; depois acompanha o relógio.
- Pontos: cor e sombra em `dur-base` `ease-out`; a escala do ponto atual em `ease-spring`.
- Reduzir movimento: o kit zera animações e transições; o pulso não aparece e as cores trocam direto.

## Acessibilidade

- O container é `role="progressbar"` com `aria-valuemin="0"`, `aria-valuemax` igual ao total e `aria-valuenow` igual aos passos feitos; `aria-valuetext` repete o rótulo ("Passo 3 de 5"). Em Flutter: `Semantics(label: 'Passo 3 de 5, 34% do passo atual')`.
- A cor não carrega o significado sozinha: feito, atual e próximo têm também o rótulo e, na lista, ícone e texto.
- `violet` sobre `bg` dá 2,7:1 (limite conhecido do DS); por isso o rótulo numérico sempre acompanha.
- Os pontos são `aria-hidden`: repetem a barra.

## Faça e não faça

- Faça: um segmento por passo, sempre com o rótulo "Passo N de M" perto.
- Faça: passar do tempo em laranja estável e texto discreto; a frase gentil fica para o encerramento.
- Não faça: segmento vermelho, piscando ou com contagem regressiva pulsante.
- Não faça: usar a segmentada para etapas de objetivo ou tempo da atividade (é `.bar.lit`).
- Não faça: mais de 8 segmentos ou segmentos com larguras diferentes por duração; todos têm o mesmo peso visual.
