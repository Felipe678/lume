# Protocolo comum dos agentes

> Todo agente de `.claude/agents/` segue este protocolo. O que é específico do projeto está em `docs/projeto/perfil.md`.

## 1. Ao começar (leia só o necessário: contexto é custo)
1. **Seu briefing** (bloco JSON do seu passo, recebido do comando) é a sua tarefa. Não leia o arquivo da tarefa inteiro nem o histórico; se o briefing não bastar, peça o que falta no relatório em vez de explorar.
2. Do `docs/projeto/perfil.md`, leia as seções 3 (comandos) e 4 (convenções) e, na seção 5, **só o bloco do seu papel**. **O perfil manda**: se ele disser como algo é feito, faça assim.
3. Em `docs/dev/licoes.md`, aplique só as linhas do seu papel.
4. Antes de questionar algo que parece já decidido, procure em `docs/decisoes/` e na seção 3 de `DECISOES_E_ROADMAP.md` (D1 a D13). Só reabra o assunto com fato novo.
5. Líderes (que planejam) leem o plano da tarefa (`docs/tarefas/<LUME-n>.md`) e o roadmap inteiros; executores, não. Contratos longos estão em `<LUME-n>.contratos.md`: leia só a seção citada no seu `contexto_minimo`.
6. Sem briefing (consulta avulsa)? Trabalhe só com o pedido recebido e diga isso no relatório.

## 2. Durante
- Faça **só o seu passo**. O que for de outro papel vira pendência no relatório, com o agente sugerido.
- **Plano errado ou incompleto?** Pare e reporte: o que está errado, a evidência e o que recomenda. Não improvise contratos, não troque tecnologia, não mude escopo.
- Sem over-engineering: o menor desenho que cumpre a definição de pronto.
- **Testes e build só pelo resumo:** `node scripts/dev/ci.mjs --resumo <etapa>` (contagens e só as falhas, até 40 linhas). O comando cru do perfil só quando o resumo não explica a falha, e então só o trecho que interessa.
- Você tem um limite de chamadas (`maxTurns` do seu papel). Perto dele, pare e entregue o relatório com `Resultado: parcial` e o que falta: o comando retoma você pelo ID, com o seu histórico.
- Nada que muda por ambiente vai fixo no código: tudo vem de configuração.
- Segredos só por variável de ambiente. Você **não lê nem edita `.env`**; documente variáveis novas no `.env.example`.
- Dados pessoais e de saúde: só o necessário, nunca em logs, URLs ou exemplos. Use dados fictícios.

## 3. Proibido
- **Commitar, fazer push ou mexer em branches.** Quem fecha a tarefa é o comando (`/proxima-tarefa`), seguindo `docs/org/fim-de-tarefa.md`.
- **Chamar outros agentes.** Subagente não chama subagente; se precisar de alguém, peça no relatório.
- Alterar arquivos fora do escopo do seu papel (veja "Pode editar" no seu agente).
- Escrever no Jira. Todo registro no Jira é feito **somente** pelo `ops-gestor-demandas`, via MCP Atlassian (projeto LUME, site `felipeoliveiranogueira.atlassian.net`). Não existe script de Jira.
- Recomendar dose de qualquer medicamento, em código, texto, prompt ou teste (ver perfil §5, IA e saúde).
- Divergir do Design System v2 "brasa" (D12) por gosto próprio: ver §8.

## 4. Ao terminar: relatório
Acrescente ao fim do **log da tarefa**, `docs/tarefas/<LUME-n>.log.md` (append-only; sem permissão de escrita, devolva no texto), e devolva como resposta final:

```
### <agente> · <dd/MM/yyyy HH:mm> · passo <n>
Resultado: concluído | parcial | bloqueado
Arquivos: <caminhos criados/alterados>
Comandos: <comando> → <resultado resumido> (um por linha)
Desvios do plano: <nenhum | o quê e por quê>
Pendências: <item → agente sugerido>
```

Relatório honesto: teste que falhou é "falhou", passo pulado é "pulado". Nunca declare "pronto" sem ter rodado a verificação.

## 5. Líderes: plano de despacho
Líderes (`cto`, `produto`, `dev-techlead`, `seg-lider`) **não executam**: devolvem um plano que o comando grava em `docs/tarefas/<LUME-n>.md` e executa. Formato:

```
| # | Agente | Entrada | Saída esperada | Depende de | Status |
|---|--------|---------|----------------|------------|--------|
| 1 | dev-backend-dados | contrato X | migração V1 | — | pendente |
| 2 | dev-backend-dominio | entidades + regras | testes verdes | 1 | pendente |
```
- Passos sem dependência entre si rodam **em paralelo**.
- Indique **um** QA para a tarefa e se ela precisa de revisão de segurança (`seguranca: sim/não` + especialista).
- No máximo 8 passos. Mais do que isso: quebre a tarefa.
- **Plano enxuto: até 150 linhas** no `<LUME-n>.md`. Contratos longos vão para `<LUME-n>.contratos.md`, e o briefing cita a seção pelo nome em vez de copiá-la. Cenários extremos, relatórios e pausa vão para `<LUME-n>.log.md`.
- Escreva um **briefing** por passo (modelo em `docs/tarefas/_modelo.md`): só o contexto mínimo daquele passo.
- Defina o **orçamento ponderado** (padrão 2.000.000 tokens ponderados: entrada + saída × 5 + escrita de cache × 1,25 + leitura de cache × 0,1; tarefas pequenas, menos). O limite por passo é o `maxTurns` do papel.
- **Acione o mínimo necessário:** cada agente a mais é uma chamada inteira. Se um executor resolve, não ponha dois; se a tarefa é trivial, o próprio comando faz sem agente (mas veja §8).

## 5.1 Questionar com critério
- Só questione quando um item do checklist do seu papel falhar (dado contradiz o perfil ou a base, contrato incoerente, risco não tratado).
- Formato: **Problema · Evidência · Sugestão**, em até 5 linhas.
- No máximo **2 rodadas** entre os mesmos dois agentes; sem acordo, decide o líder (ou o usuário).
- A rodada de correção (após QA, segurança ou review) **retoma o mesmo agente pelo ID**, com só as pendências e os arquivos exatos; agente novo paga a leitura do módulo de novo.

## 6. Escalonamento
| Situação | Vai para |
|---|---|
| Dúvida técnica, dependência nova, licença, conflito com a arquitetura, ADR | `cto` |
| Prioridade, escopo, roadmap, regra de produto, conflito entre frentes | `produto` (decisão final do usuário) |
| Risco de segurança, dado pessoal ou de saúde, incidente | `seg-lider` (incidente: `/incidente`) |
| Erro que se repete (2 voltas na mesma causa) | `qual-melhoria-continua` |
| Decisão estratégica com várias visões | `/conselho` |

A decisão final sobre plano, escopo e risco aceito é sempre do usuário.

## 7. Regras permanentes de orquestração
1. **MCP só no `mcpServers` do agente que usa**; nunca global.
2. **Run grande (workflow) só depois de uma tarefa pequena medida** com `node scripts/dev/metricas.mjs --tarefa <LUME-n>`.
3. **Execução sem supervisão** (`_modo` = `autonomo`) sempre com allowlist, `dontAsk`, timeout e teto de orçamento.
4. **Dois números fora da meta na mesma semana:** parar e abrir uma melhoria (`/melhoria`).
5. **Uma tarefa por sessão do despachante**; tarefa nova começa com contexto limpo.
6. **Eventos ao n8n:** o despachante (não o agente) envia `POST {LUME_N8N_URL}/webhook/lume-dev-evento` com `X-Lume-Token` e o corpo `{tarefa, etapa, agente, status, resumo, sessao, ts}` a cada mudança de etapa. Falha do n8n nunca bloqueia a tarefa (ver `docs/org/n8n.md`).

## 8. Multiagentes sempre e fidelidade ao DS (regras permanentes)
- **SEMPRE multiagentes/subagentes.** Todo trabalho do Lume é feito por agentes do plano de despacho, com a sessão principal só despachando, integrando e fechando. A sessão principal não implementa nem revisa sozinha o que um agente do papel faria. Exceção única: ajuste de uma linha sem risco (typo em doc), declarado no log.
- **Independentes em paralelo:** passos sem dependência saem na mesma chamada. Revisão (QA, segurança, `qual-revisor-critico`) é de agente diferente de quem implementou.
- **Fidelidade ao Design System v2 "brasa" (D12).** Qualquer tela, widget ou token segue o DS à risca: valores só de tokens, nenhuma cor, raio, sombra ou duração solta. Toda tarefa de UI inclui `dev-frontend-design` e passa pela skill `ds-fidelidade` antes do QA. Divergência só com ADR aprovado pelo usuário; o que o DS não cobre vira pendência para `dev-designer`.
- **IA com guardrails.** IA é permitida em funcionalidades dinâmicas, sempre sob o desenho do `dev-ia-produto` e a revisão de `seg-privacidade-dpo`: nunca recomenda dose, dado de saúde é sensível (LGPD art. 11), tom pró-humano (sem culpa, comparação ou gatilho de vício).
