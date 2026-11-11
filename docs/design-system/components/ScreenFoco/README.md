Tela do Modo Foco no desktop: um passo de cada vez, com a barra segmentada da atividade, o título do passo em 40px, o anel do passo em laranja e duas ações, sobre a aurora com a brasa atrás do anel. Adição do Design System: o app ainda não tem Modo Foco; esta tela compõe `StepProgress`, `FocusTimer`, `QuickCapture` e `FocusEnd` com a regra "não é hora de pensar, é hora de agir".

## Quando usar

- Ao tocar "Entrar em foco" em uma atividade do dia, ou "Continuar" no CTA do celular. É tela cheia: sem `AppTopBar`, sem menu de módulos, sem notificações.
- Não use para planejar: aqui não se edita, reordena, cria passo nem troca de atividade. Trocar de atividade é "Sair" e escolher outra na grade.

## O que o consumidor fornece

- `Activity activity` com objetivo, horário (14:00–15:00), passos com estimativa e anotações.
- `int currentStep`, `Duration stepRemaining`, `Duration activityRemaining`, `bool paused`.
- Callbacks: `onCompleteStep`, `onSaveNote`, `onPauseToggle`, `onExit`, `onNext`, `onEndDay`.
- Estado derivado: `over` (tempo do passo negativo) e `ended` (último passo concluído).

## Anatomia e medidas

- Fundo `.aurora` com um radial extra local só nesta tela: `orange` a 6%, 760 × 560px, centrado atrás do anel (a brasa). Quando pausado ele esmaece para 35%; no encerramento vira `violet` a 7%.
- Barra mínima (`space-56` de altura, `.content` até `content-max`): ponto da cor do objetivo (8px), "Estudo de inglês" em `text-primary` e "· Inglês fluente" em `text-secondary` (`body-sm`); à direita `Button` fantasma compacto "Pausar" (ícone `pause`) e "Sair" (ícone `logout`), em `text-secondary`.
- Coluna central (gap 24px, centralizada vertical): `StepProgress` de 8px com até 640px; rótulo `label` "Passo 3 de 5" em `text-secondary` (quando passou do tempo, "+02:10" ao lado em `caption`); título do passo em 40px / 46px, peso 800, tracking -0,9px, até 760px, centralizado; slot de 48px com o chip "2 anotações" ou o composer do `QuickCapture`; `FocusTimer` de 232px; duas ações de 48px: `Button` primário "Concluir passo" com `check` e `Button` secundário "Anotar" com `add`; linha de pontos; rodapé `caption` `text-secondary` "32 min restantes na atividade · termina 15:00".
- Encerramento: `FocusEnd` no lugar da coluna central, com um botão fantasma "Voltar ao passo 3" só no preview.
- Toast de "Sair": `.glass` com "Você saiu do foco. A atividade continua na sua grade." e `Button` fantasma "Desfazer", 6s, na base da tela.

## Estados

- Em andamento: anel respira, segmento atual com glow, brasa visível.
- Pausado: respiração e glow param, número em `text-secondary`, "Pausar" vira "Retomar" com `play_arrow`, a brasa esmaece. Nada mais muda.
- Passou do tempo: anel e segmento completos em laranja estável, "+02:10" no centro e ao lado do rótulo, em `text-secondary`. Sem vermelho, sem piscar.
- Último passo concluído: cross-fade para `FocusEnd` com um pulso violeta.
- Anotando: o composer ocupa o slot sob o título; Enter salva e o chip conta.
- Saindo: Toast com "Desfazer"; sem diálogo de confirmação.

## Mobile e desktop

- Desktop (wide): esta tela. Teclado: `Espaço` ou `Enter` no botão conclui o passo, `N` abre o composer, `Esc` fecha o composer, `P` pausa.
- Celular: ver `ScreenFocoMobile` (mesma hierarquia em coluna, CTA fixo, composer acima do teclado, gesto de deslizar para concluir).
- Tablet (medium): igual ao desktop com `page-pad-wide`.

## Movimento

- Entrada da tela em duas ondas: barra mínima em `.rise.hero` (240ms), depois barra segmentada e título (`--w: 0`) e anel, ações e rodapé (`--w: 1`), tudo dentro de `dur-page`.
- Concluir passo: pulso laranja no segmento (`dur-pulse`, `ease-out-expo`); 220ms depois o segmento esfria para violeta (`dur-base`), o próximo acende, o título troca por cross-fade (`dur-fast`), o anel volta a 0 (`dur-base`, `ease-in-out`) com impulso de escala em `ease-spring`, o número troca por cross-fade e o arco começa a preencher em `ease-settle`.
- Pausar: só `color`, `box-shadow` e `opacity` em `dur-base`.
- Toast: entra `dur-base` `ease-out` subindo 8px, sai `dur-exit` `ease-in`.
- Reduzir movimento: sem respiração, sem mola, sem pulso; trocas diretas e fades de `dur-instant`.

## Acessibilidade

- Título do passo é `h1`; a barra é `progressbar`; o centro do anel é `timer` com `aria-live="off"`; mudanças de passo e de estado são anunciadas uma vez em região `polite`.
- Todos os controles têm 48px de alvo e anel de foco `violet-ink`; "Pausar" expõe `aria-pressed`.
- Contraste: textos passam 4,5:1 sobre `bg`; `orange` como gráfico passa 3:1; a informação nunca depende só da cor (rótulo "Passo 3 de 5", legenda do anel).
- Sem notificações nem interrupções do app enquanto o Foco está aberto.

## Faça e não faça

- Faça: uma coisa aceso (o passo atual), o resto em `text-secondary`.
- Faça: pausar e sair sempre a um clique, sem confirmação; desfazer pelo Toast.
- Não faça: mostrar lista de passos, formulário, menu, trocar atividade ou editar aqui.
- Não faça: dois anéis, dois tempos do mesmo peso, vermelho ou contagem urgente.
- Não faça: topbar completa ou navegação do app por cima do Foco.
