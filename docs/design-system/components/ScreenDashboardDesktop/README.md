A Visão geral na classe wide (1080 px ou mais) na linguagem "brasa": fundo com aurora, hero em faixa com o card Agora aceso à esquerda e os três anéis à direita, e abaixo uma grade de 12 colunas em cards, chegando em duas ondas.

## Propósito
Dar, de relance, a resposta a "o que faço agora e como está meu dia". É a tela de abertura do app; tudo o que não é urgente fica a um clique (menu Módulos, destinos da barra superior). Uma única fonte de luz: o card Agora.

## Composição (wide)
- **Fundo**: `body` com `aurora` (dois radiais quase invisíveis, `aurora-1` e `aurora-2`). Nada mais tem fundo chapado.
- **AppTopBar** (`topbar` sólida, mínimo 64 px, hairline inferior): BrandLogo, destinos (Hoje, Grade, Objetivos, Foco; o atual em `chip`), busca em `block`, Módulos, Relatórios, Notificações e perfil. Os destinos na barra são uma proposta do DS (hoje o app não tem links na barra).
- **Hero** (`hero-band` com hairline inferior, `space-32` em cima e embaixo, conteúdo até `content-max`): grade de 360 px + resto, vão `space-40`. À esquerda o **NowCard** (`navy breathe`, único glow da tela) esticado até a altura da coluna direita. À direita a data em `body-sm`, a saudação em `display-lg` ("Boa tarde, Felipe"), o rótulo "Seu dia" em `title-sm` e três **MetricRing** de 104 px em coluna (valor e nome embaixo), `space-40` entre eles; só o anel do dia (violet) é aceso. Nada sobrepõe o hero.
- **Corpo** (`grid-12`, vão `space-24`, `space-32` depois do hero): linha 1 com "Próximas atividades" (7 colunas, **ActivityRow** em `card`) e "Objetivos ativos" (5 colunas, **GoalChip** em `card`, com o rodapé "4 objetivos ativos · 14 de 26 etapas feitas" em `caption`); linha 2 com o **RhythmCard** (7 colunas, hoje aceso em cyan) e "Frentes da vida" (5 colunas, **ModuleTile**: o disponível em `card lift` ocupando 2 colunas, os Em breve na variante densa em 2 × 2). Os cards de uma linha têm a mesma altura.
- Rodapé de 40 px com hairline superior e "© 2026 Lume" em `caption`.
- Raios concêntricos: card 16 → bloco 12 → ícone 8 → barra 4.

## Estados
- **Preenchido** (o mostrado): dados de exemplo de uma segunda-feira, 14:20.
- **Carregando**: esqueletos (`skel`) com o mesmo raio e altura de cada card; sem spinner de tela cheia.
- **Vazio**: o NowCard diz "Sem rotina hoje" (em repouso, sem glow) e leva à grade; "Próximas atividades" mostra "Nada mais agendado para hoje"; "Objetivos ativos" mostra **EmptyState** com o próximo passo ("Criar primeiro objetivo").
- **Erro**: mensagem em uma linha com ação "Tentar de novo" no topo do corpo; os dados locais continuam visíveis. Sem conexão, a legenda "Sem conexão. Suas mudanças serão enviadas quando voltar." aparece em `caption`, sem bloquear a tela.

## Movimento de entrada
Duas ondas, tudo dentro de `dur-page` (480 ms): o hero acende primeiro (`rise hero`, 240 ms, `ease-out-quint`); a linha 1 chega em `--w:0` (60 ms depois) e a linha 2 em `--w:1` (180 ms), cada card subindo 10 px em `dur-base`. Nada de fade-up por card. Quando o hero termina (240 ms), os anéis preenchem de 0 ao valor em `dur-slow` com `ease-settle`, com a cabeça luminosa na ponta; as barras do ritmo crescem da base a partir de 300 ms, 30 ms entre elas. O card Agora respira em `dur-breathe`. Hover só com ponteiro fino (`card lift`, linhas, chips). Com "reduzir movimento": tudo aparece junto, anéis e barras já no valor final, respiração parada. O botão "Repetir entrada" no topo da prévia reinicia a sequência; o parâmetro `?still=1` pula para o estado final (usado nas capturas).

## Melhorias do DS em relação ao app
Aurora no fundo, cards com `elev-1` e hairline em vez de borda, uma única fonte de luz (o card Agora), anéis com cabeça luminosa e glow só no anel em andamento, saudação em `display-lg`, duração com a unidade em `text-secondary`, legenda no gráfico e, principalmente, o Ritmo deixa de invadir o hero: a composição é uma grade de 12 colunas em duas linhas alinhadas.
