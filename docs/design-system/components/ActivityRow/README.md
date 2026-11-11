O ActivityRow é a linha de "Próximas atividades": horário, título, ponto e nome do objetivo, duração e um status sempre dito em palavra e ícone.

## Quando usar

- Em listas de atividades do dia (seção "Próximas atividades" do dashboard e a linha do tempo do dia nas telas de Tempo e objetivos).
- Não use para tarefas sem horário nem para itens de finanças.

## O que o consumidor fornece

- `ScheduledActivity activity`: `title`, `start`, `end`, `goalTitle` e `goalColor` (ambos nulos quando a atividade é obrigatória).
- O status (`done`, `current`, `next`, `missed`) é calculado pelo pai a partir de `now`. Na seção "Próximas atividades" do app hoje só aparecem atividades futuras; os quatro status valem para a linha do tempo completa.
- `VoidCallback onTap` opcional, para abrir os detalhes.
- A `UpcomingSection` recebe `List<ScheduledActivity>` e mostra o título "Próximas atividades" em `title` dentro de um `card`; com a lista vazia, mostra "Nada mais agendado para hoje" em `body-sm` e `text-secondary`.

## Anatomia e medidas

- Linha: raio `radius-md`, padding `space-8` na vertical e `space-12` na horizontal, altura mínima `touch-min` (48) no celular e `hit-min` (32) no desktop. Entre linhas, `space-4`. A lista avança `space-12` para fora do padding do card para o texto alinhar com o título.
- Horário: 15/22, peso 600, números tabulares, 48 de largura no celular e 56 no desktop.
- Título: `title-sm` em `text-primary`, até 2 linhas com reticências. Objetivo: ponto de 8px (`radius-full`) na cor `goal-*` ou `goal-obligatory`, vão `space-8`, e o nome em `caption` `text-secondary`, uma linha; para atividade obrigatória, a palavra "Obrigatória".
- Duração: `body-sm`, peso 600, tabular, alinhada à direita ("45 min", "1 h 20"); a unidade ("min", "h") é um `small` em `text-secondary`, peso 500.
- Status: ícone de 16px e palavra em `caption`, sempre juntos.
  - Feita: `check_circle` e "Feita", em `green-ink`; o título passa para `text-secondary`.
  - Agora: `play_circle` e "Agora", em `violet-ink`; a linha inteira fica em `surface-tint` com hairline no topo. É a única linha com fundo em repouso.
  - Próxima: `schedule` e "Próxima", em `text-secondary`.
  - Não feita: `history` e "Não feita", em `text-secondary`, com a frase "Sem problema, dá para retomar quando quiser." em `caption`. Nunca vermelho.
- Vão de 12 entre horário, texto e fim.

Hoje no Flutter: a linha não tem status nem estados; o objetivo é uma tarja de 3px à esquerda; título em 14, objetivo em 11, duração em 16 e o espaço entre linhas é 18.

## Estados

- Normal: sem fundo (a linha "Agora" é a exceção, em `surface-tint`).
- Hover (só com ponteiro fino, `@media (hover: hover) and (pointer: fine)`): fundo `surface-raised` com hairline no topo, em `dur-instant`.
- Pressionado: escala 0,985 em `dur-fast` (`ease-out` ao apertar, `ease-spring` ao soltar) e fundo `surface-raised`; é o equivalente de hover no celular.
- Foco: anel `violet-ink` de 2px com 2px de afastamento.
- Desabilitado: não se aplica a uma atividade da agenda; se a linha ficar indisponível, 40% de opacidade e o motivo em legenda.
- Carregando: três esqueletos (`skel`) na forma da linha (raio `radius-md`, altura 48).
- Vazio: "Nada mais agendado para hoje". Erro: texto "Não foi possível carregar a agenda." com "Tentar de novo".

## Mobile e desktop

- Celular: duração e status empilhados à direita, o texto ocupa o resto; sem hover.
- Desktop: quatro colunas (horário, texto, duração, status), hover visível, atalhos de teclado (setas sobem e descem entre linhas, Enter abre).
- O texto longo termina em reticências dentro da própria linha; nada empurra a página para o lado.

## Movimento

- Hover e foco de cor em `dur-instant` com `ease-out`; pressionar em `dur-fast` com `ease-out` e soltar com `ease-spring`.
- Conclusão de atividade: o check (`check` do kit) entra com mola e a palavra "Feita" aparece junto; a linha pode soltar um `pulse` único. Sem confete.
- Reduzir movimento: sem escala nem mola, só troca de cor.

## Acessibilidade

- Cada linha é um item só, lido como "08:00, Estudo de inglês, Inglês, duração 1 h, Agora".
- O objetivo é sempre dito pelo nome ao lado do ponto; a cor do ponto é só apoio. O status sempre traz ícone e palavra; o fundo `surface-tint` da linha atual é reforço.
- `text-primary`, `text-secondary`, `green-ink` e `violet-ink` passam 4,5:1 sobre `surface`, `surface-raised` e `surface-tint` nos dois temas.
- Alvo de toque de 48px no celular; teclado: Tab entra na lista, setas percorrem, Enter ou Espaço ativam.

## Faça e não faça

- Faça: mostre o objetivo pelo nome ou por "Obrigatória", nunca só pelo ponto colorido.
- Faça: para "não feita", use tom neutro e uma frase gentil que convide a retomar.
- Faça: mantenha duas linhas no máximo para o título e reticências depois disso.
- Não faça: vermelho, ponto de exclamação, contagem de atrasos ou riscado em atividades não feitas.
- Não faça: não esconda a duração ou o status atrás de hover.
