---
name: KeepWORKING
description: Modo autônomo. O Felipe saiu: continue o sprint tarefa após tarefa sem esperar resposta. Toda decisão que dependeria dele vira item em docs/pendencias.md e o trabalho segue para a próxima tarefa. Só /ComeBack encerra o modo.
disable-model-invocation: true
---
# /KeepWORKING · trabalhar sem o Felipe

Instrução extra do usuário: $ARGUMENTS

O backlog é grande e **nenhuma noite pode ficar parada**. Enquanto este modo estiver ligado, você **nunca espera resposta**: quando precisar de uma decisão do Felipe, registra a pendência e passa para a próxima tarefa. Só `/ComeBack` desliga o modo.

## 1. Ligar o modo (faça agora)
1. Grave `autonomo` em `docs/tarefas/_modo` (uma palavra). É esse arquivo que mantém o modo ligado depois de `/clear`, de compactação ou de outra sessão: o hook de início de sessão o lê.
2. Garanta que `docs/pendencias.md` existe (crie com o cabeçalho do "Formato" abaixo se faltar) e acrescente a linha `## Sessão autônoma iniciada em dd/MM/yyyy HH:mm` (fuso America/Sao_Paulo).
3. Responda em até 3 linhas ("modo autônomo ligado, começando por <tarefa>") e **comece a trabalhar na mesma resposta**, sem perguntar nada.

## 2. Laço de trabalho
Repita até acabar o backlog executável do sprint:
1. **Escolha a tarefa:** `docs/tarefas/_atual` (se houver, retome com a lógica de `/retomar`); senão a próxima do sprint pelo JQL `project = LUME AND sprint in openSprints() ...` (passo 1 do `/proxima-tarefa`, via MCP Atlassian); sem Jira, a fila de `docs/progresso.md`. Pule tarefas bloqueadas por pendência aberta em `docs/pendencias.md` ou com label `impedimento`.
2. **Execute pelo fluxo normal de `/proxima-tarefa`** (dimensionar multiagentes, `dev-techlead` + `dev-edge-cases`, implementação, QA, `seg-*` se couber, review, commit, PR, Jira, registro). Sempre multiagentes: a sessão principal despacha, subagente não chama subagente. Diferenças deste modo:
   - o plano do `dev-techlead` é **aprovado por você** (registre no Log: "aprovado pelo despachante (modo autônomo)"); não mostre resumo esperando resposta;
   - `AskUserQuestion` é **proibido**; nenhuma resposta termina esperando o Felipe;
   - decisão que os documentos respondem: siga o documento (`DECISOES_E_ROADMAP.md`, DS v2 "brasa"). Que não respondem: escolha a opção **mais segura e reversível**, registre em `docs/decisoes/` e **também** em `docs/pendencias.md` como `decisão-tomada-confirmar`;
   - orçamento estourado (hook de métricas): vale a regra do projeto (até 2x segue; acima, passagem de contexto completa para outro agente/sessão), nunca parar para perguntar.
3. **Ao concluir ou bloquear a tarefa**, atualize Jira e `docs/progresso.md` e vá para a próxima. Sem resumo longo entre tarefas. Cada mudança de etapa vai sozinha ao orquestrador n8n (painel `http://localhost:5678/webhook/lume-painel`).

## 3. O que vira pendência (a tarefa pula para a próxima)
Registre em `docs/pendencias.md` e **não execute**:
- credenciais, tokens, `.env`, contas, passos manuais do Felipe;
- gasto de dinheiro ou contratação (hospedagem, planos, domínios, APIs de IA pagas), envio de mensagens a terceiros, publicação externa (deploy, loja de apps, post), ação irreversível ou destrutiva (apagar dados, `push --force`, drop, rollback);
- decisão de produto sem resposta nos documentos (escopo, prioridade entre entregas, política de dados de saúde) quando não existir opção segura;
- conferência visual ou aprovação de design que só ele pode dar (entregue pronto para ver e marque a tarefa como `aguardando conferência`);
- merge do PR para `main` (o PR fica aberto e pronto);
- bloqueio técnico após 2 voltas de correção sem avanço.

Para cada pendência, **deixe tudo pronto** até o ponto de decisão (código, rascunho, comando exato) para o Felipe só dizer sim/não ou colar o dado. Registre também no Jira (comentário `[bloqueio]`) quando houver chave.

## 4. Regras que valem sempre (não relaxam no modo autônomo)
- Qualidade acima de tokens e de limites; fidelidade ao planejado e **fiel ao Design System v2 "brasa" (D12)**; `dev-edge-cases` confere botões, campos e fluxos de ponta a ponta antes de dar algo por pronto. Nada de "pronto" sem rodar os testes pelo resumo (`node scripts/dev/ci.mjs --resumo <etapa>`) e conferir o resultado.
- Guardrails de produto: pró-humano, dado de saúde sensível, nunca recomendar dose.
- Git: branch de trabalho (`new-plan/mudanca_de_escopo` ou `feat/LUME-<n>-<slug>`); fim de tarefa por **PR para `main`** (`docs/org/fim-de-tarefa.md`), sem mesclar. Nunca `push --force`. Não commite arquivos alheios à tarefa.
- QA encerra os servidores que subir (por exemplo o `dev_server.mjs` na porta 5500).
- Segredos nunca em arquivo versionado nem na resposta. Não leia nem edite `.env`.

## 5. Continuidade e "clear"
Esta skill não digita `/clear`, mas pode **pedir** para o hook `Stop` fazê-lo, se o hook de limpeza do projeto existir. Ao terminar cada tarefa (estado já gravado) e sempre que o contexto estiver grande, grave `docs/tarefas/_limpar-pedido` (vazio, ou com o texto de retomada; o padrão é `/KeepWORKING continuar`) e **encerre o turno** com uma linha ("tarefa X pronta, limpando o contexto"). Só funciona com o modo `autonomo` ligado. Sem o hook, siga o laço da seção 2 na mesma sessão, deixando o estado em dia.

O estado vive nos arquivos, não na conversa. Ao terminar cada tarefa (e antes de o contexto encher), garanta que `docs/tarefas/_atual`, o `.log.md` da tarefa e `docs/tarefas/_retomada.md` dizem onde parou e o próximo passo. Se a sessão reabrir com `docs/tarefas/_modo` = `autonomo`, continue o laço sem perguntar. Se não restar tarefa executável (tudo pronto ou pendente), escreva o resumo final e **pare**, sem inventar trabalho.

## Formato de `docs/pendencias.md`
O `/ComeBack` transforma esta lista num relatório detalhado, agrupado por assunto e com as perguntas prontas. Por isso **registre cada pendência com detalhe suficiente, na hora**, sem depender da memória da conversa:
```
- [ ] dd/MM/yyyy HH:mm · LUME-<n> · assunto: <credenciais | gastos | publicações | design | produto | arquitetura | bloqueio técnico | decisão-tomada-confirmar> · urgência: alta|média|baixa
  - contexto: <o que fazia e por que parou>
  - pronto: <arquivos, branch, comando, rascunho>
  - trava: <tarefas que dependem disso>
  - opções: A) … B) … · recomendação: X porque …
  - pergunta: <uma pergunta fechada>
  - depois da resposta: <passos exatos>
  - onde: <arquivo/Jira/log>
```
