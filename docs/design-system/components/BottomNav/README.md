A barra de navegação inferior do celular, em glass, com quatro destinos fixos e o botão Módulos, que abre o `Sheet`. Adição do Design System: o app hoje não tem navegação no celular além da barra superior, e o dashboard e as telas novas precisam de navegação ao alcance do polegar.

## Quando usar
- Na classe compact (largura abaixo de `bp-medium`), em toda tela principal.
- Não use em medium e wide: lá a navegação é a barra superior (`AppTopBar`).
- Não use dentro de telas de detalhe, formulários e sheets; nelas a ação de voltar ou fechar vem do próprio contexto.

## O que o consumidor fornece
- Os quatro destinos fixos, cada um com `IconData`, rótulo, rota e disponibilidade: Visão geral (`space_dashboard`), Tempo (`schedule`), Saúde (`favorite`) e Finanças (`account_balance_wallet`). Quatro são os destinos mais usados; os demais módulos ficam em Módulos. A Visão geral nova usa o conjunto Hoje, Grade, Objetivos e Foco (decisão aberta; ver o relatório).
- O destino ativo, vindo de `AppNavigation.currentPath`.
- `VoidCallback onOpenModules`: abre o `Sheet` com o menu de módulos.
- Destinos de módulos que ainda não existem aparecem como "em breve" e não navegam.

## Anatomia e medidas
- Superfície: classe `glass` do kit: `surface-glass` (80%) com `backdrop-filter: blur(blur-glass) saturate(140%)`, `elev-3` e hairline-strong na borda superior. Nada de borda sólida. O conteúdo da página rola por baixo e aparece desfocado.
- Altura mínima `space-56` mais o inset inferior da área segura (`MediaQuery.viewPadding.bottom`), padding vertical `space-8` e lateral `space-8`.
- Cinco itens de largura igual (grade de 5), cada um com alvo de no mínimo 48 de altura: uma pílula de 56 × 28 (`radius-full`) com o ícone de 24, e o rótulo em `caption` abaixo, vão `space-2`.
- Rótulo sempre visível; nunca só ícone, nunca truncado com reticências (quebra se faltar espaço).
- Item ativo: pílula em `surface-tint` com hairline no topo, ícone em `violet-ink`, rótulo em `text-primary` e peso 700. A seleção nunca depende só da cor: a pílula preenchida e o peso também mudam.
- Item inativo: pílula transparente, ícone e rótulo em `text-secondary`.
- Em breve: ícone e rótulo em `text-muted`, sem hover, sem pressionado, sem navegar, com `aria-label` "Saúde, em breve".
- CTA de contexto: quando há atividade agora, um botão `glass` de 56 ("Continuar · Estudo de inglês · 40 min") fica `space-12` acima da barra, com margem `space-16`, no mesmo dock fixo.

## Estados
- Normal, ativo e em breve, como acima.
- Hover (só ponteiro fino): pílula `surface-raised`, ícone e rótulo em `text-primary`, `dur-instant`.
- Pressionado: a pílula encolhe para 0,9 em `dur-fast` com `ease-out` e volta com `ease-spring` (mola leve); ao virar ativo, a pílula entra com mola de 0,85 a 1 em `dur-base`.
- Foco: anel de 2 `violet-ink` por dentro do item (afastamento de -2, para não ser cortado pela barra).
- Módulos aberto: mesmo visual do ativo, `aria-expanded` verdadeiro, enquanto o `Sheet` está aberto.
- Desabilitado: usa o estado "em breve"; não se usa 40% de opacidade para manter o texto legível.

## Mobile e desktop
- Compact: sempre visível, fixa na borda inferior, acima do conteúdo rolável (o corpo ganha padding inferior igual à altura do dock: barra mais CTA quando houver).
- Medium e wide: não aparece.
- Respeita a área segura: soma o inset inferior ao próprio padding em vez de ficar sob a barra de gestos.
- Com a fonte do sistema a 1,3× a barra cresce em altura; nada tem altura fixa.

## Movimento
Troca de cor em `dur-instant`; pressionar em `dur-fast` com `ease-out`; soltar e selecionar com `ease-spring` (só na pílula; a barra não desliza nem pula). Com reduzir movimento, só a troca de cor permanece (sem escala nem mola).

## Acessibilidade
- `Semantics` de navegação com rótulo "Navegação principal"; o item atual leva `selected: true` ("página atual").
- Contraste: `violet-ink` sobre `surface-tint` passa 6,5:1 nos dois temas; `text-secondary` e `text-muted` sobre `surface-glass` passam 4,5:1 porque o fundo desfocado é quase a própria `surface`.
- Alvos de 48 (`touch-min`); a barra inteira respeita o inset inferior.
- O botão Módulos anuncia que abre um diálogo e se está aberto.

## Faça e não faça
- Faça: mantenha os mesmos destinos na mesma ordem em todas as telas.
- Faça: marque o destino atual com a pílula preenchida e o peso, além da cor.
- Não passe de cinco itens nem esconda rótulos.
- Não use selos ou números vermelhos nos itens.
- Não mostre a barra junto com o teclado aberto em formulários: ela some enquanto o campo tem foco.
