Composer inline de anotação do Modo Foco: um botão "+ Anotar" abre uma única linha de texto embaixo do título do passo, Enter salva e o resultado vira um chip "2 anotações" com contador animado. Adição do Design System: capturar um pensamento durante a execução não pode tirar a pessoa do passo, então nada de modal, sheet ou nova tela.

## Quando usar

- No Modo Foco (desktop e celular), logo abaixo do título do passo, no mesmo lugar onde fica o chip de anotações.
- Não use para editar, apagar ou reordenar anotações: isso é na tela da atividade (planejar). Não use para campos com mais de uma linha, título, tags ou anexos.

## O que o consumidor fornece

- `List<Note> notes` (texto e hora) da atividade, só leitura aqui.
- `ValueChanged<String> onSave` chamado no Enter com o texto sem espaços nas pontas; texto vazio não salva.
- `bool open` controlado pelo pai (o botão "+ Anotar" do Foco e o atalho `N` abrem; `Esc` e "Cancelar" fecham).
- `String placeholder` (padrão "Um pensamento, uma frase nova…").
- Em Flutter: `TextField` de uma linha com `textInputAction: TextInputAction.done`, `AnimatedSwitcher` para o contador, `AnimatedSize` evitado (o slot tem altura fixa).

## Anatomia e medidas

- Slot de 48px de altura mínima sob o título, com largura até 560px: fechado mostra o chip; aberto mostra o composer no mesmo lugar, então nada abaixo se desloca.
- Composer: `surface-raised`, `radius-md`, contorno interno de 1px `border-control` mais hairline no topo; padding 12px à esquerda e 8px à direita; ícone `edit_note` 20px em `text-muted`; campo em `body` (15px) de 44px de altura; botão `Button` fantasma compacto "Cancelar" à direita. Com foco, o contorno vira 2px `violet-ink`.
- Chip: `.chip` do kit em `label`, ícone `sticky_note_2` 16px em `violet-ink`, contador tabular dentro de uma janela de 16px que rola na troca, e a palavra "anotação"/"anotações".
- Confirmação "Anotado": `caption` `text-secondary` com `check` 16px em `green-ink`, ao lado do chip, visível por 1,6s.
- Dica de teclado: `caption` `text-muted` com `<kbd>Enter</kbd>` em `chip` e `hairline-strong`.
- Lista: `.block` colapsável (`surface-raised`, `radius-md`), cabeçalho de 44px em `body-sm` com `expand_more` à direita; itens em grade "hora (44px, `caption` `text-muted`) + texto (`body-sm` `text-primary`)". Raio concêntrico: card 16 → bloco 12 → chip pílula.

## Estados

- Fechado: botão e chip (o chip não aparece sem anotações).
- Aberto: a linha aparece em `dur-fast` `ease-out` (4px de cima para baixo com fade) e já recebe foco; o chip some.
- Com texto: contorno de foco `violet-ink`; texto longo rola dentro do campo, uma linha só.
- Salvo: o composer fecha, o contador rola para o novo número em `dur-base`, "Anotado" aparece e some em `dur-exit` `ease-in`; o item entra no fim da lista com a hora atual.
- Erro (sem rede): nada muda para a pessoa; salva local e sincroniza depois, conforme "Estados de rede e dados".
- Desabilitado: só quando a atividade acabou; o botão fica a 40% e a lista continua legível.

## Mobile e desktop

- Celular: o composer sobe junto com o teclado e fica ao alcance do polegar; o anel e as ações rolam para fora da tela enquanto o teclado está aberto. Alvo de toque de 48px no botão, no "Cancelar" e no cabeçalho da lista. `Enter` do teclado virtual salva.
- Desktop: largura até 560px centralizada sob o título; `Enter` salva, `Esc` fecha e devolve o foco ao botão "+ Anotar"; `N` abre quando o foco não está em um campo.

## Movimento

- Abrir: `dur-fast`, `ease-out`, só `opacity` e `transform`. Fechar: instantâneo (o campo some e o chip volta), para não atrasar a volta ao passo.
- Contador: `transform` de 16px em `dur-base`, `ease-out`, com o número antigo saindo para cima e o novo entrando de baixo.
- "Anotado": entra em `dur-fast` `ease-out`, sai em `dur-exit` `ease-in`.
- Seta da lista: `rotate(180deg)` em `dur-base`, `ease-in-out`.
- Reduzir movimento: sem deslocamento no composer e no contador; só trocas diretas.

## Acessibilidade

- Botão "+ Anotar" com `aria-expanded` e `aria-controls` apontando para o composer; o campo tem `aria-label="Nova anotação"`.
- Salvar anuncia "Anotado" por `aria-live="polite"` (o mesmo texto visível).
- Cabeçalho da lista é `button` com `aria-expanded`; os itens são texto comum (sem controles).
- Contraste: `text-muted` do placeholder 4,5:1 sobre `surface-raised`; `violet-ink` do foco 6,2:1.
- Em Flutter: `Semantics(button: true, expanded: open)` no botão; `TextField` com `autofocus` quando abre.

## Faça e não faça

- Faça: uma linha, Enter salva, o resto da tela fica parado.
- Faça: mostrar o contador e a confirmação discreta; nunca um toast cobrindo o anel.
- Não faça: modal, sheet, segunda linha, formatação ou anexos no Foco.
- Não faça: permitir editar ou apagar aqui; isso é na tela da atividade.
- Não faça: fechar o composer com clique fora sem salvar sem avisar; se há texto, "Cancelar" e `Esc` descartam de forma explícita.
