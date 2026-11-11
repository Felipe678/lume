Aviso temporário em vidro que confirma uma ação ou informa algo sem interromper o que a pessoa está fazendo, com "Desfazer" como padrão. Adição do Design System: o app ainda não tem avisos, e a E1 precisa de um retorno calmo e único para concluir, sair do foco, salvar e falhar.

## Quando usar

- Confirmar algo que acabou de acontecer ("Passo concluído.") com "Desfazer" quando a ação for reversível. Sair do Foco e Concluir usam exatamente este padrão: nada de diálogo de confirmação antes.
- Avisar falha recuperável ("Não foi possível salvar. Tente de novo em instantes.") com "Tentar de novo".
- Dar um empurrão gentil de ritmo ("Constância vale mais que intensidade.").
- Não use para erro de campo (mensagem do `TextField`), para decisão que exige resposta (diálogo) nem para informação que precisa ficar na tela (bloco na própria página).

## O que o consumidor fornece

- `String message` curta, uma ou duas linhas, em segunda pessoa e sem culpa.
- `ToastKind kind`: informação, sucesso, erro ou ritmo gentil (define o ícone e a cor do tile).
- Opcional: `String? actionLabel` e `VoidCallback? onAction` (verbo que diz o que acontece; "Desfazer" é o mais comum).
- Quem mostra fica no topo da árvore (`ScaffoldMessenger` ou camada de overlay), com no máximo 4 avisos juntos.

## Anatomia e medidas

- Fundo `.glass` do kit: `surface-glass` com `backdrop-filter: blur(blur-glass) saturate(140%)`, `elev-3` e hairline-strong no topo. Raio `radius-md`, padding `space-12`, largura máxima de 440px.
- Ícone em `.ico-tile.sm` (32px, `radius-sm`, gradiente e hairline), ícone de 18px. Informação: tile neutro com `info` em `blue-ink`. Sucesso: tile `.violet` com `check` em `on-violet` (concluir esfria para violet; o check entra com mola). Erro: tile neutro com `error` em `danger`. Ritmo gentil: tile neutro com `spa` em `orange-ink`.
- Texto em `body-sm` com `text-primary`, vão `space-12` do tile.
- Ação à direita: `.btn.ghost.sm` em `violet-ink`, 36px de altura e 48px de toque.
- Posição: centralizado na parte de baixo no celular (acima da BottomNav e da área segura); canto inferior no desktop.

Hoje no Flutter: não existe aviso temporário no app.

## Estados

- Entrando, visível, pausado (hover ou foco dentro do aviso), saindo.
- A ação tem hover (só desktop), pressionado com mola e foco como qualquer botão fantasma.
- Erro e sucesso têm a mesma estrutura; sem vermelho de fundo, sem piscar, sem som.

## Mobile e desktop

- Celular: largura da tela menos `page-pad-compact` de cada lado; a ação tem 48px de toque; tocar no aviso também pausa.
- Desktop: até 440px; pausa em hover e em foco; `Esc` fecha o aviso focado.

## Movimento

- Entra em `dur-base` com `ease-out-quint`: sobe 8px e aparece com fade. O check de sucesso entra em `dur-base` com `ease-spring`, logo depois do aviso (atraso `dur-fast`).
- Some sozinho em 4s (6s quando tem ação); sai em `dur-exit` com `ease-in`, descendo 4px. O tempo para quando ponteiro ou foco entram e continua de onde parou.
- Reduzir movimento: só fade de `dur-instant`, sem deslocamento nem mola.

## Acessibilidade

- Região com `aria-live="polite"` (no Flutter, `SemanticsService.announce`): avisos são lidos sem tirar o foco do lugar.
- Contraste: `text-primary` sobre `surface-glass` (sobre qualquer fundo do app) acima de 4,5:1; `blue-ink`, `orange-ink` e `danger` sobre o tile acima de 4,5:1; `on-violet` sobre `violet` 7,4:1; `violet-ink` da ação mínimo 6,2:1.
- Quatro segundos podem ser pouco para quem lê devagar: pausar em foco é obrigatório, e informação essencial vai também para a tela.
- Ação alcançável por teclado; `Esc` fecha.

## Faça e não faça

- Faça: frases curtas que dizem o que aconteceu e o que a pessoa pode fazer.
- Faça: "Desfazer" em vez de confirmar antes (Sair do foco, Concluir passo).
- Faça: no ritmo gentil, tom de parceiro calmo.
- Não faça: culpar ("Você falhou") nem contagem urgente.
- Não faça: empilhar mais de um aviso do mesmo tipo; troque o anterior.
