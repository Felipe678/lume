O tile de uma frente da vida (Tempo e objetivos, Saúde, Finanças, Patrimônio, Documentos) na grade "Frentes da vida" do dashboard: um `card` com o ícone em `ico-tile`.

## Quando usar
- Na grade de Frentes da vida do dashboard, um tile por módulo do catálogo.
- Para um módulo que ainda não existe, use o estado "Em breve · Ex": ele aparece, nunca fica escondido.
- Não use como card de dados (para isso há os cards do dashboard) nem como item de menu (lá é o tile do `ModulesMenu`, com o mesmo visual em `block` e o estado "atual").

## O que o consumidor fornece
- `LifeModule module`: tipo (nome e ícone vêm de `LifeModuleStyle`), disponibilidade e entrega do roadmap (`roadmapStage`, obrigatória quando em breve).
- `String summary`: a linha de apoio. Disponível com dado: "4 blocos hoje"; disponível sem dado: "Disponível"; em breve: "Em breve · E2".
- `VoidCallback? onTap`: só para disponível. Nulo em "Em breve".
- `bool dense`: variante em linha (ícone à esquerda) para "Em breve" em colunas estreitas.

## Anatomia e medidas
- Container: classe `card` do kit (`surface`, raio `radius-lg`, `elev-1` com hairline interna), padding `space-16`, altura mínima 112 (nunca fixa). Raios concêntricos: card 16 → `ico-tile` 12.
- Ícone: `ico-tile` de 40 (`radius-md`) com gradiente sutil de cima para baixo e hairline no topo; ícone Material Rounded de 24. Disponível: variante `violet` (gradiente violeta, ícone `on-violet`, brilho curto). Em breve: `ico-tile` neutro (`icon-tile`) com ícone `text-secondary`. Hoje o Flutter usa 36 chapado, raio 9 e ícone de 20.
- Texto: nome em `title-sm` (`text-primary`; em breve `text-secondary`), vão de `space-12` do ícone e `space-2` entre nome e resumo; resumo em `caption`, `text-muted`.
- Variante densa (`dense`, só Em breve): linha com `ico-tile sm` (32, `radius-sm`) à esquerda, texto à direita, altura mínima 64, padding `space-12`. Usada na Visão geral desktop, onde a coluna tem 5 das 12 colunas.
- Grade: na Visão geral desktop, 2 colunas com vão `space-12`; o disponível ocupa 2 colunas, os Em breve densos em 2 × 2. Em coluna larga, 3 colunas (disponível ocupa 2). No celular, 2 colunas e o disponível ocupa a linha inteira; Em breve em coluna (ícone em cima).
- Ícones fixos: Tempo e objetivos `schedule`, Saúde `favorite`, Finanças `account_balance_wallet`, Patrimônio `home_work`, Documentos `description`.

## Estados
- **Disponível**: `card lift`, clicável, leva à tela do módulo.
- **Hover (ponteiro fino)**: sobe 2 e passa a `elev-2` (classe `lift`).
- **Pressionado**: escala 0,98 em `dur-fast`.
- **Foco**: anel sólido de 2, `violet-ink`, afastado 2.
- **Atual** (módulo aberto): `card tint` (fundo `surface-tint`), ponto `cyan` de 8 no canto superior direito e o resumo vira "Aberto agora". O ponto é reforço; o texto carrega o significado.
- **Em breve**: `card` sem elevação (só a hairline no topo), sem hover, sem pressionado, sem foco (não é botão), não navega. O texto "Em breve · Ex" fica visível. Não use 40% de opacidade aqui: o texto precisa continuar legível (`text-secondary` e `text-muted` já passam 4,5:1).
- Carregando: esqueleto (`skel`) com o mesmo raio e a mesma altura mínima. Vazio e erro não se aplicam.

## Mobile e desktop
- Compact: grade de 2 colunas, o tile inteiro é o alvo de toque (acima de `touch-min`), sem hover.
- Medium e wide: hover ativo só com ponteiro fino (`@media (hover: hover) and (pointer: fine)`); em coluna estreita, Em breve usa a variante densa.
- Hoje o app usa 3 colunas também no celular; no DS o tile ficaria estreito demais com a fonte do sistema grande.

## Movimento
Hover e pressionar em `dur-fast` com `ease-out` (sobe 2 e sombra; escala 0,98); troca de cor em `dur-instant`. Com reduzir movimento, deslocamento e escala somem e só a cor muda.

## Acessibilidade
- `Semantics` com rótulo "Nome, resumo" (ex.: "Saúde, Em breve · E2"); papel de botão só quando disponível; "Em breve" com `enabled: false`.
- Contraste: `text-primary`, `text-secondary` e `text-muted` sobre `surface` e `surface-tint` passam 4,5:1 nos dois temas; ícone `on-violet` sobre o gradiente violeta dá no mínimo 7:1.
- Foco visível por teclado; Enter e Espaço ativam.
- O nome do módulo nunca é cortado na variante padrão: quebra em duas linhas (não use `FittedBox`, que encolhe a fonte). Na variante densa termina em reticências e o rótulo semântico tem o nome inteiro.

## Faça e não faça
- Faça: mostre os módulos futuros com a entrega ("Em breve · E5").
- Faça: mantenha o ícone do módulo igual em todos os lugares onde ele aparece.
- Não esconda um módulo que ainda não existe.
- Não use `violet` como cor de texto no tile; para texto ou ícone use `violet-ink`.
- Não adicione contagem, selo vermelho ou pulso para chamar atenção.
