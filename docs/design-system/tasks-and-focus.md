# Objetivos, atividades e foco

É a parte mais importante do Lume. Tudo o que o produto promete (tirar ruído, consistência, caminho do meio) acontece aqui. Esta seção define o modelo, as telas e as regras de comportamento. Os componentes são `GoalCard`, `TaskRow`, `TaskGroupHeader`, `StepList`, `StepProgress`, `FocusTimer`, `QuickCapture` e `FocusEnd`; as telas são `ScreenTempo`, `ScreenTempoMobile`, `ScreenFoco` e `ScreenFocoMobile`.

## Modelo mental

| Conceito | O que é | Campos |
|---|---|---|
| **Objetivo** | O que a pessoa quer alcançar. Dura semanas ou meses. | título, porquê, cor (`goal-*`), ícone ou emoji escolhido, prioridade (alta, média, baixa, sempre com palavra e ícone), estimativa de horas, "depois de" (fila), etapas (marcos), status (ativo, na fila, concluído, arquivado) |
| **Atividade** | Um bloco de tempo em que a pessoa age. | título, tipo (**cotidiana** ou **de objetivo**), objetivo e etapa ligados (se for de objetivo), dias e horário, duração estimada, passos, anotações, status do dia (próxima, agora, feita, não feita) |
| **Passo** | Uma subtarefa pequena dentro da atividade, de 5 a 25 minutos. | título, estimativa em minutos, feito, anotações |
| **Anotação** | Um pensamento ou comentário capturado durante a execução. | texto, hora, passo (opcional) |
| **Foco** | O estado de executar uma atividade, passo a passo. | atividade, passo atual, tempo do passo, tempo da atividade, pausado |

Cotidianas e de objetivo são **grupos separados no mesmo painel**. Nunca em telas diferentes: o dia é um só.

## Planejar e agir são momentos diferentes

- **Planejar** acontece em "Tempo e objetivos": criar objetivo, dividir em etapas, criar atividade, dividir em passos com estimativa, reordenar, editar.
- **Agir** acontece no **Foco**: ver o passo atual, concluir passo, anotar rápido, pausar, sair. No Foco não existe editar, reordenar, criar passo, trocar atividade, menu de módulos nem notificação do app. Se a pessoa percebe que o plano está errado, ela sai do Foco (com "Desfazer" por 6s) e ajusta em "Tempo e objetivos".

## Tela "Tempo e objetivos"

- **Objetivos** no topo, como carrossel horizontal de `GoalCard` (snap; setas no desktop; no celular, o próximo card aparece 24px). Cada card mostra: ícone, título, porquê em uma linha, prioridade (palavra e ícone), barra de etapas em `orange` com cabeça luminosa, próxima etapa, consistência "5 de 7 dias" em 7 pontos, horas investidas de estimadas. Selecionar um objetivo filtra a lista de atividades abaixo (chip "Filtrando por Inglês fluente" com x).
- **Hoje** abaixo, com navegação de dia (ontem, hoje, amanhã) e "Nova atividade".
- **Lista** em coluna: `TaskGroupHeader` "Cotidianas · 1 de 3 feitas" com `TaskRow`s, depois `TaskGroupHeader` "De objetivos · 0 de 4 feitas" com `TaskRow`s. Cada linha: hora, título, pill do objetivo ou "Rotina", mini-segmentos dos passos, duração, botão "Entrar em foco" (hover e foco no desktop; ícone sempre visível no celular). A linha "agora" é a única acesa (`glow-orange` discreto na borda esquerda).
- **Detalhe** à direita no desktop (`surface-tint`, `elev-2`) e como Sheet no celular: título, objetivo e etapa, horário e duração, `StepProgress` (3 de 5), `StepList` editável, anotações, e o CTA `ember` "Entrar em foco". É o único botão laranja da tela.
- Estados: carregando (esqueleto das linhas), vazio ("Nenhuma atividade hoje. Crie uma ou traga uma rotina." com ação), erro ("Não foi possível carregar o dia." com "Tentar de novo").

## Foco

- **Barra mínima** no topo: ponto na cor do objetivo, "Estudo de inglês · Inglês fluente", Pausar, Sair. Tudo em `text-secondary`; nada chama atenção.
- **StepProgress** da atividade: um segmento por passo. Feitos em `violet`, atual preenchendo em `orange` → `ember` com `glow-orange`, próximos vazios. Abaixo, "Passo 3 de 5".
- **Título do passo** em 40px no desktop e 28px no celular. Troca com cross-fade.
- **FocusTimer**: anel fino do passo com cabeça luminosa e o **tempo do passo** no centro (72px no desktop, 56px no celular, tabular). É o protagonista. O **tempo da atividade** fica no rodapé em `text-secondary`: "32 min restantes na atividade · termina 15:00". Os dois tempos existem; só um grita.
- **Ações**: "Concluir passo" (primário) e "Anotar" (secundário, abre o `QuickCapture` inline). No celular, fixas no rodapé; deslizar para a esquerda também conclui.
- **Passou do tempo do passo**: o anel completa e fica laranja estável, com "+02:10" discreto. Sem vermelho, sem piscar, sem som. A mensagem aparece só ao concluir: "Levou 12 min a mais. Tudo bem, isso ajusta a próxima estimativa."
- **Pausar**: o glow para de respirar e o número vai para `text-secondary`. **Sair**: Toast "Saiu do foco" com "Desfazer" por 6s; nada de "tem certeza?".
- **Último passo** leva ao `FocusEnd`: "Estudo de inglês concluído", um pulso de luz violeta no ícone, resumo (passos, tempo real de estimado, anotações, consistência com o ponto de hoje acendendo), e "Próxima: Revisão de código · 15:30" ou "Encerrar por hoje".

## Regras que não mudam

- Cor nunca é o único sinal: prioridade tem palavra e ícone; status tem ícone ou palavra; objetivo tem nome ao lado do ponto.
- Estimativas são da pessoa; o app registra o real e sugere ajuste. Nunca cobra.
- "Não feita" é neutra: "Sem problema, dá para retomar quando quiser." Nunca vermelho.
- Consistência substitui sequência: "5 de 7 dias", nunca "sequência quebrada".
- Nada vibra, toca ou pisca ao concluir. O pulso de luz é a única celebração.
