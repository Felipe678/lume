O menu de Módulos aberto sobre a Visão geral: no desktop um painel glass ancorado no botão Módulos com scrim, no celular um Sheet glass que sobe da borda inferior, lado a lado para comparar.

## Propósito
Revisar a diferença de comportamento entre as classes de largura para o mesmo conteúdo: seis entradas (Visão geral, Tempo e objetivos, Saúde, Finanças, Patrimônio, Documentos), com o módulo atual marcado e os que ainda não existem mostrados como "Em breve · E2" (nunca escondidos). Glass só aqui, nos elementos que flutuam.

## Composição
- **Desktop (wide)**: **ModulesMenu**, painel de 380 px em `glass` (`surface-glass`, blur `blur-glass`, `elev-3`, hairline-strong no topo), `radius-xl`, padding `space-20`, a 8 px abaixo do botão Módulos e alinhado à direita dele (sem sair da janela). Título "Módulos" em `title-sm`, apoio "Cada área da sua vida" em `body-sm`, grade de 2 colunas com blocos (`block`, 96 px) e ícones em `ico-tile sm`. O `scrim` cobre a tela atrás e o botão Módulos fica no estado aberto (`chip` com ícone `violet-ink`).
- **Celular (compact)**: **Sheet** em `glass` com `radius-xl` nos cantos de cima, alça de arrastar, botão Fechar de 48 px, os mesmos blocos em 2 colunas e o inset inferior somado ao padding. O `scrim` cobre inclusive o dock (BottomNav glass). O item Módulos da BottomNav fica na pílula aberta.
- Cada bloco tem ícone em `ico-tile sm` (`violet` quando disponível, neutro quando em breve), título e status em texto. O atual leva `surface-tint`, ponto cyan e o texto "Aberto agora". Indisponíveis ficam desabilitados, mas legíveis, e mostram a entrega do roadmap.
- Raios concêntricos: painel 24 → bloco 12 → ícone 8.

## Estados
Fechado, aberto, módulo atual, disponível, em breve (desabilitado, mas legível), foco do teclado (anel de 2 px `violet-ink`), pressionado (escala 0,97 com volta em `ease-spring`) e hover só com ponteiro fino. O botão "Abrir ou fechar" de cada moldura reproduz a abertura e o fechamento e sincroniza `aria-expanded`; `Esc` fecha os dois; clicar no scrim também.

## Movimento
Painel: abre em `dur-base` com `ease-out-quint` (fade e escala 0,96 a 1, origem no botão) e fecha em `dur-exit` com `ease-in` (20% mais curto). Sheet: sobe de `translateY(100%)` em `dur-base`/`ease-out-quint` e desce em `dur-exit`/`ease-in`, com o scrim aparecendo junto. No Flutter, arrastar o Sheet para baixo o fecha. A tela de fundo está parada (sem entrada em ondas) para a comparação. Com "reduzir movimento": só fade de até `dur-instant`, sem deslocamento nem escala.

## Acessibilidade
Painel e Sheet são diálogos modais com rótulo "Módulos"; o primeiro módulo disponível recebe o foco ao abrir; `Esc` fecha e devolve o foco ao botão; blocos têm 96 px de altura (acima de `touch-min`) e rótulo "Nome, status". Texto sobre o glass fica acima de 4,5:1 porque o fundo desfocado é escurecido pelo `scrim`.

## Hoje no Flutter
O scrim do menu é preto a 25% e o painel é `surface` com borda; o DS usa o token `scrim` (mais forte no escuro) e glass sem borda. No celular o app atual abre o mesmo painel flutuante; o DS propõe o Sheet.
