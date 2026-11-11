# Mobile e desktop

O mesmo produto roda no celular e no desktop (e no tablet). A estrutura muda; o vocabulário visual não. Hoje o app tem dois modos (compacto e largo, corte em 1080px). O sistema passa a ter três classes de largura.

## Classes de largura

| Classe | Largura | Margem lateral | Colunas | Navegação | Menu de módulos |
|---|---|---|---|---|---|
| compact (celular) | até 599px | `page-pad-compact` (16px) | 1 | barra inferior (BottomNav) com 4 destinos + "Módulos" | sheet pela borda inferior |
| medium (tablet) | 600 a 1079px | `page-pad-wide` (24px) | 2 | barra superior simplificada | painel ancorado |
| wide (desktop) | 1080px ou mais | `page-pad-wide` (24px) | grade de 12, conteúdo até `content-max` (1048px) | barra superior completa (AppTopBar) | painel ancorado |

## O que muda de uma classe para outra

- **Dashboard:** no compact os cards empilham na ordem Agora, Seu dia, Próximas atividades, Objetivos ativos, Ritmo da semana, Frentes da vida. No wide o Agora fica ao lado dos anéis e o resto vira grade.
- **Anéis do dia:** 3 anéis lado a lado em todas as classes; no compact ficam menores (88px) e o rótulo vai embaixo.
- **Listas:** linha com ícone, título, apoio e valor. No compact o valor desce para a segunda linha quando falta espaço.
- **Tipografia:** `display-lg` só no wide; `display` no compact e no medium.
- **Tabelas e grades de dados:** no compact viram lista de cartões; nunca rolagem horizontal da página.

## Celular: o que acontece agora fica à mão

- **Topo:** o que está acontecendo agora (card Agora no dashboard; o passo atual no Foco). A saudação é curta.
- **Rodapé:** a `BottomNav` em `surface-glass` com 5 destinos no nível dos módulos: Visão geral, Tempo, Saúde, Finanças e Módulos (os dois do meio aparecem como "Em breve" até existirem). Dentro do módulo Tempo, a navegação Hoje / Grade / Objetivos é um controle segmentado no topo da tela, e o Foco entra pelo CTA "Entrar em foco", nunca pela barra. A mesma regra vale para a barra superior do desktop: links de módulo, não de sub-telas. Acima dela, quando há atividade em andamento, um CTA fixo em vidro: "Continuar · Estudo de inglês · 40 min". Nas telas de atividade e de foco, o CTA primário é fixo no rodapé, ao alcance do polegar.
- **Detalhes abrem como Sheet**, nunca como nova tela, quando cabem em uma rolagem (detalhe de atividade, formulário de passo, menu de módulos).
- **Carrosséis horizontais com snap** para coleções pequenas (objetivos), com o próximo item aparecendo 24px para indicar que há mais.
- **Gestos com alternativa visível:** deslizar para concluir passo no Foco (o botão também existe); arrastar o sheet para fechar (o botão também existe).

## Interação

- **Toque (compact e medium):** alvo mínimo `touch-min` (48px); ação principal ao alcance do polegar (parte inferior); gesto de arrastar fecha sheet; sem dependência de hover.
- **Mouse e teclado (wide):** `hit-min` (32px), hover visível, foco visível em tudo, atalhos: `Esc` fecha menu, sheet e diálogo; `Tab` percorre na ordem visual; setas navegam em listas e abas.
- Um componente precisa funcionar nos dois modos de entrada: nunca esconda uma ação atrás de hover.

## Áreas seguras e janelas

- Respeite `SafeArea` (entalhe, barra de gestos) no compact; a BottomNav soma o inset inferior ao próprio padding.
- Teste cada tela em 320, 390, 600, 768, 1080 e 1440px de largura, nos dois temas e com fonte do sistema a 1,3×.
- O texto longo quebra ou termina com reticências dentro do próprio container; nunca empurra a página para o lado.

## Estados de rede e dados

- Todo módulo tem 4 estados desenhados: carregando (esqueleto), vazio (EmptyState com próximo passo), erro (mensagem com ação "Tentar de novo") e preenchido.
- Sem conexão: o app continua com os dados locais e mostra "Sem conexão. Suas mudanças serão enviadas quando voltar." em `caption`, sem bloquear a tela.
