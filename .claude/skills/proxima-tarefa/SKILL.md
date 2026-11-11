---
name: proxima-tarefa
description: Executa a próxima tarefa do sprint atual (ou a tarefa informada, ex. LUME-68) de ponta a ponta com o time de agentes - planejar, implementar, testar, revisar, commitar, abrir o PR para main e registrar no Jira. Retomável em qualquer etapa.
disable-model-invocation: true
---
# Executar tarefa do sprint

Tarefa pedida: $ARGUMENTS (se vazio, descubra a próxima). Valide: só `^LUME-\d+$`; qualquer outra coisa, recuse e pare.

Você (sessão principal) é o **despachante**: chama os agentes, grava o estado e executa o plano. **Sempre multiagentes:** a sessão principal despacha e agentes especializados fazem o trabalho; subagente não chama subagente. Os agentes seguem `docs/org/protocolo.md`. Atualize a linha **Etapa atual** de `docs/tarefas/<código>.md` ao final de **cada** etapa: é isso que permite `/pausar` e `/retomar`. Cada mudança de Etapa atual é refletida sozinha no orquestrador n8n (hooks enviam o evento a `POST {LUME_N8N_URL}/webhook/lume-dev-evento`; painel em `http://localhost:5678/webhook/lume-painel`): você não precisa chamar nada.

**Uma tarefa por sessão.** O estado vive em `docs/tarefas/`, `docs/progresso.md` e no Jira, não na conversa: ao fechar a tarefa, a sessão termina com `/clear` (passo 9). A tarefa ocupa três arquivos: `LUME-<n>.md` (plano, até 150 linhas: é o único que você relê), `LUME-<n>.contratos.md` (contratos longos) e `LUME-<n>.log.md` (append-only: cenários extremos, relatórios, pendências, pausa; leia só o último relatório).

**Jira:** use o MCP Atlassian (`mcp__claude_ai_Atlassian_MCP__*`). Obtenha o `cloudId` uma vez com `getAccessibleAtlassianResources` (site `felipeoliveiranogueira.atlassian.net`) e reuse. Busca: `searchJiraIssuesUsingJql`; leitura: `getJiraIssue`; mudança de status: `transitionJiraIssue` (liste as transições disponíveis da issue antes de escolher o id); comentário: `addOrEditJiraIssueComment`; labels e campos: `editJiraIssue`.

## 0. Pré-checagem
- `git rev-parse --is-inside-work-tree` e `git status --short`. Árvore suja com mudanças de outra tarefa: pare e pergunte.
- Se `docs/tarefas/_atual` aponta para uma tarefa não concluída diferente da pedida: ofereça `/retomar` antes de começar outra.
- Se esta sessão já fechou uma tarefa (o histórico da conversa mostra o passo 9 de outra), peça `/clear` antes de seguir: contexto acumulado é o maior custo do despachante.
- Branch de trabalho: a branch atual (hoje `new-plan/mudanca_de_escopo`) ou uma `feat/LUME-<n>-<slug>` a partir dela, conforme `docs/org/fim-de-tarefa.md`. Nunca trabalhe direto na `main`.

## 1. Descobrir a tarefa
- **Com código:** `getJiraIssue` (título, descrição, critérios de aceite, épico, status). Se já estiver "Em andamento" e não for a de `docs/tarefas/_atual`, avise e pare.
- **Sem código:** JQL `project = LUME AND sprint in openSprints() AND statusCategory != Done ORDER BY Rank ASC` (`searchJiraIssuesUsingJql`). Escolha a primeira **história ou tarefa** (não épico) que esteja "A fazer", sem label `impedimento` e sem dependência aberta (links "is blocked by" não concluídos). Sem sprint ativo ou sem resultado: informe o motivo e sugira `/sprint-planning`; **não grave `_atual`**.
- **Jira fora do ar:** use a tarefa informada ou a primeira da fila em `docs/progresso.md` ainda não concluída; o registro no Jira vira `[pendente-sync]` em `docs/progresso.md` e é refeito depois.
- **Ordem, sem exceção:** (a) escolha e confirme a tarefa; (b) grave o código em `docs/tarefas/_atual` **antes de chamar qualquer agente** (o hook de métricas e o n8n rotulam cada execução com ele); (c) `transitionJiraIssue` para "Em andamento". Numa retomada, não transicione de novo.

## 2. Planejar (Etapa `plano`)
- **Planejar em dupla:** `dev-techlead` (arquitetura, plano de despacho, definição de pronto) e `dev-edge-cases` (cenários extremos), em paralelo quando a tarefa tocar dados pessoais ou de saúde, dinheiro, segurança, sync ou integração externa; senão o `dev-edge-cases` só confere a tabela preliminar do TechLead. Tarefa de produto/escopo (sem código): `produto`. Passe: código, chave do Jira, texto e critérios de aceite da issue, caminho de `docs/tarefas/_modelo.md` e as decisões relevantes de `DECISOES_E_ROADMAP.md`.
- Tarefa de tela ou widget: o plano **cita as seções do Design System v2 "brasa" (D12)** que se aplicam e inclui o passo de `/ds-fidelidade` (dev-frontend-design + dev-qa-extremos) na definição de pronto.
- Tarefa que toque IA: `dev-ia-produto` entra no plano; guardrails obrigatórios (nunca recomendar dose, dado de saúde sensível, pró-humano).
- Grave o resultado em `docs/tarefas/LUME-<n>.md` (até 150 linhas, contratos longos em `LUME-<n>.contratos.md`), crie `LUME-<n>.log.md` com o modelo do fim do `_modelo.md` e grave a tabela de cenários extremos nele. Comente o plano no Jira (`addOrEditJiraIssueComment`, prefixo `[plano]`).
- Dependência nova, licença ou conflito com a arquitetura: chame o `cto` antes de mostrar o plano.
- Mostre ao usuário o resumo (até 15 linhas, com os cenários extremos de impacto alto) e **espere aprovação** (`/KeepWORKING`: aprove você mesmo e registre no Log). Aprovado → Etapa `aprovado`.

## 3. Implementar (Etapa `implementação`)
- **Dimensionar os multiagentes antes de implementar:** a partir da tabela de despacho, decida quais agentes entram, quais passos rodam em paralelo (sem dependência e sem compilar o mesmo módulo: ex. um app Flutter ou um projeto Maven por vez) e quais em sequência; confira que os caminhos exclusivos de cada passo não se sobrepõem; no máximo 8 passos. Registre o dimensionamento na coluna do plano de despacho.
- **Padrão: workflow.** Com o plano aprovado, rode o workflow `executar-plano` (`.claude/workflows/executar-plano.js`) com `args = { "codigo": "LUME-<n>" }`: ele executa os passos (grupos em sequência, paralelo dentro do grupo), o QA, a segurança, até 2 rodadas de correção e o review, e devolve **um** JSON. Leia só o retorno, grave o resumo no `.log.md`, atualize o Jira e siga para o passo 7 (commit) se `resultado` for `concluido`; `parcial` ou `bloqueado` → mostre as pendências e decida se corrige na sessão (retomando agentes pelo ID) ou para.
- Sem workflows disponíveis, siga os passos 3 a 6 abaixo na sessão.
- Siga o plano de despacho. Passos sem dependência: agentes **em paralelo** (várias chamadas na mesma mensagem). Dependentes: em sequência.
- Para cada agente passe **só o briefing do passo** (bloco JSON do arquivo da tarefa), mais o resumo do relatório do passo anterior quando houver dependência. Nunca o histórico da conversa nem o arquivo inteiro.
- Hook de métricas avisou **orçamento estourado**: pare e pergunte (aumentar, cortar escopo ou terminar). Agente bateu o `maxTurns`: saída parcial, **retome o mesmo agente** (SendMessage ao ID) com um pedido mais estreito.
- **Guarde o ID de cada agente** que terminou na coluna "ID do agente" do plano de despacho: é por ele que a correção acontece.
- **Jira ao vivo, a cada entrega:** ao lançar um agente, as subtarefas que ele cobre vão para "Em andamento"; ao entregar, comentário `[feito]` (agente + resumo + arquivos principais); depois do QA aprovado, concluídas. Falha ou bloqueio: comentário `[bloqueio]` na hora.
- Agente reportou plano errado: pare e leve ao `dev-techlead` (ou ao usuário, se mudar escopo).

## 4. QA (Etapa `qa`)
- QA indicado no plano (`dev-qa-funcional`; `dev-qa-automacao` para fluxos integrados; `dev-qa-extremos` para extremos). Testes **só pelo resumo**: `node scripts/dev/ci.mjs --resumo <etapa>` com etapa em `app`, `legado`, `servidor`, `n8n` ou `tudo`. Falhou: **retome o implementador responsável pelo ID** (SendMessage) com só as pendências e os arquivos exatos; nunca um agente novo do mesmo papel. Sem ID (sessão nova), agente novo com briefing de 3 a 5 arquivos. **No máximo 2 voltas**; depois pare, explique o bloqueio e chame `qual-melhoria-continua` se a causa se repetiu.
- Tarefa de tela: rode `/ds-fidelidade` aqui.

## 5. Segurança (Etapa `seguranca`, só se o plano disser `seguranca: sim`)
- Chame o especialista indicado (`seg-appsec`, `seg-dados`, `seg-privacidade-dpo`; `seg-lider` para consolidar quando mais de um). Dado de saúde ou pessoal: `seg-dados` e `seg-privacidade-dpo` sempre. Achado crítico/alto: volta ao implementador, retomado pelo ID (máx. 2 voltas). Médio/baixo: vira issue no Jira (bug, label `seguranca`, prefixo da severidade no título) e segue.

## 6. Review (Etapa `review`)
- `dev-techlead` revisa o diff e, **em paralelo**, o `dev-edge-cases` confere se cada cenário marcado como "tratar" foi tratado (pendente conta como bloqueio). Corrija tudo em "Bloqueia o commit", retomando o implementador pelo ID (máx. 2 voltas). Bloqueio que exige mudar o plano: volte ao usuário.
- Entrega externa (release, fim de entrega E*): antes do commit, chame em paralelo `qual-revisor-critico` e `seg-lider`.

## 7. Commit e PR (Etapas `commit` e `pr`)
- `git add` só dos arquivos da tarefa (nunca `.env`, segredos ou arquivos alheios). Mensagem: `tipo(LUME-68): resumo` com `tipo` em `feat|fix|refactor|test|docs|chore|perf|style` e `LUME-68` = a chave da tarefa; corpo listando os itens da definição de pronto concluídos; a última linha do corpo é:

```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

- **Fim por Pull Request para `main`** (`docs/org/fim-de-tarefa.md`): `git push -u origin <branch>`; `gh pr create --base main --title "tipo(LUME-<n>): resumo" --body "<corpo>"` (se já houver PR da branch, reutilize: `gh pr view`). O corpo traz resumo, itens de pronto, como testar, o resumo de `ci.mjs --resumo` e termina com a linha `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. O merge é do Felipe depois do CI verde, salvo instrução contrária; nunca `--force`, nunca `--admin`. Erro de `push` ou `gh` (`C:\Program Files\GitHub CLI\gh.exe` se não estiver no PATH): relate; o commit local continua valendo.

## 8. Registrar (Etapa `registro`)
- `ops-gestor-demandas` (único que escreve no Jira nesta etapa): subtarefas concluídas, comentário `[feito]` com o link do PR e `[próximo]`, worklog das horas, transição para concluída (só com QA e review aprovados **e o PR mesclado**; antes do merge a história fica "Em andamento") e os agentes que trabalharam (label `agente-<nome>` + comentário com os títulos).

## 9. Fechar (Etapa `concluida`)
- Acrescente a última linha da tarefa em `docs/progresso.md` (data, código, resultado, PR, custo ponderado), esvazie `docs/tarefas/_atual` e apague a passagem `docs/tarefas/_retomada*.md` se for desta tarefa. Ofereça `/melhoria` se houve lição (`docs/dev/licoes.md`).
- Diga ao usuário em poucas linhas: o que ficou pronto, o que ficou pendente, o custo e qual é a próxima tarefa do sprint.
- **Termine pedindo `/clear`** antes do próximo `/proxima-tarefa`: a próxima tarefa reconstrói tudo de `docs/tarefas/`, `DECISOES_E_ROADMAP.md` e do Jira. Não comece outra tarefa nesta sessão, mesmo em execução autônoma.

Pare e pergunte sempre que a tarefa exigir decisão que contradiga o roadmap, o DS v2 ou a arquitetura.
