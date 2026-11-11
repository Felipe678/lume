# Movimento e animações

O Lume fica aberto o dia todo. O movimento serve para dar contexto (de onde algo veio, para onde vai) e sensação de acabamento. Nunca serve para prender atenção.

## Regras

- Durações só dos tokens `dur-*`; curvas só de `ease-out`, `ease-in` e `ease-settle`. Nada de valor solto.
- O que entra ou aparece usa `ease-out`. O que sai ou fecha usa `ease-in` e é mais curto que a entrada (`dur-exit` 160ms contra `dur-base` 220ms).
- Anime `opacity` e `transform` (escala, translação). Evite animar tamanho, margem ou posição que force o layout a recalcular.
- Nenhuma animação passa de `dur-page` (480ms), exceto o pulso lento do esqueleto de carregamento e o brilho ambiente opcional do card Agora.
- Nenhum movimento repete sozinho para chamar atenção. Só estes loops existem: esqueleto de carregamento (1,6s, suave) e brilho ambiente do card Agora (8s, opacidade de 0,28 a 0,36).
- Proibido: confete, partículas, chama, tremor, piscar vermelho, contagem regressiva pulsante, som de recompensa, vibração de celebração.

## A assinatura: acender, esfriar, pulsar

| Momento | O que acontece | Tokens |
|---|---|---|
| Progresso em andamento | A barra ou o arco do anel preenche com uma cabeça luminosa de `glow-head` (24px) em gradiente `orange` → `ember`. | `dur-slow`, `ease-settle` |
| Elemento aceso | Recebe `glow-*` e respira: brilho de 1,0 a 1,08 e volta. Só um por tela. Para quando pausado. | `dur-breathe` (6s), ease-in-out |
| Concluir passo | O segmento atual solta um pulso (anel que expande 18px e some) e esfria de laranja para violeta; o próximo segmento acende. O check cresce de 0,4 a 1 com mola. | `dur-pulse`, `ease-out-expo`; `dur-base`, `ease-spring` |
| Concluir atividade | Um único pulso violeta no ícone da tela de encerramento. Nada mais. | `dur-pulse` |
| Soltar botão | Pressionado encolhe a 0,97 em `ease-out`; ao soltar volta com mola leve. | `dur-fast`, `ease-spring` |
| Entrada de tela | Hero acende em 240ms (`ease-out-quint`); depois duas ondas de blocos, 120ms entre elas; tudo dentro de `dur-page`. | `dur-page`, `ease-out-quint` |
| Troca de passo no Foco | Título sai em fade de 100ms e entra em 160ms; o anel do passo volta a 0 com mola curta e começa a preencher. | `dur-fast`, `ease-spring` |

Essas são as únicas animações "de personalidade". Tudo o mais (hover, abrir, fechar, trocar aba) é funcional e discreto.

## Catálogo

| Padrão | Duração e curva | Como |
|---|---|---|
| Hover de card (desktop) | `dur-fast`, `ease-out` | Sobe 2px e troca a sombra para `shadow-md`. Só com ponteiro de mouse. |
| Pressionar (celular e desktop) | `dur-fast`, `ease-out` | Escala para 0,98 enquanto pressionado; volta ao soltar. |
| Hover e foco de cor | `dur-instant`, `ease-out` | Troca de fundo e cor do texto. O anel de foco aparece sem animar. |
| Menu de módulos (desktop) | abre `dur-base` `ease-out-quint`, fecha `dur-exit` `ease-in` | Fade e escala de 0,96 a 1, ancorado no botão Módulos, em `surface-glass` com `elev-3`. |
| Sheet (celular) | abre `dur-base` `ease-out-quint`, fecha `dur-exit` `ease-in` | Sobe da borda inferior (translateY 100% a 0) com o `scrim` aparecendo; em `surface-glass`. Arrastar segue o dedo sem easing; soltar abaixo de 40% fecha. |
| Diálogo | abre `dur-base`, fecha `dur-exit` | Fade e escala de 0,96 a 1. |
| Entrada da tela | `dur-page`, `ease-out` | Cards sobem 12px e aparecem em sequência, 40ms entre eles, no máximo 6 itens; o resto aparece junto com o último. |
| Anel de progresso | `dur-slow`, `ease-settle` | O arco preenche de 0 ao valor, só na primeira exibição da tela. Atualizações depois disso interpolam em `dur-base`. |
| Barras do gráfico | `dur-slow`, `ease-settle` | Crescem da base, 30ms entre barras, só na primeira exibição. |
| Número de métrica | `dur-slow`, `ease-out` | Conta do valor anterior ao novo, só quando o valor muda. Não conta do zero a cada abertura. |
| Barra de progresso do card Agora | `dur-fast`, linear | Avança com o tempo (atualiza a cada 30s). Sem pulo. |
| Troca de aba ou de período | `dur-fast`, `ease-out` | Cross-fade do conteúdo; o indicador desliza. |
| Toast | entra `dur-base`, sai `dur-exit` | Sobe 8px com fade; some sozinho em 4s e para ao receber foco ou hover. |
| Conclusão de atividade | `dur-base`, `ease-out` | O check desenha o traço e o item assenta; sem confete. Texto "Concluído" aparece junto. |

## Mobile e desktop

- O hover só existe com ponteiro fino (`@media (hover: hover)`). No celular o equivalente é o estado pressionado.
- No celular, o menu de módulos abre como sheet pela borda inferior. No desktop, como painel ancorado.
- Respeite o gesto nativo: arrastar o sheet para baixo o fecha em `dur-exit`.

## Reduzir movimento

Quando o sistema pede menos movimento (`MediaQuery.disableAnimations` no Flutter, `prefers-reduced-motion` na web):

- Troque deslocamento e escala por fade de no máximo `dur-instant`.
- Remova a sequência de entrada (todos os cards aparecem juntos) e o contador de números.
- Anel e barras aparecem já no valor final.
- Pare o brilho ambiente e o pulso do esqueleto (o esqueleto fica estático).
- Mantenha o sheet e o menu funcionando, só com fade.

## Em Flutter

- Defina uma classe `AppMotion` com as durações e curvas acima e use-a em `AnimatedContainer`, `TweenAnimationBuilder`, `FadeTransition` e `ScaleTransition`. Hoje só o menu de módulos anima (220ms de abertura com `Curves.easeOutCubic`, 160ms de fechamento com `Curves.easeInCubic`).
- Leia `MediaQuery.of(context).disableAnimations` uma vez, no widget de página, e passe adiante.
