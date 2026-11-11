Modo Foco no celular, em três quadros: em andamento com CTA fixo ao alcance do polegar, anotando com o composer acima do teclado, e o encerramento com a mensagem gentil. Adição do Design System: a tela de Foco precisa funcionar primeiro no celular, com a mesma hierarquia da versão desktop em coluna única.

## Quando usar

- Abaixo de `bp-medium` (compact), ao entrar em foco pela grade ou pelo CTA "Continuar · Estudo de inglês".
- É tela cheia: sem `BottomNav`, sem barra do app, sem notificações. Sair devolve à grade com Toast de desfazer.
- Não use para planejar: nenhum passo é editado, criado ou reordenado aqui.

## O que o consumidor fornece

- O mesmo de `ScreenFoco`: `Activity`, `currentStep`, `stepRemaining`, `activityRemaining`, `paused`, callbacks de concluir, anotar, pausar, sair, próxima e encerrar.
- `bool firstTime` para mostrar a dica de gesto uma única vez.
- `bool keyboardOpen` (do `MediaQuery.viewInsets`) para subir o composer.

## Anatomia e medidas

- Fundo `.aurora` com o radial da brasa (`orange` a 6%, 420px) atrás do anel; no encerramento, `violet` a 7%.
- Barra mínima de 56px: ponto do objetivo, "Estudo de inglês · Inglês fluente" em `caption` (nome em `text-primary`), botões de ícone de 48px "Pausar" e "Sair" em `text-secondary`.
- Coluna com `page-pad-compact`, gap 12px: `StepProgress` de 6px em largura total; "Passo 3 de 5" em `caption` `text-secondary`; título do passo em 28px / 34px, peso 800, tracking -0,6px, centralizado e balanceado; chip "2 anotações"; `FocusTimer` compacto (176px, número 56px); pontos; rodapé `caption` "32 min restantes na atividade · termina 15:00".
- CTA fixo em `.glass` (`surface-glass`, `blur-glass`, `elev-3`, hairline forte) com cantos `radius-lg` em cima: `Button` primário violeta "Concluir passo" de 48px em largura total, `Button` secundário "Anotar" de 48px, e a dica `caption` `text-muted` "deslize o passo para a esquerda para concluir" com ícone `swipe_left` (só na primeira vez). A brasa já está no anel; o CTA não usa `ember`.
- Anotando: o composer (`surface-raised`, `radius-md`, contorno 2px `violet-ink`) fica logo acima do teclado, com o chip e a dica "Enter salva" embaixo; o anel e as ações rolam para fora da tela.
- Encerramento: `FocusEnd` sem card, blocos em 2 colunas, mensagem gentil em `surface-tint`, CTA fixo em `.glass` com "Próxima: Revisão de código · 15:30" e "Encerrar por hoje".

## Estados

- Em andamento, pausado e passou do tempo: iguais aos do desktop, com o anel compacto (passou do tempo: número em 44px).
- Anotando: teclado aberto, composer acima dele.
- Encerramento: passos, tempo, anotações, consistência e a frase gentil quando passou do tempo.
- Primeira vez: dica de gesto; depois ela não volta.

## Mobile e desktop

- Compact: esta tela. O gesto de deslizar o passo (título e anel) para a esquerda conclui, com o botão como alternativa sempre visível; arrastar para baixo não fecha nada (não é sheet).
- Medium e wide: `ScreenFoco`.
- Áreas seguras: o CTA soma o inset inferior ao padding; a barra mínima respeita o entalhe.

## Movimento

- Entrada em duas ondas como no desktop (`.rise.hero` na barra, `--w: 0` e `--w: 1` no resto), dentro de `dur-page`.
- Concluir (botão ou gesto): o mesmo pulso laranja, esfriar para violeta, cross-fade do título e reinício do anel. No gesto, o título acompanha o dedo até 40% da largura e então solta com `ease-spring`.
- Teclado: o composer acompanha a animação nativa do teclado; nada mais anima.
- Reduzir movimento: sem respiração, mola ou pulso; o gesto continua funcionando, só sem a mola.

## Acessibilidade

- Alvos de 48px em todos os controles; o gesto nunca é o único caminho (o botão "Concluir passo" está sempre visível).
- Título do passo é `h1`; barra `progressbar`; anel `timer` com `aria-live="off"`.
- A dica de gesto é texto visível e também `Semantics(hint: ...)` no título.
- Contraste do CTA em `.glass`: o fundo a 80% com blur mantém `text-primary` acima de 4,5:1 nos dois temas; o primário usa `on-violet`.

## Faça e não faça

- Faça: CTA primário violeta; a brasa fica no anel e no segmento.
- Faça: composer acima do teclado, sem sair da tela.
- Não faça: `BottomNav` ou barra do app por cima do Foco.
- Não faça: dica de gesto permanente; uma vez e pronto.
- Não faça: cortar o rodapé da atividade sob o CTA; o conteúdo tem folga de 176px.
