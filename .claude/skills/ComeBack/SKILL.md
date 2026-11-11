---
name: ComeBack
description: Desliga o modo autônomo (/KeepWORKING) e volta ao modo normal. Gera e abre no VS Code um .md com TODAS as pendências do caminho, no maior nível de detalhe, agrupadas por assunto e com as perguntas já prontas para o Felipe responder.
disable-model-invocation: true
---
# /ComeBack · voltar ao modo normal

Observação do usuário: $ARGUMENTS

## 1. Deixar o trabalho em ponto seguro
Se um agente ou etapa estiver no meio, deixe a tarefa num ponto seguro (nada de árvore com meia edição; se preciso, use a lógica de `/pausar`) e grave o estado em `docs/tarefas/_retomada.md`.

## 2. Desligar o modo
Grave `normal` em `docs/tarefas/_modo`. A partir daqui vale o **modo normal**: você trabalha junto com o Felipe, pergunta quando precisar de decisão e **não adiciona mais nada à lista de pendências**.

## 3. Montar o relatório de pendências
1. Leia `docs/pendencias.md` (itens `- [ ]` abertos desde a última linha `## Sessão autônoma iniciada…`, mais os `- [ ]` antigos ainda abertos), os `.log.md` e `docs/decisoes/` criados na sessão, o `git log` desde o início da sessão, os PRs abertos (`gh pr list --state open --base main`) e os comentários `[bloqueio]` no Jira (`searchJiraIssuesUsingJql`, MCP Atlassian). Não dependa da memória da conversa.
2. Acrescente a `docs/pendencias.md` a linha `## Sessão autônoma encerrada em dd/MM/yyyy HH:mm` (única escrita permitida nesse arquivo).
3. Crie `docs/pendencias/AAAA-MM-DD-HHmm.md` (crie a pasta se faltar; fuso America/Sao_Paulo) com **este modelo**, em português do Brasil:

```
# Pendências da sessão autônoma · dd/MM/yyyy HH:mm
> Responda escrevendo depois de "**Resposta:**" (ou marque a opção). Quando terminar, diga "respondi" e eu aplico tudo.

## Resumo
- Período: início → fim · Tarefas concluídas: N · Pendências abertas: N · Decisões a ratificar: N
- Mais urgente (destrava mais trabalho): <lista de 3 itens>

## Feito nesta sessão
| Tarefa | Jira | Commit | PR | Resultado | O que você vê |

## 1. <Assunto> (ex.: Credenciais e acessos | Gastos e contratações | Publicações e deploys | Design e conferência visual | Decisões de produto | Arquitetura e técnica | Bloqueios técnicos | Decisões que tomei e preciso que ratifique)
### 1.1 <título curto> · LUME-<n> · urgência: alta|média|baixa
- **Contexto:** o que estava sendo feito e por que parou.
- **O que já está pronto:** arquivos, branch, comandos, rascunhos.
- **O que trava:** quais tarefas dependem disso.
- **Opções:** A) … (prós/contras, custo, risco) · B) … · **Recomendação:** X, porque …
- **Pergunta:** <pergunta fechada, uma só, que se responde com A/B ou um dado>
- [ ] A  [ ] B  [ ] Outra
- **Resposta:** 
- **Depois da resposta eu faço:** <passos exatos>
- **Onde:** arquivo/Jira/log.

## Decisões que tomei sozinho (ratificar)
(mesmo formato; pergunta: "Confirma ou prefere outra?", com o que muda se ele discordar)

## PRs aguardando merge
- [ ] #<n> · LUME-<n> · <título> · CI <verde|vermelho> · <link>

## Passos manuais seus (sem pergunta)
- [ ] <o que fazer> · <comando/onde clicar> · <por quê>

## Ordem sugerida para responder
1. … 2. … (a que mais destrava primeiro)
```
Regras do relatório: **uma pergunta fechada por item**, nunca "o que você acha?"; sempre com recomendação e consequência de cada opção; agrupar por assunto e, dentro do assunto, da maior para a menor urgência; nenhum segredo no arquivo; nada de item sem "Depois da resposta eu faço".

## 4. Abrir no VS Code
Rode `code "<caminho absoluto do relatório>"` (o `code` costuma estar no PATH). Se falhar, diga o caminho completo do arquivo na resposta.

## 5. Resposta no chat (até 12 linhas)
Número de tarefas feitas e de pendências por assunto, o caminho do relatório, e: "Responda no arquivo e diga **respondi**" (ou responda aqui por item, ex.: `1.1 A`). Quando ele responder, aplique cada resposta (passos de "Depois da resposta eu faço"), marque `[x]` em `docs/pendencias.md`, comente no Jira e destrave as tarefas dependentes.
