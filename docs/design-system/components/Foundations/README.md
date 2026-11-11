Página viva da linguagem visual "brasa": aurora, camadas com hairline, ícones em tile, botões com mola, barras que acendem, pulso de conclusão e raio concêntrico, com as classes de `kit/lume.css` que implementam cada uma.

## Quando usar

Abra esta página antes de desenhar qualquer componente ou tela. Ela mostra o nível de acabamento esperado e as classes prontas. Não é um componente para montar em produto; é a referência do kit.

## O que o consumidor fornece

Nada. Em protótipos web, carregue `tokens.css` e depois `kit/lume.css`; use as classes. No Flutter, siga "Como aplicar no Flutter".

## Anatomia e medidas

- **Aurora** (`.aurora`): dois radiais fixos, `aurora-1` em 8% 0% com raio 60% × 50%, `aurora-2` em 100% 100% com raio 50% × 45%. Um por tela, no fundo.
- **Camadas**: `.card` (`surface`, `radius-lg`, `elev-1`) → `.block` (`surface-raised`, `radius-md`, hairline) → `.chip` (`chip`, pílula, 36px). Raios 16 → 12 → pílula.
- **Vidro** (`.glass`): `surface-glass` + `blur-glass` + `elev-3` + `hairline-strong`. Só flutuantes.
- **Aceso**: `.navy` (gradiente deep navy, `shadow-glow-card`) ou `.lit-violet/.lit-cyan/.lit-orange`; `.breathe` para respirar em `dur-breathe`.
- **Ícone em tile** (`.ico-tile`, 40px, `radius-md`; `.sm` 32px, `radius-sm`): gradiente vertical sutil e hairline; tons `.violet`, `.orange`, `.cyan`.
- **Botões** (`.btn`, 44px, `radius-md`, `label`): `.primary` com luz violeta, `.secondary` com hairline e `border-control`, `.ghost`, `.ember` só para entrar em foco, `.onnavy` sobre o deep navy, `.icon` 44×44, `.sm` 36px. Alvo de toque de 48px via `::after`.
- **Barras**: `.bar` (6px) com `.lit` para a cabeça luminosa; `.seg` segmentada (`.done`, `.now` com `--p`), `.seg.mini` (4px, 56px de largura) para listas.
- **Pulso** (`.pulse.go`): anel que expande 18px e some em `dur-pulse`. **Check** (`.check.on`): fundo violeta e ícone com mola.
- **Entrada** (`.rise`, `.rise.hero`, `--w: 0 | 1`): hero em 240ms, depois duas ondas.

## Estados

Mostrados ao vivo: hover só com ponteiro fino, pressionado (0,97), foco (anel `violet-ink` 2px), desabilitado (40%), carregando (`.skel`).

## Mobile e desktop

As mesmas classes. No celular, `.rise` tem o mesmo tempo, hover não existe e os alvos de toque crescem pelo `::after` dos botões.

## Movimento

Todas as transições animam só `transform`, `opacity` e `box-shadow` (hover). `prefers-reduced-motion` desliga respiração, esqueleto, mola e entrada.

## Acessibilidade

Todos os pares de texto sobre as camadas passam 4,5:1 nos dois temas (verificado em `tokens.json`). O violeta cheio como preenchimento sobre o fundo escuro fica em 2,7:1: por isso todo preenchimento violeta vem com valor em texto ao lado. Foco visível em tudo.

## Faça e não faça

- Faça: uma fonte de luz por tela; raios concêntricos; ícones em tile; unidade de duração em `text-secondary`.
- Não faça: dois elementos acesos; borda sólida em card; raio igual no pai e no filho; glow em botão secundário; confete.
