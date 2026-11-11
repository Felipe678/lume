O GoalChip é a pílula de um objetivo ativo: um ponto na cor do objetivo, o nome e o percentual concluído, construída sobre o `chip` do kit.

## Quando usar

- Na seção "Objetivos ativos" do dashboard e em filtros por objetivo, em que o chip pode ser selecionado.
- Não use para status de atividade (use `ActivityRow`) nem como botão de ação ("Salvar objetivo" é botão).

## O que o consumidor fornece

- `ActiveGoal goal`: `title`, `color` (um dos oito `GoalColor`) e `progress` de 0 a 1.
- `bool selected` e `VoidCallback? onTap` quando o chip filtra ou abre o objetivo; sem `onTap`, é só informativo.
- A `ActiveGoalsSection` recebe `List<ActiveGoal> goals` e mostra o título "Objetivos ativos" em `title` dentro de um `card`, com os chips numa linha que quebra (vão `space-12`) no desktop e em duas colunas (vão `space-8`) no celular. Com a lista vazia, mostra "Nenhum objetivo ativo" em `body-sm` e `text-secondary`, e pode oferecer o `EmptyState` com a ação "Criar objetivo".

## Anatomia e medidas

- Pílula `radius-full`, fundo `chip` com hairline interna no topo (`hairline`), altura visual de 36, padding horizontal `space-12` à esquerda e `space-16` à direita, vão interno `space-8`.
- Ponto de 8px com a cor `goal-amber`, `goal-sky`, `goal-emerald`, `goal-rose`, `goal-violet`, `goal-lime`, `goal-cyan` ou `goal-fuchsia`. O ponto é só apoio: o nome sempre está ao lado.
- Nome em `label` com peso 500 e `text-primary`, uma linha com reticências. Percentual em `label` com peso 700, números tabulares, encostado à direita.
- Área de toque: o visual tem 36 de altura e a área sensível chega a `touch-min` (48) no celular, estendida para fora do chip.
- Variante compacta (celular, duas colunas): o chip vira um bloco de `radius-md` com padding `space-8` por `space-12`, altura mínima 52: ponto e nome na primeira linha (o nome quebra em até 2 linhas, sem reticências) e o percentual embaixo em 12/16, peso 700. Assim nenhum nome é cortado em 155 de largura.
- Selecionado: contorno interno de 2px em `text-primary` mais um ícone `check` de 16px antes do nome. O estado nunca depende só da cor.

Hoje no Flutter: altura 34, raio 17, padding horizontal 14, ponto de 6px e chip sem estados.

## Estados

- Normal: fundo `chip`.
- Hover (só com ponteiro fino): fundo `surface-tint`, em `dur-instant`.
- Pressionado: escala 0,97 em `dur-fast` (`ease-out` ao apertar, `ease-spring` ao soltar).
- Foco: anel `violet-ink` de 2px com 2px de afastamento.
- Selecionado: contorno de 2px em `text-primary`, ícone de check e `aria-pressed="true"`.
- Desabilitado: 40% de opacidade, sem sombra; o motivo aparece em legenda quando importa.
- Carregando: esqueleto (`skel`) em pílula, mesma altura de 36.
- Vazio: "Nenhum objetivo ativo". Erro: não se aplica ao chip.

## Mobile e desktop

- Celular: duas colunas de largura igual, vão `space-8`, na variante compacta (bloco de duas linhas); o nome quebra em até 2 linhas dentro do bloco e o chip nunca passa da largura da coluna.
- Desktop: linha que quebra com vão `space-12`, hover visível e `hit-min` respeitado.
- Em qualquer largura, a quebra é do container, nunca rolagem horizontal.

## Movimento

- Troca de fundo em `dur-instant` com `ease-out`; pressionar em `dur-fast`, soltar com `ease-spring`.
- Selecionar não anima o contorno além da troca de cor.
- Reduzir movimento: sem escala ao pressionar, só a troca de cor.

## Acessibilidade

- Rótulo semântico: "Inglês: 60% concluído" (e ", selecionado" quando for o caso). Selecionável usa papel de botão com estado ligado ou desligado.
- `text-primary` sobre `chip` e sobre `surface-tint` passa 4,5:1 nos dois temas; o ponto de cor não carrega informação sozinho.
- Alvo de toque de 48px no celular e 32px no desktop; Tab percorre os chips na ordem visual, Espaço e Enter alternam a seleção.

## Faça e não faça

- Faça: escreva o nome do objetivo sempre, mesmo quando o ponto já tem a cor.
- Faça: mostre o percentual como número, nunca só como preenchimento.
- Faça: deixe a quebra de linha ser do container, com vão `space-12` (ou duas colunas no celular).
- Não faça: nenhum tom vermelho para objetivo atrasado ou com percentual baixo.
- Não faça: não use `goal-obligatory` aqui; obrigatórias não são objetivos.
