O Lume é um ERP pessoal: um gerenciador de uma vida, como um ERP gerencia uma empresa. Fica aberto o dia todo, no celular e no desktop. Construa cada tela para ser olhada de relance e operada sem esforço.

## Princípios

- **Tire ruído, não adicione.** Cada tela mostra o que importa agora; o resto fica um toque ou clique adiante.
- **Caminho do meio.** Nada de pressão extrema nem de conforto demais. Use `text-secondary` e movimento calmo; nunca vermelho como alerta de falha pessoal.
- **Pró-humano.** Sem gatilhos de vício, comparação ou punição: nada de chama que apaga, contagem regressiva urgente, confete, ranking, vibração ou som de recompensa. "Sequência" vira consistência ("5 de 7 dias").
- **Frentes conectadas.** Sono, alimentação, peso, trabalho, objetivos, finanças e prazeres se influenciam. Quando dois módulos têm dados, mostre a ligação entre eles.
- **Profissional.** Contraste forte, layout limpo, poucos elementos por tela.

## Conteúdo e tom

- Escreva em português do Brasil, em segunda pessoa do singular ("Sua rotina", "Seu dia"), frases curtas e no tom de um parceiro calmo.
- Mensagens gentis quando o ritmo cai: "Constância vale mais que intensidade." Nunca culpe ("Você falhou", "Você perdeu").
- Rótulos de ação dizem o que acontece: "Registrar dose", "Salvar objetivo". Evite "OK" e "Enviar".
- Estados vazios explicam o que aparecerá e como começar: "Sem rotina hoje. Monte sua grade em Tempo e objetivos para acompanhar o dia aqui."
- Módulos que ainda não existem aparecem como "Em breve · Ex", nunca escondidos.
- Sobretítulos em caixa alta e curtos (AGORA, HOJE). O resto em caixa de frase. Sem emoji decorativo; emoji só como escolha do usuário (ícone de objetivo, avatar).
- Valores: moeda em reais com vírgula decimal ("R$ 1.234,50"); duração curta ("45 min", "1 h 20"); data e hora no formato brasileiro, 24 horas.
- Dados de saúde: o app registra, nunca recomenda. Para qualquer medicamento ou dose, escreva "registrada" ou "informada por você", jamais "recomendada".

## A linguagem: brasa

"Lume" é brasa: luz baixa, constante, contida. O visual segue isso em quatro regras.

1. **Uma fonte de luz por tela.** Só o elemento "aceso" brilha: o card Agora no dashboard, o passo em andamento no Foco, a barra de hoje no ritmo. Ele recebe `glow-*` e respira em `dur-breathe`. Todo o resto é quieto.
2. **Camadas, não bordas.** Cards se separam do fundo por `elev-1` (hairline interna + duas sombras), blocos internos por `surface-raised` + `hairline`, chips por `chip`. Borda sólida só em controle que precisa ser reconhecido (`border-control`).
3. **Textura mínima.** O fundo carrega uma aurora quase invisível (`aurora-1` no alto à esquerda, `aurora-2` embaixo à direita). Vidro (`surface-glass` + `blur-glass`) só em flutuantes: menu, sheet, toast, barra inferior do celular.
4. **Progresso acende.** Barras e anéis preenchem com cabeça luminosa (`glow-head`, orange → `ember`). Passos feitos esfriam para `violet`; o passo atual é laranja. Concluir solta um único pulso de luz (`dur-pulse`). Nunca confete.

As classes prontas dessa linguagem estão em `kit/lume.css` (`.aurora`, `.card`, `.block`, `.glass`, `.navy`, `.ico-tile`, `.btn`, `.bar.lit`, `.seg`, `.pulse`, `.check`, `.rise`). Previews e protótipos web carregam o kit depois de `tokens.css`. No Flutter, a tradução está em "Como aplicar no Flutter".

## Cor

- Escolha o tema pelos tokens, nunca por hex: `bg`, `surface`, `surface-raised`, `surface-tint`, `chip`, `hero-band`. O app abre no tema escuro; o claro é provisório até chegar a referência visual (frame 868-27423).
- `surface-tint` marca o que está selecionado ou ativo (linha escolhida, passo atual na lista, módulo aberto). Não é hover.
- Hairlines: `hairline` (6%) no topo de cards e blocos; `hairline-strong` (12%) em flutuantes e no contorno de `icon-tile`.
- Texto: `text-primary` para o que se lê primeiro, `text-secondary` para apoio, `text-muted` só para legenda e eixo. Todos passam 4,5:1 sobre `bg`, `surface`, `surface-raised`, `chip` e `hero-band` nos dois temas.
- Os três acentos da marca têm papéis fixos nos anéis do dia: `violet` = blocos do dia, `cyan` = dias na semana, `orange` = etapas dos objetivos. Não troque.
- **Preencher × escrever.** `violet`, `cyan`, `orange`, `green` são cores de PREENCHIMENTO (botão, anel, barra) e levam `on-violet`, `on-cyan`, `on-orange`, `on-green` por cima. Quando a cor é texto, ícone, link ou foco, use a variante `-ink` (`violet-ink`, `cyan-ink`, `orange-ink`, `green-ink`, `blue-ink`): ela escurece no tema claro e clareia o violeta no escuro.
- Limite conhecido: o `violet` cheio (`#5B16F0`) como barra ou anel sobre `bg`, `surface` e `hero-band` no tema escuro dá 2,7:1, abaixo dos 3:1 que se pede para elementos gráficos. A cor é a da marca e foi mantida. Por isso todo preenchimento violeta vem com valor ou rótulo em texto ao lado (percentual no centro do anel, leitura em texto do gráfico), e nunca é o único portador da informação.
- `danger` serve para erro e ação destrutiva, sempre com ícone ou palavra. Use pouco.
- Cor nunca carrega significado sozinha: status e objetivo trazem palavra, ícone ou nome ao lado. As cores `goal-*` são indicadores, não rótulos.
- Hero e cartão em gradiente `card-1` a `card-4` (deep navy, 135°, paradas 0, 38, 72 e 100%) com texto `card-fg` e `card-fg-muted`, nos dois temas. Brilho: `shadow-glow-card`.
- O gradiente azul-roxo `brand-from` a `brand-to` existe só na `BrandLogo`. Não use em botões, fundos nem textos.
- Séries de gráfico e categorias: `data-yellow`, `data-mint`, `data-purple` e `goal-*`, sempre com legenda. Nunca como texto.

## Tipografia

- Uma família: Inter, nos pesos 400, 500, 600, 700 e 800 (`type.families.sans`). Sem outras fontes.
- Use os estilos por papel: `display-lg` e `display` para saudação, `headline` para título de card, `title` e `title-sm` para títulos de bloco e de linha, `body` para texto corrido, `body-sm` para apoio, `label` para botão e chip, `caption` para legenda, `overline` para sobretítulo, `micro` para eixo, `metric` para número de anel.
- Números que se alinham em coluna (valores, horas, percentuais) levam `tabular-nums`.
- Respeite a escala de fonte do sistema: nenhum container de texto tem altura fixa. O card Agora cresce com a fonte (a altura de 200 é multiplicada pelo fator, até 2×).
- Linhas de texto corrido ficam até ~65 caracteres; títulos ficam em no máximo 2 linhas, com reticências depois disso.

## Espaçamento, raio e elevação

- Espaçamento só pela escala `space-2` a `space-56` (grade de 4px). Entre filhos de uma coluna ou linha use `gap`, não margem individual.
- Raios **concêntricos**: externo = interno + padding. Card `radius-lg` (16) com padding 12 → bloco `radius-xs` (4); com padding 8 → `radius-sm` (8). Na prática: 16 → 12 → 8 → 4, e nunca o mesmo raio no pai e no filho. `radius-full` para pílulas, pontos e anéis.
- Elevação em camadas: `elev-1` card em repouso, `elev-2` card em hover ou detalhe selecionado, `elev-3` flutuantes (com `surface-glass`). `shadow-sm/md/lg` continuam válidos como forma simples. No tema escuro a hierarquia vem das camadas; a sombra só dá profundidade.
- Ícones em `icon-tile` têm gradiente vertical sutil (6% a 12%) e hairline no topo. Tile colorido (`violet`, `orange`, `cyan`) só para o ícone do módulo ou da ação principal.
- Bordas: `divider` separa itens de lista (decorativa). Todo controle que precisa ser reconhecido tem borda `border-control` (3:1) ou preenchimento.

## Layout e responsivo

- Três classes de largura: compact (abaixo de `bp-medium`), medium e wide (a partir de `bp-wide`). Detalhes em "Mobile e desktop".
- Conteúdo centralizado até `content-max`, com margem `page-pad-compact` ou `page-pad-wide`.
- Alvos de toque: `touch-min` (48px) no celular, `hit-min` (32px) no desktop, mesmo quando o visual é menor.

## Movimento

- Use as durações `dur-*` e as curvas `ease-*`. Entra com `ease-out` (`ease-out-quint` para elementos grandes), sai 20% mais curto. `ease-spring` só para soltar botão, check e troca de passo. Detalhes em "Movimento e animações".
- Assinatura: **acender**. Progresso preenche com cabeça luminosa; concluir solta um pulso (`dur-pulse`); o elemento aceso respira (`dur-breathe`). Essas três coisas, e só elas, são o "movimento do Lume".
- Entrada de tela em duas ondas: hero em 240ms, depois dois grupos de blocos. Não anime cada card.
- O que o usuário vê 100 vezes por dia não anima: troca de aba só move o indicador; abrir uma linha não desliza.
- Movimento é calmo e dá contexto; nunca chama atenção para insistir. Respeite "reduzir movimento" do sistema.

## Estados e foco

- Todo controle tem 5 estados visíveis: normal, hover (só desktop), pressionado, foco e desabilitado.
- O anel de foco é sólido, 2px, `violet-ink`, com 2px de afastamento. Dá pelo menos 6,2:1 sobre `bg`, `surface`, `surface-raised` e `chip` nos dois temas.
- Desabilitado: 40% de opacidade e sem sombra. Quando o motivo importa ("Preencha o nome para continuar"), ele aparece em `caption` perto do controle.
- Carregamento: esqueleto na forma do conteúdo (mesmo raio e altura), com pulso lento; nunca spinner sozinho em tela cheia.

## Iconografia

- Ícones Material Rounded, 24px por padrão (20px em linhas densas), traço contínuo, cor `text-secondary` ou `-ink`. Um ícone que carrega significado tem rótulo de texto ou `Semantics`.
- Módulos: Tempo e objetivos = `schedule`, Saúde = `favorite`, Finanças = `account_balance_wallet`, Patrimônio = `home_work`, Documentos = `description`. Cada ícone fica em um `icon-tile` (`radius-md`).
- A logo é a `BrandLogo`; não a redesenhe nem aplique o gradiente em outros lugares.

## Mapa dos valores atuais para os tokens

Ao tocar em uma tela existente, troque o valor solto pelo token:

| Hoje no código | Use |
|---|---|
| `BorderRadius.circular` 3, 5, 6 | `radius-xs` |
| 7, 9, 10 | `radius-sm` |
| 12, 14 | `radius-md` |
| 16, 17 | `radius-lg` |
| 20, 24 | `radius-xl` |
| `SizedBox`/padding 6 | `space-4` ou `space-8` |
| padding 14 | `space-12` ou `space-16` |
| padding 22 e 26 | `space-20` e `space-24` |
| `textMuted` #6B6B73 (escuro) | `text-muted` #8A8A93 |
| `textMuted` #8A8A93 (claro) | `text-muted` #62626C |
| `AppPalette.violet` como cor de texto | `violet-ink` |
| `fontSize` 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28 | o estilo de tipo do mesmo papel (14 vira `body` ou `body-sm`) |
