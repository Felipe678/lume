Botão de ação com seis variantes (primário, secundário, fantasma, brasa, destrutivo e ícone) em dois tamanhos, com mola ao soltar e estados completos. Adição do Design System: o app ainda não tem botões próprios, e a E1 e as telas novas precisam de um conjunto único de ações.

## Quando usar

- Primário (`.btn.primary`): a ação principal da tela ou do diálogo ("Nova atividade", "Salvar bloco"). Um por área visível; é a única luz violeta da área.
- Secundário (`.btn.secondary`): ação alternativa ("Cancelar", "Trocar atividade").
- Fantasma (`.btn.ghost`): navegação leve e ações de baixa ênfase ("Ver todas"); com `text-secondary` para "Fechar".
- Brasa (`.btn.ember`): só para "Entrar em foco" e "Continuar". É a cor do passo em andamento e não aparece em mais nada.
- Destrutivo (`danger`): raro, discreto, sempre com ícone e palavra. O produto prefere "Desfazer" a confirmar.
- Ícone (`.btn.icon`): ações conhecidas e repetidas, sempre com rótulo acessível.
- Não use botão para navegar entre módulos (menu de módulos) nem para alternar valor (chip ou interruptor).

## O que o consumidor fornece

- `String label` (verbo que diz o que acontece; evite "OK" e "Enviar") ou `Widget icon` com `String semanticLabel` no botão de ícone.
- `VoidCallback? onPressed`: nulo significa desabilitado.
- `variant` (primary, secondary, ghost, ember, danger, icon), `size` (medium 44, sm 36), `bool loading`, `Widget? leading`.

## Anatomia e medidas

- Medium: altura 44, padding horizontal `space-20`, raio `radius-md`. Sm: altura 36, padding `space-16`, mesmo raio. Ícone: quadrado de 44 ou 36.
- Tipo `label` (13/16, peso 600). Ícone de 20px, vão `space-8` até o texto.
- Primário: gradiente vertical de `violet` (10% mais claro no topo), texto `on-violet`, hairline interna no topo e luz violeta (`violet` a 30%, 20px de blur).
- Secundário: fundo `chip`, traço interno de 1px `border-control` e hairline no topo, texto `text-primary`. Nenhuma borda externa.
- Fantasma: sem fundo, texto `violet-ink`.
- Brasa: gradiente `ember` para `orange`, texto `on-orange`, hairline clara e luz laranja a 35%.
- Destrutivo: fundo `chip`, texto `danger`, traço interno de 1px em `danger` a 45%. Nunca um bloco vermelho.
- Área de toque: `::after` com 4px para fora garante 48px (`touch-min`) com visual de 44; no desktop, `hit-min`.

Hoje no Flutter: não existe um botão do sistema; o app usa `InkWell` e ícones soltos.

## Estados

- Normal: como acima.
- Hover (só `@media (hover: hover) and (pointer: fine)`): primário e brasa aumentam a luz (45%, 28px); secundário passa a `surface-tint`; fantasma ganha fundo de `violet-ink` a 10%; destrutivo mistura 10% de `danger` ao `chip`.
- Pressionado: escala 0,97 em `dur-fast` com `ease-out`.
- Soltar: a escala volta em `dur-fast` com `ease-spring` (a mola do Lume).
- Foco: anel sólido de 2px `violet-ink`, afastado 2px, sem animação.
- Desabilitado: 40% de opacidade, sem sombra nem luz, sem hover. Motivo em `caption` ao lado quando importa.
- Carregando: indicador discreto de 14px (anel parcial na cor do texto) antes do rótulo, que é mantido; `aria-busy` e toques ignorados. Nunca troque o rótulo por um spinner sozinho.

## Mobile e desktop

- Celular (compact e medium): medium com 48px, primário ou brasa em largura total quando for a ação da tela, na parte inferior.
- Desktop (wide): `sm` em barras e linhas densas; hover visível; `Enter` e `Espaço` acionam; `Tab` na ordem visual.

## Movimento

- Pressionar: `dur-fast`, `ease-out`. Soltar: `dur-fast`, `ease-spring`. Cor em hover: `dur-instant`. Sombra e luz em hover: `dur-fast`.
- Indicador de carregamento gira em 1,2s, só enquanto carrega.
- Reduzir movimento: sem escala ao pressionar nem mola; o indicador vira um anel estático.

## Acessibilidade

- Contraste: `on-violet` sobre `violet` 7,4:1; `on-orange` sobre `orange` 8,0:1; `violet-ink` sobre `bg`, `surface` e `chip` mínimo 6,2:1; `danger` sobre `chip` acima de 4,5:1; traço `border-control` 3:1.
- `Semantics(button: true, label: ...)`; botão de ícone sempre com rótulo. Carregando: `enabled: false` e anúncio "carregando".
- Alvo de 48px no celular; foco visível em todas as variantes.
- Destrutivo traz ícone e palavra, nunca só a cor.

## Faça e não faça

- Faça: rótulos com verbo claro ("Salvar objetivo", "Registrar dose").
- Faça: um primário por área; brasa só para entrar em foco.
- Faça: manter o texto durante o carregamento.
- Não faça: gradiente da marca (azul-roxo) em botão; ele é só da logo.
- Não faça: destrutivo em bloco vermelho nem como ação padrão de um diálogo.
