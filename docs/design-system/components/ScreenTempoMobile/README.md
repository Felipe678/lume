A ScreenTempoMobile é a tela "Tempo e objetivos" no celular: carrossel de objetivos com o próximo card aparecendo pela borda, o dia em dois grupos no mesmo painel, um CTA fixo em glass acima da BottomNav quando há atividade agora e o detalhe da atividade aberto como Sheet em glass com passos e CTA fixo. Adição do Design System: é a versão compact da `ScreenTempo`, pensada para o polegar; o app ainda não tem esta tela.

## Quando usar

- Como destino "Tempo" da BottomNav em telas compact (até 599 px).
- Para ver o dia de relance, abrir o detalhe de uma atividade e planejar passos; executar é no Foco, aberto pelo CTA.
- Em medium e wide, use `ScreenTempo`.

## O que o consumidor fornece

- Os mesmos dados da `ScreenTempo`: `goals`, `day`, `tasks` (com `steps` e `notes`), `now`, `selectedTaskId` (abre o Sheet) e os callbacks `onSelectGoal`, `onNewGoal`, `onPrevDay`, `onNextDay`, `onNewTask(kind)`, `onOpenTask`, `onCloseSheet`, `onToggleStep`, `onAddStep`, `onEnterFocus(taskId)`.
- `Task? nowTask`: quando existe, o CTA fixo "Continuar" aparece acima da BottomNav.
- `EdgeInsets safeArea`: a BottomNav e o rodapé do Sheet somam o inset inferior ao próprio padding.

## Anatomia e medidas

- Coluna única com margem `page-pad-compact` (16) e vão `space-24` entre seções; fundo `.aurora`. Cabeçalho com "Tempo e objetivos" em `display`, data e hora em `caption` e avatar de 40 px.
- Objetivos: título em `title`, "4 ativos · 1 na fila" em `body-sm`, botão "Novo objetivo" só ícone (`.btn.secondary.icon`, 44 px). Carrossel com `scroll-snap-type: x mandatory`, `scroll-padding` de 16, cards `GoalCard` compactos de 280 px e vão `space-12`; sobram 94 px do card seguinte (peek). O carrossel sangra até as bordas da tela.
- Hoje: "Hoje" em `title`, "seg, 9 nov" e setas de dia de 36 px. Painel `.card` com padding `space-8`, `TaskGroupHeader` compactos (barra de 48 px, "Nova" só ícone com 44 px) e `TaskRow` compactas de duas linhas (hora 44, principal, ação 44; passos, duração e estado na segunda linha). Rolagem vertical com 180 px de respiro no fim para não ficar atrás do CTA e da BottomNav.
- CTA fixo: faixa `.glass` (`surface-glass`, `blur-glass`, `elev-3`, `radius-lg`) a 12 px da BottomNav, com "AGORA" em `overline` `orange-ink`, "Estudo de inglês · 40 min" em `title-sm` e o botão `.btn.ember` "Continuar" de 48 px (`radius-md`: raio concêntrico 16 → 12). É a brasa da tela.
- BottomNav em `.glass`, 5 destinos de 48 px, item atual em `violet-ink` com rótulo 700, inset inferior de 16 somado ao padding e indicador de gesto.
- Sheet em `.glass`: `radius-xl` no topo, até 90% da altura, alça de 36 × 4 e botão fechar de 44 px; corpo rolável com vão `space-20`: pill do objetivo e "AGORA", título em `headline`, horário em `caption`, `StepList` compacta (menu "⋯" por passo, títulos em até duas linhas), anotações em `.block`; rodapé fixo com hairline e `.btn.ember` de 52 px em largura total ("Continuar em foco" ou "Entrar em foco"). Com o Sheet aberto, o `scrim` cobre a página, o CTA fixo e a BottomNav.

## Estados

- Com atividade agora: linha acesa em laranja discreto e CTA fixo visível. Sem atividade agora: o CTA fixo não existe; a lista ganha o respiro só da BottomNav.
- Sheet aberto para atividade agora, futura, feita ("Rever atividade" em secundário) ou não feita ("Marcar feita"), como na tela desktop.
- Grupo recolhido, vazio e carregando: iguais aos componentes; o vazio da página usa `EmptyState` com "Nenhuma atividade hoje" e "Nova atividade" ao alcance do polegar.
- Pressionado: linha em `surface-raised`; botões com escala 0,97. Foco: anéis `violet-ink` (teclado externo).

## Mobile e desktop

- Esta é a versão compact. Em 320 px os cards do carrossel continuam com 280 px e o peek some; o texto do CTA fixo termina em reticências antes do botão.
- Com fonte do sistema a 1,3×, as linhas crescem (nenhuma altura fixa), o Sheet ocupa até 90% e rola; o rodapé do Sheet continua fixo.
- Em medium a tela vira `ScreenTempo` em uma coluna com o detalhe abaixo da lista.

## Movimento

- Entrada em duas ondas: cabeçalho e Objetivos como hero (`.rise.hero`), lista na onda 0 e CTA fixo na onda 1, dentro de `dur-page`.
- Sheet: sobe com `translateY(100%) → 0` em `dur-base` e `ease-out-quint`; fecha em `dur-exit` com `ease-in`; o `scrim` acompanha em opacidade. Arrastar a alça para baixo fecha (30% da altura ou gesto rápido).
- Concluir passo no Sheet: check com mola, pulso, segmento esfria e a mini-barra da linha atrás atualiza.
- CTA em brasa respira (`dur-breathe`). Único loop além do esqueleto.
- Reduzir movimento: Sheet e scrim só com fade curto; sem ondas, sem mola, sem respiração.

## Acessibilidade

- O Sheet é `role="dialog"` com `aria-modal`, foco inicial no botão fechar, Esc e toque no scrim fecham, e o foco volta à linha que o abriu. O conteúdo atrás fica inerte.
- A BottomNav tem rótulo "Navegação principal"; destinos "em breve" têm `aria-disabled` e rótulo "Saúde, em breve".
- Alvos de toque: linhas de 64 px, ícones de ação 44 px visuais com 48 px de toque, "Nova" 44 px, CTA 48 e 52 px.
- Estado em palavra ou ícone com texto; cor do objetivo acompanha o nome. `on-orange` sobre o CTA 8,0:1; `text-secondary` sobre `surface-glass` passa 4,5:1 nos dois temas porque o vidro é 80% opaco sobre o fundo.

## Faça e não faça

- Faça: deixe o CTA ao alcance do polegar e o Sheet com rodapé fixo; nada essencial só no topo.
- Faça: use glass só no que flutua: CTA fixo, BottomNav e Sheet. Cards e linhas continuam em `surface`.
- Faça: mantenha o peek do carrossel; ele ensina que há mais objetivos sem seta.
- Não faça: não abra o detalhe em outra tela; o Sheet mantém o dia visível por trás.
- Não faça: nenhum segundo botão laranja na tela; o ícone ▶ das linhas é `text-secondary`, exceto na linha de agora.
