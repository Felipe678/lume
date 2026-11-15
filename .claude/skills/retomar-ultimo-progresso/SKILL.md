---
name: retomar-ultimo-progresso
description: Ao voltar ao trabalho, levanta o estado real do projeto (última alteração, worktree, último commit e push, pendências da sessão anterior, Jira), concilia Jira e documentação com a situação atual e retoma a análise. Use no início de qualquer sessão de retorno.
disable-model-invocation: true
---
# Retomar último progresso

Diferença para `/retomar`: aquele continua **uma tarefa pausada** com `/pausar`. Este é o ritual de **volta ao trabalho**: serve mesmo sem pausa registrada, olha o projeto inteiro e termina propondo o próximo passo. `$ARGUMENTS` é ignorado.

Regras do time valem aqui: a sessão principal despacha e **subagente não chama subagente**; só o `ops-gestor-demandas` escreve no Jira; nunca ler nem imprimir `.env`; sem dado de saúde em texto. Modo `autonomo` (`docs/tarefas/_modo`): não use `AskUserQuestion` e siga com o padrão declarado.

## Onda 1: um subagente por tarefa, em paralelo (só leitura)

Despache os quatro na **mesma mensagem**. Cada um devolve no máximo 15 linhas, em fatos, sem opinião.

| # | Tarefa | Agente | Escopo |
|---|--------|--------|--------|
| A | **Git e worktree** | `Explore` | `git fetch` (falha de rede: diga e siga); `git status -sb`; branch atual e a que o upstream aponta; `git stash list`; último commit (hash, data, mensagem); último push (`git log -1 @{u}`) e commits à frente/atrás do remoto e da `main`; arquivos modificados ou não rastreados (inclua `retomada.md` na raiz, se houver); última alteração em arquivo, **ignorando** `app/build`, `node_modules`, `.git` e `docs/metricas`; `gh pr list --state open` e `--state merged --limit 3` |
| B | **Pendências da sessão anterior** | `Explore` | `docs/tarefas/_atual`, `_modo`, `_retomada.md`, `retomada.md` da raiz, último bloco `### Pausa` e último relatório do `.log.md` da tarefa; `docs/pendencias.md` (itens `- [ ]` por assunto); últimas 15 linhas de `docs/progresso.md`; `TODO`/`FIXME` introduzidos nos últimos commits |
| C | **Jira (leitura)** | `ops-gestor-demandas` | Só leitura; `cloudId` por `getAccessibleAtlassianResources`. Sprint ativo (`sprint in openSprints()`), issues em andamento, label `impedimento`, filhos do épico em curso (`parent = LUME-67` etc.; a resposta é grande, filtre os campos), status e data de atualização de cada uma |
| D | **Ambiente** | `Explore` | `node --version`, `flutter --version`, `gh auth status`, Docker e n8n no ar (`curl -s -m 3 http://localhost:5678/healthz`); fora do ar é só uma linha, nada bloqueia |

## Onda 2: conciliação (depende da Onda 1)

A sessão principal cruza A, B, C e D e monta a tabela **fato → Jira → documentação**. Divergências típicas: commit de `feat(LUME-n)` com a issue ainda "A fazer"; issue "Feito" sem linha em `docs/progresso.md`; PR mesclado com pendência ainda marcada aberta; pendência resolvida que continua em `docs/pendencias.md`; worktree sujo sem tarefa dona.

Depois despache **um** `ops-gestor-demandas` (escrita) com a lista exata de ajustes: transições, comentário `[retomada]` com o commit e a data, labels e linhas em `docs/progresso.md`. Regras:
- Só ajuste o que a evidência prova (commit, PR, teste, arquivo). Dúvida não vira edição: vira pergunta ao Felipe (no modo `autonomo`, item em `docs/pendencias.md`).
- Nunca feche issue sem critério "Pronto quando" comprovado; nunca crie issue sem o Felipe pedir.
- Pendência que o Jira não cobre e que nasceu da sessão anterior: proponha a issue, não crie sozinho.

## Onda 3: análise e continuação

1. Se algo ficou pela metade (tarefa em `_atual`, worktree sujo de tarefa conhecida), proponha terminar **antes** de pegar tarefa nova e use `/retomar LUME-<n>` para essa tarefa.
2. Sem pendência de execução: recomende a próxima tarefa do sprint pela ordem do Jira, respeitando dependências do épico, e ofereça `/proxima-tarefa`.
3. Se a sessão anterior deixou decisão do Felipe em aberto (`docs/pendencias.md`, seção "Aguardando decisão"), liste no máximo 3, com recomendação e padrão.

## Resposta final (até 25 linhas)

1. **Onde paramos:** última alteração, último commit, último push, worktree (limpo ou lista), branch e PRs.
2. **Jira:** sprint (feito/total), em andamento, impedimentos; o que foi ajustado nesta retomada.
3. **Pendências da sessão anterior** e divergências que sobraram.
4. **Próximo passo recomendado** e o comando para executá-lo.

## Erros comuns
- Ler `app/build` ou `docs/metricas` como "última alteração": são gerados, ignore.
- Atualizar o Jira com base na memória da conversa em vez de commit, PR ou teste.
- Pedir ao subagente para chamar outro subagente: a Onda 2 é da sessão principal.
