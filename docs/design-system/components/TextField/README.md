Campo de uma linha em bloco com hairline, rótulo acima, ajuda e erro em texto, nas variantes texto, senha, valor em reais, duração em minutos (passo de 5) e data e hora. Adição do Design System: o app ainda não tem formulários, e a E1 (cadastro de objetivo, passos com estimativa, lançamento de gasto, login) precisa de um campo único e acessível.

## Quando usar

- Qualquer entrada de uma linha: nome, senha, valor, duração, data e hora.
- A variante de duração é o campo das estimativas dos passos e da duração das atividades: sempre em minutos, de 5 em 5.
- Texto longo pede área de texto (a definir); escolhas fechadas pedem chip, seletor ou lista.

## O que o consumidor fornece

- `String label` (obrigatório e sempre visível; o texto de exemplo nunca substitui o rótulo).
- `TextEditingController` e `ValueChanged<String>`; `String? helperText`; `String? errorText` (não nulo ativa o erro).
- `int? maxLength` para o contador; `bool enabled`; `TextInputType` e formatadores por variante.
- Senha: `obscureText` com botão mostrar e ocultar. Valor: prefixo "R$", teclado decimal, vírgula. Duração: `int minutes`, `step` (5), `min` (5) e `max` (480), com botões de menos e mais e setas do teclado. Data e hora: abre o seletor nativo.

## Anatomia e medidas

- Rótulo acima em `label`, `text-primary`, vão `space-8` até o campo.
- Campo: `.block` do kit (`surface-raised`, `radius-md`, hairline no topo) com traço interno de 1px `border-control` (3:1) em repouso. Altura mínima 48, padding horizontal `space-16`. Texto digitado em `body` (`text-primary`); exemplo em `text-muted`. Números em `tabular-nums`.
- Prefixo "R$" e sufixo "min" em `text-secondary`, 15px, fora da área editável.
- Duração: botões de menos e mais com 32px visíveis e 48px de toque (`::after` de 8px), raio `radius-sm`, ícone de 20px em `text-secondary`; o número fica alinhado à direita junto do "min".
- Abaixo: ajuda em `caption` com `text-secondary` e contador à direita em `caption` `text-muted` ("12/40").
- Erro: troca a ajuda por ícone `error` de 16px mais mensagem em `caption` com `danger`; o traço interno passa a `danger` (1px). Sem fundo vermelho.
- Mostrar e ocultar senha: botão de 32px no fim do campo, com 48px de toque.

Hoje no Flutter: o app ainda não tem campos de texto.

## Estados

- Normal: bloco com traço `border-control`; exemplo em `text-muted`.
- Hover (só `@media (hover: hover) and (pointer: fine)`): traço passa a `text-secondary`.
- Foco: o traço some; anel sólido de 2px `violet-ink` e halo de 6px em `violet` a 10%. Em erro com foco, o anel prevalece.
- Preenchido: igual ao normal, com o texto em `text-primary`.
- Desabilitado: 40% de opacidade, sem foco nem hover.
- Erro: traço `danger`, ícone e mensagem que diz o que ajustar ("Informe um valor maior que zero.").
- Duração nos limites: o botão de menos desabilita em 5 e o de mais em 480.

## Mobile e desktop

- Celular: 48px de altura, largura total, teclado adequado ao tipo (`decimal`, `numeric`). O rótulo nunca vira só placeholder.
- Desktop: mesma altura, largura limitada pelo formulário (até ~65 caracteres); hover visível; `Tab` na ordem visual; `Enter` envia; setas para cima e para baixo mudam a duração em 5.

## Movimento

- Traço, anel e fundo trocam em `dur-instant`, `ease-out`. O anel de foco aparece sem deslocamento.
- Botões de menos e mais: pressionar em `dur-fast` `ease-out` (0,94), soltar em `ease-spring`.
- A mensagem de erro aparece sem deslocar o campo. Reduzir movimento: sem transições nem mola.

## Acessibilidade

- Rótulo associado ao campo; ajuda e erro ligados por descrição; erro anunciado como alerta e `aria-invalid`.
- Botões de menos e mais com rótulos "Menos 5 minutos" e "Mais 5 minutos"; mostrar e ocultar senha com rótulo que muda e estado pressionado.
- Contraste: `text-primary`, `text-secondary` e `danger` sobre `surface-raised` acima de 4,5:1 nos dois temas; traço `border-control` 3:1; anel `violet-ink` mínimo 6,2:1.
- Cor sozinha nunca indica erro.

## Faça e não faça

- Faça: rótulo sempre visível e ajuda curta que antecipa o formato.
- Faça: estimativas sempre em minutos, de 5 em 5, com a unidade em `text-secondary`.
- Faça: valores em reais com vírgula decimal ("R$ 1.234,50").
- Não faça: borda sólida pesada ou fundo vermelho no erro; o traço de 1px, o ícone e o texto bastam.
- Não faça: mensagem que culpa ("Você errou"); diga o que ajustar.
