O painel de módulos, em glass, que abre ancorado no botão Módulos da barra superior, com uma grade de blocos: Visão geral, Tempo e objetivos, Saúde, Finanças, Patrimônio e Documentos.

## Quando usar
- Para trocar de módulo nas classes medium e wide, a partir do botão Módulos do `AppTopBar`.
- No celular o mesmo conteúdo abre no `Sheet`, aberto pelo último item da `BottomNav`; o painel ancorado não é usado em compact.
- Não use para ações ou configurações; ele só navega entre módulos.

## O que o consumidor fornece
- `Rect anchor`: retângulo do botão Módulos na tela, para ancorar o painel por baixo e à direita.
- `String? currentPath`: rota atual, para destacar o módulo aberto.
- Lista de `ModuleMenuEntry` (hoje `ModuleMenuEntry.all()`): `title`, `IconData icon`, `path` (nulo enquanto o módulo não tem tela) e `roadmapStage` (obrigatória quando não há tela). A entrada "Visão geral" vem primeiro, depois os módulos do `LifeModuleCatalog`.
- A rota é um `PopupRoute`; abrir um módulo fecha o painel e navega com `GoRouter`.

## Anatomia e medidas
- Painel: classe `glass` do kit (`surface-glass` a 80% com `backdrop-filter: blur(blur-glass) saturate(140%)`, `elev-3`, hairline-strong no topo), raio `radius-xl` (24; hoje 20), sem borda sólida, padding `space-20` (hoje 18), largura de até 380 e no mínimo a tela menos `space-24` de cada lado, afastado `space-8` abaixo do botão e alinhado à direita dele. Altura máxima até `space-16` da borda inferior; passou disso, rola por dentro.
- Cabeçalho: "Módulos" em `title-sm` e "Cada área da sua vida" em `body-sm` `text-secondary`, vão de `space-16` até a grade.
- Grade: 2 colunas, vão `space-12` (hoje 10). Cada card é um `block` do kit: `surface-raised`, `radius-md`, hairline interna, padding `space-12`, altura mínima 96. Raios concêntricos: painel 24 → bloco 12 → ícone 8.
- Dentro do bloco: ícone em `ico-tile sm` (32, `radius-sm`, gradiente sutil e hairline), nome em `title-sm`, estado em `caption` `text-muted`, vão `space-12` entre ícone e texto.
- Atrás: `scrim` cobrindo a tela inteira (hoje preto a 25%).
- Estado dos cards: "Aberto agora", "Disponível" ou "Em breve · Ex".

## Estados
- **Aberto agora** (módulo atual): bloco em `surface-tint`, ponto `cyan` de 8 no canto e texto "Aberto agora". Hoje a borda usa `violet` (2,7:1 sobre escuro); o DS troca borda por tinta e ponto, com o texto carregando o significado.
- **Disponível**: `ico-tile violet` (gradiente, ícone `on-violet`), nome em `text-primary`.
- **Hover (ponteiro fino)**: fundo `chip`.
- **Pressionado**: escala 0,97 em `dur-fast` com `ease-out`; soltar volta com `ease-spring`.
- **Foco**: anel de 2 `violet-ink`. Ao abrir, o foco vai para o primeiro card disponível; ao fechar, volta ao botão Módulos.
- **Em breve · Ex**: `ico-tile` neutro com ícone `text-secondary`, nome em `text-secondary`; não é botão, não navega e não tem hover nem foco.
- Carregando e vazio não se aplicam (o catálogo é local). Em erro de navegação, o painel fecha e a tela atual permanece.

## Mobile e desktop
- Wide e medium: painel ancorado de 380 de largura, com `scrim`.
- Compact: sheet pela borda inferior (componente `Sheet`), mesma grade de 2 colunas e os mesmos blocos.
- Em tela estreita (menos de 428) o painel ocupa a largura menos `space-24` de cada lado.

## Movimento
- Abre em `dur-base` com `ease-out-quint`: fade e escala de 0,96 a 1, com origem no canto superior direito (o botão). O `scrim` aparece junto.
- Fecha em `dur-exit` com `ease-in`, o caminho inverso (20% mais curto que a entrada).
- Hoje: 220/160 ms, escala de 0,92 e deslocamento de 1,5%; o DS padroniza em 0,96, sem deslocamento.
- Reduzir movimento: só fade, em no máximo `dur-instant`, sem escala nem mola.

## Acessibilidade
- Diálogo modal com rótulo "Módulos" (`Semantics` com `scopesRoute` e `namesRoute`); o foco fica preso no painel enquanto aberto.
- Fecha com `Esc` e com clique ou toque no `scrim`; a barreira tem o rótulo "Fechar menu de módulos".
- Cada card tem rótulo "Nome, estado" (ex.: "Saúde, Em breve · E2"); "Aberto agora" marca `selected`. "Em breve" fica com `enabled: false`.
- Contraste: textos sobre `surface-raised` e `surface-tint` passam 4,5:1; o glass tem 80% de opacidade sobre conteúdo desfocado, então o texto do cabeçalho continua acima de 4,5:1 nos dois temas. O destaque nunca depende só da tinta: há o ponto e o texto "Aberto agora".
- Setas e Tab percorrem os cards na ordem visual; Enter ou Espaço abrem.

## Faça e não faça
- Faça: mostre os módulos futuros com a entrega, para o painel ensinar o que vem.
- Faça: feche o painel ao abrir um módulo e leve o foco para o título da nova tela.
- Não coloque mais de 2 colunas no painel.
- Não abra o painel sozinho nem o anime para chamar atenção.
- Não use glass fora de elementos flutuantes nem borda sólida no painel; a separação é hairline, blur e sombra.
