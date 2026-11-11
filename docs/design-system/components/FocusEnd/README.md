Tela de encerramento calma da atividade: "Estudo de inglês concluído" com um único pulso de luz violeta no ícone, resumo em blocos (passos, tempo, anotações, consistência), mensagem gentil quando passou do tempo e as ações "Próxima" ou "Encerrar por hoje". Adição do Design System: o Modo Foco precisa fechar a atividade sem celebração ruidosa e já apontar o que vem depois.

## Quando usar

- Quando o último passo da atividade é concluído no Modo Foco; substitui o conteúdo da tela no lugar (não é diálogo).
- Também ao concluir uma atividade sem passos a partir do detalhe, com os mesmos blocos.
- Não use para fechar o dia (isso é outra tela), nem para atividades canceladas ou puladas (volta à grade com Toast).

## O que o consumidor fornece

- `Activity activity` (título, objetivo, horário planejado), `int stepsDone`, `int stepsTotal`.
- `Duration spent` e `Duration estimate`; a diferença decide a mensagem gentil.
- `List<Note> notes` (expansível, só leitura).
- `Consistency consistency`: os últimos 7 dias com feito/não feito e o dia de hoje.
- `Activity? next` com horário para o botão primário; sem próxima, o primário vira "Voltar à grade".
- `VoidCallback onNext`, `VoidCallback onEndDay`.

## Anatomia e medidas

- `.card` (`surface`, `radius-lg`, `elev-1`) com padding 32px, largura até 620px, centralizado; no celular, sem card: os blocos ficam direto na `.aurora`.
- Ícone `.ico-tile.violet` de 48px com `check`, com `.pulse` em `--c: var(--violet)` disparado uma vez ao abrir.
- Título `headline` em `text-primary` ("Estudo de inglês concluído"); apoio `body-sm` `text-secondary` ("Inglês fluente · 14:00–15:00").
- Resumo: grade 2 × 2 de `.block` (`surface-raised`, `radius-md`, hairline) com padding 16px: rótulo `caption` `text-secondary`, valor `title` tabular com unidade em `small` `text-secondary` ("5 de 5", "58 min", "3", "5 de 7 dias"). Passos traz a `.seg` toda em `.done`; Tempo traz "estimado 60 min" em `caption` `text-muted`; Anotações é um botão que expande o bloco para a largura toda com a lista "hora + texto"; Consistência traz 7 pontos de 10px com iniciais dos dias em `micro`.
- Pontos de consistência: feitos em `violet`, não feitos em `ring-track`, o de hoje aceso (`violet` com sombra de 12px de `violet-ink` a 70% e escala 1,2) e a inicial em `text-primary`.
- Mensagem gentil (só quando passou do tempo): `.block` ocupando as duas colunas em `surface-tint`, ícone `spa` 20px em `violet-ink`, texto `body-sm` `text-primary`: "Levou 12 min a mais. Tudo bem, isso ajusta a próxima estimativa."
- Ações: `Button` primário "Próxima: Revisão de código · 15:30" (horário em `small` a 80%) e `Button` fantasma "Encerrar por hoje". Raio concêntrico 16 → 12 → 8.

## Estados

- Padrão (no tempo): sem mensagem gentil; Tempo mostra "58 min" e "estimado 60 min".
- Passou do tempo: bloco gentil presente; nada em `danger`.
- Sem anotações: o bloco mostra "0" e "nenhuma nesta atividade", sem botão de expandir.
- Sem próxima atividade: primário "Voltar à grade"; fantasma "Encerrar por hoje" permanece.
- Anotações expandidas: o bloco ocupa a linha inteira; a seta gira.
- Carregando: esqueleto dos quatro blocos.

## Mobile e desktop

- Celular: blocos em 2 colunas com `page-pad-compact`; CTA fixo em `.glass` no rodapé (primário de 48px e fantasma abaixo), com o inset de gestos somado ao padding; o conteúdo rola por trás com 140px de folga.
- Desktop: card de até 620px centralizado na coluna; ações em linha com o primário à esquerda.
- Fonte maior: os blocos quebram em 1 coluna quando a largura do valor não cabe.

## Movimento

- Entrada: a tela do Foco faz cross-fade para o encerramento em `dur-base`; o card entra com `.rise.hero` (240ms) e os blocos em uma onda (`.rise` com `--w: 1`), dentro de `dur-page`.
- Pulso: `.pulse.go` em `dur-pulse`, `ease-out-expo`, uma vez; é a única celebração.
- Expandir anotações: a seta gira em `dur-base` `ease-in-out`; a lista aparece sem animar altura.
- Reduzir movimento: sem pulso e sem onda; só fade curto.

## Acessibilidade

- O card é `role="region"` com `aria-label="Atividade concluída"`; o título é `h2`.
- A consistência tem `aria-label` textual ("Últimos 7 dias: 5 feitos, hoje incluído"); os pontos são decorativos.
- O botão de anotações tem `aria-expanded` e `aria-controls`.
- Contraste: `text-secondary` sobre `surface-raised` 5,9:1 no escuro; `violet-ink` sobre `surface-tint` acima de 6:1; o primário usa `on-violet` 7,4:1.
- Alvo de toque de 48px nos dois botões e no cabeçalho de anotações.

## Faça e não faça

- Faça: um pulso, uma frase gentil, uma próxima ação. Nada mais brilha.
- Faça: mostrar o estimado ao lado do real; é informação, não cobrança.
- Não faça: confete, som, vibração, "parabéns" em caixa alta ou pontuação de gamificação.
- Não faça: escrever "atrasou" ou "falhou"; use "levou 12 min a mais".
- Não faça: forçar a próxima atividade; "Encerrar por hoje" tem o mesmo acesso.
