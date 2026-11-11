---
name: ds-fidelidade
description: Verifica se telas e widgets do app Flutter seguem fielmente o Design System v2 "brasa" (tokens, raios concêntricos, superfícies, vidro só em flutuantes, movimento, tema claro/escuro, compact/medium/wide, goldens e contraste). Delega a dev-frontend-design e dev-qa-extremos. Uso - /ds-fidelidade [arquivos, pasta ou tarefa]
disable-model-invocation: true
---
# Fidelidade ao Design System v2 "brasa"

Escopo: $ARGUMENTS (se vazio, as mudanças em `app/` desde o último commit: `git diff --stat` e `git status --short`). Fonte da verdade: D12 em `DECISOES_E_ROADMAP.md` e o DS v2 em `docs/design-system/` (cópia do artefato https://claude.ai/artifact/9TAdTj4LkKjQRPiaVbH9XK: `README.md` brand book, `tokens.json`, `flutter.md`, `motion.md`, `responsive.md`, `tasks-and-focus.md` e `components/<Nome>/`). Passe aos agentes os caminhos dos arquivos relevantes ao escopo; em conflito, vale o artefato.

1. Defina o escopo concreto (arquivos `.dart` de `app/lib/` e goldens em `app/test/`). Sem mudança em `app/`: diga e pare.
2. Em paralelo, com o escopo e a fonte da verdade:
   - **`dev-frontend-design`** audita o código contra a lista abaixo e devolve achados com arquivo e linha, e **corrige** o que for desvio mecânico (token, raio, sombra) dentro do escopo;
   - **`dev-qa-extremos`** exercita os extremos: fonte ampliada (1,3×), 320 px até desktop, tema claro e escuro, `disableAnimations`, estados vazio/erro/carregando, textos longos, contraste e goldens.
3. Lista de conferência (cada item: conforme, desvio ou não se aplica):
   - **Tokens:** cores só de `app_colors.dart` (tokens v2); nenhuma cor, espaçamento, raio ou sombra literal solta; sem a paleta antiga da D9.
   - **Fonte de luz:** uma por tela (brilho + respiração de 6 s), só no elemento que acontece agora.
   - **Superfícies:** camadas `surface` com linha fina no topo e sombras `elev-1/2/3` em duas camadas; **sem `Card` do Material**.
   - **Aurora de fundo:** dois gradientes radiais, uma vez por página, no scaffold (`AppPageScaffold` v2).
   - **Vidro:** `surface-glass` + blur 20 **somente** em flutuantes: BottomNav, Sheet, menu de módulos e Toast. Vidro em qualquer outro lugar é desvio.
   - **Raios concêntricos:** 16 → 12 → 8 → 4 (raio interno = raio externo − padding).
   - **Progresso que "acende":** cabeça luminosa laranja → brasa; passos concluídos esfriam para violeta.
   - **Movimento:** `ease-out` para entrar, `ease-in` (mais curto) para sair, mola só ao soltar botão, marcar check ou trocar de passo; `disableAnimations` respeitado em tudo.
   - **Tema claro e escuro:** ambos renderizam sem token faltando (D2); o tema claro definitivo é LUME-23.
   - **Responsividade:** classes compact, medium e wide (BottomNav em vidro no compact); sem overflow nem rolagem horizontal.
   - **Pró-humano:** sem gatilho de vício, comparação ou punição na cópia e na animação (D3).
   - **Goldens e contraste:** goldens existem e passam nos dois temas e nas três classes; teste de contraste passa (texto ≥ 4,5:1; componentes e foco ≥ 3:1).
4. Rode `node scripts/dev/ci.mjs --resumo app` e anexe o resumo (análise estática, testes, goldens). Goldens que mudaram de propósito só são atualizados com o desvio justificado na tarefa.
5. Consolide e mostre ao usuário: veredito (`fiel` ou `com desvios`), tabela de desvios (item, arquivo, gravidade, correção) e o que já foi corrigido. Desvio que exige decisão de design (não está no DS) vai para o `dev-designer`; se contradisser a D12, para `produto`. Em tarefa de `/proxima-tarefa`, desvio aberto bloqueia o commit.
