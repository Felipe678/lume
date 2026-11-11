O NowCard é o card em gradiente deep navy que responde, de relance, "o que estou fazendo agora e o que vem depois"; é o elemento aceso da Visão geral.

## Quando usar

- Uma vez por dashboard, no topo (celular) ou ao lado dos anéis (desktop). Mostra a atividade em andamento da rotina de hoje.
- Não use para lista de atividades (use `ActivityRow`) nem para métricas (use `MetricRing`).

## O que o consumidor fornece

- `TodayAgenda agenda`: a lista ordenada de `ScheduledActivity` de hoje (título, início, fim, nome e cor do objetivo, ou nenhum se for obrigatória).
- `DateTime now`: o instante atual. O estado é derivado dele: `agenda.stateAt(now)` devolve `inActivity`, `freeTime`, `dayDone` ou `noRoutine`.
- Nenhum filho. Os textos vêm da agenda; a barra de progresso é recalculada a cada 30 s pelo pai.

## Anatomia e medidas

- Largura máxima 330 (no desktop pode esticar até 360 na coluna do hero), altura mínima 200 multiplicada pela escala de fonte do sistema (de 1× a 2×). Nenhuma altura é fixa em texto: o card cresce.
- Superfície: classe `navy` do kit: `linear-gradient(135deg, card-1 0%, card-2 38%, card-3 72%, card-4 100%)`, raio `radius-lg`, hairline interna no topo (branco a 14%) em vez de borda, brilho `shadow-glow-card`.
- Padding `space-24` (`space-20` em celular estreito).
- Sobretítulo `overline` (AGORA ou HOJE) em `card-fg` a 80%. Título `headline` em `card-fg`, uma linha com reticências. Apoio `body-sm` em `card-fg-muted`. Horário e "faltam 25 min" em `label` com números tabulares; a unidade ("min") é um `small` em `card-fg-muted`, peso 500.
- Barra de progresso: classe `bar lit` do kit, 6px, pílula, trilho `card-fg` a 15%, preenchimento `card-fg` com cabeça luminosa de `glow-head` (24px) e brilho da mesma cor. Entre horário e barra, `space-8`; depois, `space-12` até "Depois: Treino · 09:30".
- Os quatro estados e seus textos:
  - Em atividade (aceso): AGORA, título da atividade, nome do objetivo (ou "Obrigatória"), "08:00 – 09:00", "faltam 25 min", barra, e por último "Depois: Treino · 09:30" ou "Última atividade do dia". Leva `breathe`.
  - Tempo livre: AGORA, "Tempo livre", "Aproveite o intervalo", "Próxima: Treino às 09:30" e "em 12 min". Glow fixo, sem respirar.
  - Dia concluído (repouso): HOJE, "Dia concluído", "Nenhuma atividade restante. Descanse, amanhã tem mais." Sem glow: só a hairline (`hairline-strong`).
  - Sem rotina (repouso): HOJE, "Sem rotina hoje", "Monte sua grade em Tempo e objetivos para acompanhar o dia aqui." Sem glow.

Hoje no Flutter: padding 22, raio 16, borda sólida `card-border`, o texto do estado vazio cita "Tarefas e Rotina" e a barra de progresso tem raio 3 e preenchimento chapado.

## Estados

- O card não é um controle: não tem hover, pressionado nem desabilitado. Se um dia virar atalho para a tela de Tempo e objetivos, aplique `card lift` do kit (sobe 2px, `elev-2`) só com ponteiro fino, e o anel de foco `violet-ink` de 2px.
- Aceso e em repouso são estados visuais derivados da agenda (acima); nunca mais de um card aceso por tela.
- Carregando: esqueleto (`skel`) na mesma forma (mesmo raio e altura mínima).
- Vazio: os estados "Dia concluído" e "Sem rotina hoje" são o vazio deste card.
- Erro: não há; sem agenda, o card cai em "Sem rotina hoje".

## Mobile e desktop

- Celular (compact): ocupa a largura da página; fica logo abaixo da saudação, antes de "Seu dia". O CTA fixo "Continuar · Estudo de inglês · 40 min" acima da BottomNav repete a ação quando há atividade agora.
- Desktop (wide): coluna de 360 à esquerda do hero, esticado até a altura da coluna dos anéis; o card não sobrepõe o conteúdo abaixo do hero. No tablet (medium) acompanha a primeira coluna.
- A altura mínima de 200 só cresce com a fonte do sistema, nunca com a largura.

## Movimento

- Barra de progresso: avança em `dur-fast`, linear, atualizada a cada 30 s. Sem pulo.
- Respiração (`breathe`): brilho de 1 a 1,08 em `dur-breathe` (6 s), `ease-in-out`, só no estado em atividade. É o único loop da tela além do esqueleto.
- Entrada da tela: o card faz parte do hero e acende primeiro (`rise hero`, 240 ms, `ease-out-quint`).
- Reduzir movimento: respiração parada; a barra muda de valor sem transição; a entrada vira aparecimento direto.

## Acessibilidade

- O card é um contêiner semântico com o rótulo do estado ("Agora: Estudo de inglês").
- A barra tem papel de barra de progresso, valor de 0 a 100 e o rótulo "Progresso da atividade atual".
- `card-fg` tem no mínimo 10,3:1 e `card-fg-muted` 6,6:1 sobre o gradiente, nos dois temas.
- O significado nunca depende de cor nem de brilho: o estado está no texto ("Tempo livre", "Dia concluído").
- Com fonte a 2× o texto quebra ou termina em reticências dentro do card; nada empurra a página para o lado.

## Faça e não faça

- Faça: mantenha o título em uma linha com reticências e o texto de apoio em até 3 linhas.
- Faça: use `min-height` e deixe o card crescer com a fonte do sistema.
- Faça: escreva o vazio como convite ("Monte sua grade...") e nunca como cobrança.
- Não faça: nenhum contador regressivo pulsante, cor de alerta ou animação que chame atenção quando o tempo está acabando.
- Não faça: não acenda outro elemento na mesma tela, não troque o gradiente por cor chapada nem use `violet` ou o gradiente da logo neste card.
