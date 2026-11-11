O título que abre cada seção do dashboard ("Frentes da vida", "Objetivos ativos"), em texto simples e sem decoração.

## Quando usar
- Acima de um bloco de conteúdo do dashboard ou de uma tela de módulo, para nomear a seção.
- Não use dentro de um card (lá o título é `title`) nem como título da página (lá é `display`).

## O que o consumidor fornece
`SectionTitle(String text)`: apenas o texto, já em português e em caixa de frase. Quem usa define o espaço até o conteúdo (`space-16` abaixo) e o vão até a seção anterior (`space-32`).

## Anatomia e medidas
- Tipo: `headline` (24/30, peso 700, espaçamento de -0,4). Hoje o Flutter usa 24, peso 600 e -0,2; o DS passa a `headline`.
- Cor: `text-primary`, sobre `bg`.
- Sem ícone, sem linha e sem fundo. Alinhado à esquerda, na largura da coluna de conteúdo.
- Altura nunca fixa: o texto cresce com a fonte do sistema (até 2×).

## Estados
Estático: não é clicável e não tem hover, foco nem pressionado. Se uma seção precisar de ação ("Ver tudo"), a ação é um botão separado ao lado, nunca o título.

## Mobile e desktop
Mesmo estilo em todas as classes (`headline`). O título ocupa no máximo 2 linhas e termina com reticências; no celular, textos longos quebram dentro da coluna de 16 de margem.

## Movimento
Nenhum. Aparece junto com a seção na entrada da tela (`dur-page`, `ease-out`); com reduzir movimento, aparece sem deslocamento.

## Acessibilidade
- Marque como cabeçalho: `Semantics(header: true)`; na web, um `h2`.
- `text-primary` sobre `bg` passa 4,5:1 com folga nos dois temas.
- Não depende de cor nem de ícone para ser entendido.

## Faça e não faça
- Faça: títulos curtos, de um a três palavras.
- Faça: um vão de `space-32` acima e `space-16` abaixo.
- Não use caixa alta (isso é do `overline`).
- Não coloque emoji nem ícone decorativo no título.
- Não fixe a altura da linha.
