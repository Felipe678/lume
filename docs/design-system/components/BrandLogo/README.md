A marca do Lume: um quadrado com gradiente azul-roxo e o brilho `auto_awesome` em branco, seguido da palavra LUME.

## Quando usar
- Na barra superior (`AppTopBar`), na abertura do app e em telas de acesso.
- Só a marca (sem a palavra) como ícone do app e favicon.
- Não use o gradiente `brand-from` a `brand-to` em botões, fundos, textos ou gráficos. Ele existe só aqui.
- Não redesenhe, gire, contorne nem recolora a marca.

## O que o consumidor fornece
`const BrandLogo()` não recebe parâmetros. O tamanho padrão é o da barra superior (quadrado de 28). Para outros tamanhos, o DS prevê um parâmetro `size` (quadrado) e todo o resto escala por proporção.

## Anatomia e medidas
Medidas no tamanho padrão (28); as demais escalam pela mesma proporção.
- Quadrado: 28 × 28, raio `radius-sm` (8; hoje 7), gradiente de 135° de `brand-from` (#2a8cff, canto superior esquerdo) a `brand-to` (#8a3bff, canto inferior direito).
- Glifo: `auto_awesome` (três brilhos) a 16, cor `on-violet` (branco), centralizado. Não é CustomPainter: no Flutter é `Icons.auto_awesome`; na web é o SVG inline do preview.
- Vão entre quadrado e palavra: 10 (proporção de 0,357 do quadrado).
- Palavra: LUME em caixa alta, 20, peso 500, espaçamento de 0,5 entre letras, cor `text-primary`. Não usa um estilo de tipo da escala: é parte da marca.
- Tamanhos de referência: 20, 28 (barra superior), 40 e 56.

## Estados
A marca é estática. Quando clicável (leva ao início), o alvo é o conjunto inteiro, com `touch-min` de 48 no celular e `hit-min` de 32 no desktop, e anel de foco de 2 `violet-ink`.

## Mobile e desktop
Sem diferença visual: 28 em todas as classes. Em telas de acesso e na abertura use 40 ou 56.

## Movimento
Sem movimento próprio. Não anime brilho, gradiente nem rotação (princípio pró-humano). Reduzir movimento não muda nada aqui.

## Acessibilidade
- A palavra LUME já é o texto acessível. Se só o quadrado aparece, dê `Semantics(label: 'Lume')`.
- O glifo é decorativo (`excludeSemantics`).
- Branco sobre o gradiente passa 3:1 em toda a extensão; a palavra usa `text-primary` e passa 4,5:1 sobre `bg`, `surface` e `topbar` nos dois temas.

## Faça e não faça
- Faça: deixe um respiro livre de meia altura do quadrado ao redor.
- Faça: use sobre `bg`, `surface` ou `topbar`; a marca é igual nos dois temas.
- Não use sobre foto, gradiente deep navy ou `violet`.
- Não troque o texto por outra fonte nem escreva "Lume" em caixa mista ao lado do quadrado.
- Não reutilize o gradiente em outro elemento "para combinar".
