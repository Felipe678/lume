Proposta (E1): a grade semanal de blocos de tempo sobre a aurora, com a semana em colunas, as horas em linhas, o bloco atual aceso e o formulário em diálogo de vidro (desktop) ou Sheet (celular).

**Proposta para revisão; não implementada.** A tela ainda não existe no app Flutter. Ela parte da `GradePage` e do `BlockFormModal` do app React de referência (bloco: título, dias da semana, início, fim, objetivo ou obrigatória; blocos não cruzam a meia-noite).

## Propósito
Definir uma vez e seguir todo dia, "como o horário da escola". A grade alimenta o card Agora, os anéis do dia e a projeção de horas dos objetivos.

## Composição por classe de largura
- **wide**: `body.aurora`; AppTopBar com "Grade" ativo (chip); cabeçalho em duas ondas (`.rise.hero`) com selo "Proposta (E1)", título em `display`, apoio em `body` e o **Button** primário "Novo bloco" à direita. Abaixo, um `.card` (`radius-lg`, `elev-1`, padding `space-16`) com 7 colunas (Seg a Dom; a data de hoje em pílula `violet` com luz) e linhas de hora de 07:00 a 22:00 em `divider`, 48px por hora. A coluna de hoje é `surface-raised` com hairline. A hora atual é uma linha fina horizontal em `cyan` com um ponto, só na coluna de hoje. Legenda em `.chip` abaixo.
- **medium**: mesma grade com colunas de largura mínima de 96px e rolagem horizontal só dentro do card.
- **compact** (390): vira lista por dia dentro de um `.card`. Faixa de dias (chips de 56px, hoje em `violet`), **TaskRow** com hora, título, ponto e nome do objetivo e duração ("40 min" com a unidade em `text-secondary`), o bloco atual aceso com mini-segmentos dos passos. O CTA "Novo bloco" fica fixo acima da BottomNav em vidro, ao alcance do polegar. A BottomNav marca "Grade".

## Blocos
Fundo `goal-*` a 18% sobre `surface`, barra lateral de 3px na cor do objetivo (inset), hairline no topo, `radius-sm`, título em `label` `text-primary` e horário em `caption` `text-secondary` quando há altura (45 min ou mais). O nome do objetivo vai no `aria-label`, no tooltip e na legenda (e nas linhas do compact). Atividade obrigatória usa `goal-obligatory` com **hairline tracejada**, para a distinção não depender de cor. Blocos de 15 min viram uma faixa de 20px com o título em `caption`.
O **bloco atual** é a única luz da tela: fundo a 26%, barra lateral em `orange`, contorno de 1px `orange` a 40% e luz de 20px a 25% (um `glow-orange` discreto), ícone `play_arrow` em `orange-ink` e `.seg.mini` com os passos (feitos em `violet`, atual em `orange`).

## Formulário (diálogo ou Sheet)
`.glass` com `radius-xl`, `elev-3` e padding `space-24`. Componentes: **TextField** v2 (Título; Vínculo como seletor; Início e Fim como hora), sete botões de dia alternáveis (selecionado = gradiente `violet` como o primário; não selecionado = `chip` com traço `border-control`), **Button** "Salvar bloco" (primário) e "Cancelar" (secundário); ao editar, "Excluir bloco" destrutivo discreto (`chip`, texto `danger`, traço de 1px). Validação gentil: sobreposição aparece num `.block` com ícone `info` em `orange-ink` ("Sobrepõe 'Almoço'... você pode salvar mesmo assim"); erro de horário ("O fim precisa ser depois do início.") usa `danger` com ícone e texto, nunca só cor. No desktop o diálogo abre com fade e escala 0,96 a 1 em `dur-base` `ease-out-quint` sobre o `scrim`, fecha em `dur-exit` `ease-in`, `Esc` fecha e o foco volta ao botão. No celular o mesmo formulário sobe como Sheet em vidro.

## Estados
- **Preenchido** (o mostrado).
- **Carregando**: colunas com `.skel` na forma dos blocos.
- **Vazio**: **EmptyState** no lugar da grade: "Sua grade está vazia. Crie o primeiro bloco ou comece por uma rotina sugerida (Alongamento, Leitura, Planejar o dia)."
- **Erro**: mensagem com "Tentar de novo"; a grade local segue editável.
- Blocos: foco em anel `violet-ink`; hover só com ponteiro fino (`elev-2`); pressionado 0,98 e solta com `ease-spring`.

## Movimento
Entrada em duas ondas: cabeçalho em 240ms (`.rise.hero`), depois a grade (`--w:0`) e a legenda com a seção de baixo (`--w:1`), tudo dentro de `dur-page`. O bloco atual não respira aqui (a respiração é do card Agora e do Foco); ele só está aceso. A linha da hora atual avança sem animação (atualiza a cada minuto). Com "reduzir movimento": só fade curto, sem escala nem mola.

## Acessibilidade
Cada bloco é um botão com rótulo completo ("Estudo de inglês, Inglês fluente, Seg 14:00 às 15:00, agora") e `aria-current` no atual; cada coluna é um grupo com o dia. O texto `text-primary` sobre o fundo tintado a 18% passa 4,5:1 nos dois temas. A obrigatória tem a hairline tracejada e a palavra "Obrigatória" na legenda e nas linhas. Alvos de 48px no celular (chips de dia com 56px, linhas com 56px, CTA com 48px).

## Decisões para o Felipe confirmar
1. Destinos (Hoje, Grade, Objetivos, Foco) na barra superior no desktop e na BottomNav no celular.
2. Faixa de horas 07:00 a 22:00 fixa, ou ajustada ao primeiro e ao último bloco.
3. Nome do objetivo só na legenda, no tooltip e nas linhas do celular, ou dentro do bloco quando houver altura.
4. Emoji do objetivo nos blocos: a proposta v2 tirou (só cor + nome), para o bloco ficar limpo; pode voltar como escolha do usuário.
5. Rotinas sugeridas ("um toque e entra na grade") como chips abaixo da grade, como no app React.
6. Arrastar para mover ou redimensionar blocos (fora desta proposta).
