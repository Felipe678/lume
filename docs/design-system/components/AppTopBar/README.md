A barra superior do app: logo à esquerda, busca e ações à direita, com o botão Módulos que abre o menu de módulos. É sólida (`topbar`) e se separa do conteúdo por uma hairline, não por borda.

## Quando usar
- Em toda tela do app nas classes medium e wide, fixa no topo, dentro de `AppPageScaffold`.
- No celular (compact) ela não é a navegação principal: Módulos e os destinos ficam na `BottomNav`. Se a tela compact mantiver uma barra superior, ela leva só logo, busca e perfil.
- Não coloque ações específicas de uma tela aqui; elas ficam no conteúdo da tela.

## O que o consumidor fornece
- `bool compact`: escolhe o layout reduzido (hoje o corte é a largura de 1080, `Breakpoints.desktop`; o DS passa a usar a classe de largura, medium abaixo de `bp-wide`).
- Nada mais: a barra lê `AppNavigation.currentPath` para marcar o módulo aberto no menu e abre `ModulesMenuRoute` ancorada no botão Módulos.
- `AppPageScaffold` monta a página: `SafeArea`, barra, corpo rolável (`bodyBuilder(context, wide)`) sobre o fundo `aurora` e `AppFooter`. `ContentWidth` centraliza o conteúdo até `content-max` (1048) com margem `page-pad-wide`.

## Anatomia e medidas
- Fundo `topbar` sólido (nunca glass: a barra não flutua), altura mínima de 64 (nunca fixa; cresce com a fonte), padding horizontal `space-24` (hoje 20 no wide e 12 no compact). Separação do conteúdo: hairline de 1px (`hairline`) na borda inferior, sem borda sólida.
- Wide: `BrandLogo`, vão `space-48` (hoje 72), campo de busca de até 320, depois ícones Módulos (`grid_view`), Relatórios (`bar_chart`), Notificações (`notifications`) e o Perfil. A Visão geral acrescenta os destinos (Hoje, Grade, Objetivos, Foco) entre a logo e a busca, em pílulas `radius-sm` de 36; o atual em `chip` com hairline.
- Campo de busca: classe `block` do kit (`surface-raised`, `radius-md`, hairline interna no topo), altura mínima 40, ícone `search` de 20 em `text-secondary`, texto `body` e dica "Buscar" em `text-secondary`. Hoje o campo não tem fundo nem borda; o DS dá o preenchimento para ele ser reconhecível como campo.
- Medium: logo, espaço flexível, ícone de busca, Módulos, Notificações e Perfil. Sem campo e sem Relatórios.
- Botão de ícone: círculo de 40 no desktop e 48 no toque, ícone de 22 em `text-primary`. Perfil: avatar de 32 com gradiente `ember` → `orange` e ícone `on-orange`, hairline no topo, mais seta `arrow_drop_down` em `text-muted`.
- Rodapé (`AppFooter`): hairline superior, altura mínima de 40, texto "© 2026 Lume" em `caption` `text-muted`, alinhado à esquerda na largura do conteúdo.

## Estados
Valem para cada botão de ícone e para o Perfil.
- Normal: transparente.
- Hover (só ponteiro fino): fundo `chip`, em `dur-instant`.
- Pressionado: fundo `chip` e escala 0,94 em `dur-fast` (`ease-out`); soltar volta com `ease-spring`.
- Foco: anel sólido de 2 `violet-ink`, afastado 2.
- Aberto (Módulos com o menu aberto): fundo `chip` com hairline, ícone `violet-ink`, `aria-expanded` verdadeiro.
- Desabilitado: 40% de opacidade e sem hover; use pouco (o motivo, se importar, vai em `caption`).
- Carregando, vazio e erro: não se aplicam à barra.

## Mobile e desktop
- Wide: busca visível, Relatórios na barra, alvos de 40 (`hit-min` 32 no mínimo).
- Medium: busca em ícone, alvos de 48, margem `space-24`.
- Compact: barra de 56 com logo, Buscar, Notificações e Perfil (alvos de 48); Módulos vira o último item da `BottomNav` (que abre o `Sheet`).

## Movimento
Troca de fundo em `dur-instant` e pressionar em `dur-fast` com `ease-out`; soltar em `ease-spring`. A barra em si não anima. Com reduzir movimento, só permanece a troca de cor, sem escala nem mola.

## Acessibilidade
- Cada botão de ícone tem rótulo (`tooltip` e `Semantics`): "Módulos", "Relatórios", "Notificações", "Perfil", "Buscar". O botão Módulos informa que abre um diálogo e se está expandido.
- Contraste: `text-primary` e `text-secondary` sobre `topbar` passam 4,5:1 nos dois temas; ícone ativo em `violet-ink` sobre `chip` passa 6,2:1.
- Ordem do Tab: logo, (destinos,) busca, Módulos, Relatórios, Notificações, Perfil. Foco sempre visível. A logo é um link para o início.
- `Esc` fecha o menu aberto e devolve o foco ao botão Módulos.

## Faça e não faça
- Faça: mantenha as mesmas ações na mesma ordem em todas as telas.
- Faça: dê aos ícones um rótulo textual para leitores de tela.
- Não use glass nem aurora na barra: ela é a única superfície sólida da tela, para o conteúdo passar por baixo sem ruído.
- Não coloque emblema numérico vermelho em Notificações; use um ponto `violet-ink` com a contagem em texto quando houver.
- Não coloque saudação, relógio ou ações da tela dentro da barra, nem fixe a altura.
