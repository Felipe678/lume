Página viva do sistema de movimento v2 do Lume: as oito durações, as sete curvas, as três assinaturas (acender, pulso, respiração) demonstradas com as classes do kit e um interruptor para ver o modo "Reduzir movimento".

## Resumo do sistema v2
O Lume fica aberto o dia todo, então o movimento dá contexto e acabamento, nunca prende atenção. Três coisas, e só elas, são "o movimento do Lume":
- **Acender**: progresso preenche com cabeça luminosa (`glow-head`, `.bar.lit`, `.seg`). O passo atual é laranja (brasa) e, ao concluir, esfria para `violet`.
- **Pulso**: concluir solta um único anel de luz que expande e some (`.pulse.go`, `dur-pulse`, `ease-out-expo`). Sem confete.
- **Respiração**: o elemento aceso (card Agora, passo atual, cartão de Finanças) respira em `dur-breathe` (`.breathe`, brilho de 1 a 1,08). Para em pausa e em reduzir movimento.

Durações (só os tokens): `dur-instant` 80 ms (cor em hover e foco), `dur-fast` 140 ms (pressionar, soltar, trocar aba), `dur-exit` 160 ms (fechar), `dur-base` 220 ms (abrir), `dur-slow` 360 ms (acender anel e barras), `dur-page` 480 ms (entrada da tela), `dur-pulse` 600 ms (pulso), `dur-breathe` 6 s (respiração).

Curvas: `ease-out` para o que entra; `ease-out-quint` para elementos grandes (sheet, diálogo, tela); `ease-in` para o que sai, 20% mais curto; `ease-settle` para anel e barras; `ease-out-expo` para o pulso; `ease-in-out` para o que já está na tela e se move (indicador de aba, anel que reinicia); `ease-spring` (mola contida) só em soltar botão, check de conclusão e troca de passo.

Regras: só `transform` e `opacity` animam (e `box-shadow` em hover). Hover só com `@media (hover: hover) and (pointer: fine)`. Entrada da tela em **duas ondas** (`.rise.hero` em 240 ms, depois `.rise` com `--w:0` e `--w:1`), nunca um card por vez. O que se vê 100 vezes por dia não anima (troca de aba só move o indicador). Nada passa de `dur-page`, exceto a respiração e o esqueleto.

## O que a página mostra
- **Durações**: tabela com o valor lido do token e uma demo por linha (barra que acende na duração e na curva; o pulso e a respiração aparecem como são), com "repetir".
- **Curvas**: as sete em SVG, com um ponto percorrendo o gráfico e uma bolinha percorrendo a trilha, em câmera lenta (3× `dur-page`). A mola passa do fim e volta.
- **Demos com o kit**: `.bar.lit` acendendo; `.seg` concluindo passo (esfria com pulso e o próximo acende); `.pulse.go`; `.check.on` com mola; entrada em duas ondas; `.navy.breathe` com Pausar (a respiração para e o texto esfria); `.card.lift` em hover; `.btn` pressionar e soltar com a bolinha da mola; Sheet em `.glass` abrindo sobre o scrim; Toast em `.glass` com check de mola e "Desfazer".
- **Reduzir movimento**: o interruptor aplica na página o mesmo que o kit aplica no `@media (prefers-reduced-motion: reduce)`; o sistema operacional liga sozinho.

## Reduzir movimento
Durações viram 1 ms (equivalente a fade instantâneo); a mola vira `ease-out`; respiração e esqueleto param; a entrada em ondas some (tudo aparece junto); anel e barras já no valor final; sheet, menu e toast seguem funcionando, só com fade. No Flutter, `MediaQuery.disableAnimations` lido uma vez na página.

## Proibições (princípio pró-humano)
Confete, partículas e chama; tremor e piscar vermelho; contagem regressiva pulsante; som ou vibração de recompensa; fade-up em cada card; loop além da respiração e do esqueleto; mola fora de soltar, check e troca de passo; animar o que se vê 100 vezes por dia; valores soltos de duração ou curva.

## Mobile e desktop
Hover só com ponteiro fino; no celular o equivalente é o pressionado com mola ao soltar. O menu de módulos é painel ancorado no desktop e Sheet em vidro no celular; arrastar o Sheet para baixo o fecha em `dur-exit`.

## Acessibilidade
O interruptor é um `switch` com estado anunciado e alvo de 44 px (48 de toque). Toda animação tem equivalente sem movimento e nenhum significado depende só dele: "Concluído" aparece em texto, o pulso acompanha um check, a respiração acompanha o rótulo AGORA.

## Em Flutter
Uma classe `AppMotion` com as oito durações e as sete curvas, usada em `AnimatedContainer`, `TweenAnimationBuilder`, `FadeTransition` e `ScaleTransition`; `disableAnimations` lido uma vez no widget de página e repassado. A mola é `Curves.easeOutBack` suavizada ou uma `Cubic(0.34, 1.56, 0.64, 1)`.
