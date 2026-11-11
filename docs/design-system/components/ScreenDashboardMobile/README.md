A Visão geral na classe compact (até 599 px) na linguagem "brasa": coluna única sobre a aurora, card Agora aceso logo abaixo da saudação, anéis de 88 px, cards de seção e um dock fixo em glass com o CTA "Continuar" e a BottomNav.

## Propósito
A mesma tela do desktop, pensada para uma mão e para o polegar: o que importa agora no topo, a ação principal e a navegação ao alcance embaixo.

## Composição (compact)
- **Fundo**: `body` com `aurora`.
- **AppTopBar** compacta (`topbar` sólida, 56 px, hairline inferior): BrandLogo, Buscar, Notificações e perfil, com alvos de 48 px. O botão Módulos sai da barra e vira o quinto item da BottomNav.
- **Hero** (`hero-band` com hairline, padding `space-24` em cima e `space-32` embaixo, margem `page-pad-compact`): data em `body-sm`, saudação em `display` (28 px), o **NowCard** (`navy breathe`, largura total, padding `space-20`, altura que cresce com a fonte), o rótulo "Seu dia" em `title-sm` e três **MetricRing** de 88 px em coluna, só o do dia aceso.
- **Corpo** (`space-24` entre cards): "Próximas atividades" (**ActivityRow** em `card`), "Objetivos ativos" (**GoalChip** em 2 colunas na variante compacta, bloco de duas linhas), **RhythmCard** e "Frentes da vida" (**ModuleTile** em 2 colunas: o disponível ocupa a linha, os Em breve em coluna com `ico-tile sm`). Padding inferior de 196 px para o conteúdo não ficar sob o dock.
- **Dock fixo** em glass: o CTA "Continuar · Estudo de inglês · faltam 40 min" (`glass`, `radius-lg`, 56 px, ícone em `ico-tile orange sm`, margem `space-16`) `space-12` acima da **BottomNav** (`glass`, hairline-strong no topo, 5 destinos: Hoje, Grade, Objetivos, Foco e Módulos, pílula em `surface-tint` com ícone `violet-ink` no atual, inset inferior de 20 px somado ao padding). O CTA só existe quando há atividade agora.
- Margens laterais de `page-pad-compact` (16 px).

## Estados
- **Preenchido** (o mostrado).
- **Carregando**: esqueletos nas formas de cada card; o dock já aparece (sem CTA).
- **Vazio**: "Sem rotina hoje" no NowCard (em repouso, sem glow), sem CTA no dock, **EmptyState** nos objetivos; os anéis aparecem zerados.
- **Erro**: faixa de mensagem com "Tentar de novo" abaixo da saudação; dados locais mantidos.

## Movimento de entrada
Igual ao desktop, em duas ondas: hero (`rise hero`, 240 ms), depois Próximas e Objetivos (`--w:0`), depois Ritmo e Frentes (`--w:1`). Anéis e barras preenchem uma vez com cabeça luminosa; o card Agora respira. Toque: cards, linhas, chips e a pílula da BottomNav encolhem em `ease-out` e voltam com `ease-spring`; não há hover. Com "reduzir movimento", tudo aparece junto e já no valor final, sem mola.

## Acessibilidade
Rótulo semântico em anéis, linhas, chips e no CTA ("Continuar Estudo de inglês, faltam 40 minutos"); `aria-current` no destino atual; alvos de 48 px; `text-secondary` e `text-muted` passam 4,5:1 sobre as superfícies glass porque o fundo desfocado é quase a própria `surface`; a fonte do sistema pode chegar a 2× sem altura fixa.

## Hoje no Flutter
O app compact usa só a barra superior, sem BottomNav nem CTA, e anéis de 64 px. O dock em glass, os anéis de 88 px e os cards de seção são propostas do DS (`responsive.md`).
