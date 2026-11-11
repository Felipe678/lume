# LUME-<n> · <título>

<!-- Uma tarefa ocupa três arquivos (o hook tamanho-tarefa avisa se este passar de 150 linhas):
     LUME-<n>.md            este plano: objetivo, pronto, despacho e briefings. O despachante relê só este.
     LUME-<n>.contratos.md  contratos longos; lido só pelos passos que o citam no contexto_minimo.
     LUME-<n>.log.md        append-only: cenários extremos, relatórios dos agentes, pendências e pausa.
                            O despachante lê só o último relatório. Modelo no fim deste arquivo.
     Estado da sessão: docs/tarefas/_atual (chave da tarefa em andamento) e _modo (normal | autonomo). -->

- **Jira:** LUME-<n> (épico LUME-<n>)
- **Etapa atual:** plano | aprovado | implementação | qa | seguranca | review | commit | registro | concluida
- **Atualizado em:** dd/MM/yyyy HH:mm
- **Orçamento (ponderado):** 2.000.000 <!-- entrada + saída×5 + escrita de cache×1,25 + leitura×0,1, somando todos os agentes; tarefas pequenas, menos -->
- **Gasto até agora:** `node scripts/dev/metricas.mjs --tarefa LUME-<n>`
- **UI:** sim | não <!-- sim = dev-frontend-design obrigatório e skill ds-fidelidade antes do QA -->
- **IA:** sim | não <!-- sim = dev-ia-produto + seg-privacidade-dpo; guardrails do perfil §5 -->

## Objetivo
<uma frase>

## Definição de pronto
Cada item verificável (comando, teste ou checagem objetiva). Testes pelo `node scripts/dev/ci.mjs --resumo <etapa>`.
- [ ] <item do critério do roadmap/Jira> → verificação: `<comando ou checagem>`
- [ ] `flutter analyze` limpo e `flutter test` verde → `node scripts/dev/ci.mjs --resumo app`
- [ ] (UI) fiel ao DS v2 "brasa": sem valor visual solto, uma fonte de luz, vidro só em flutuantes → skill `ds-fidelidade`
- [ ] Cenários extremos tratados ou aceitos (`LUME-<n>.log.md`)
- [ ] QA aprovado · review do `dev-techlead` aprovado · (`seguranca: sim`) revisão `seg-*` aprovada
- [ ] Commit `tipo(LUME-<n>): resumo` e PR para `main` (`docs/org/fim-de-tarefa.md`)

## Contratos
<só o que cabe em poucas linhas; o resto em LUME-<n>.contratos.md, com uma seção por contrato citada pelo nome>

## Plano de despacho
QA da tarefa: `<dev-qa-...>` · Segurança: `sim (<seg-...>)` | `não`

| # | Agente | Entrada | Saída esperada | Depende de | Caminhos exclusivos | ID do agente | Status |
|---|--------|---------|----------------|------------|---------------------|--------------|--------|
| 1 | | | | — | | | pendente |

<!-- "ID do agente": o despachante grava o ID que volta com o relatório. Rodada de correção (QA, segurança,
     review) vai por mensagem a esse ID (SendMessage), nunca a um agente novo.
     "Caminhos exclusivos": globs que só aquele passo edita; passos em paralelo não repetem caminhos;
     passo sem arquivo (QA, revisão) põe "—". Evita dois agentes editando o mesmo arquivo. -->

### Briefings
Um bloco por passo. **É só isto que o agente recebe**: ele não lê o resto do arquivo.

#### Passo 1 · <agente>
```json
{
  "tarefa": "LUME-<n>",
  "passo": 1,
  "objetivo": "o que este passo entrega, em uma frase",
  "contexto_minimo": ["só os fatos e caminhos necessários (ex.: LUME-<n>.contratos.md#Seção)"],
  "contratos": ["entidades/endpoints/esquemas que este passo usa ou cria"],
  "restricoes": ["regras que se aplicam a este passo (ex.: tokens do DS, sem Card do Material, sem dose)"],
  "pronto_quando": ["verificação objetiva (comando ou teste)"],
  "formato_saida": "relatório do protocolo §4, acrescentado ao LUME-<n>.log.md",
  "limite_resposta": "até 150 palavras + lista de arquivos"
}
```

## Orçamento e acompanhamento
- Teto: o valor acima. Ao passar de 80%, o despachante avisa o usuário; ao passar de 100%, pausa (`/pausar`).
- Cada mudança de etapa gera um evento ao n8n (`docs/org/n8n.md`); falha do n8n não bloqueia.

## Cenários extremos
Resumo dos 3 a 5 mais relevantes (a tabela completa do `dev-edge-cases` fica no log):
- <cenário → tratamento esperado → quem trata>

## Riscos e decisões em aberto
- ...

<!-- ─────────── modelo de LUME-<n>.log.md (arquivo separado, só acrescentar no fim) ───────────
# LUME-<n> · log

## Cenários extremos
Tabela do dev-edge-cases: Cenário · Área · Probabilidade · Impacto · Tratamento esperado · Quem trata · Situação

## Relatórios
Relatórios dos agentes (protocolo §4) e registros do comando, do mais antigo para o mais novo.

### <agente> · dd/MM/yyyy HH:mm · passo <n>
Resultado: concluído | parcial | bloqueado
Arquivos: ...
Comandos: ...
Desvios do plano: ...
Pendências: ...

## Eventos n8n
dd/MM/yyyy HH:mm · etapa · agente · status · enviado | falhou (motivo curto)

## Pendências
- ...

## Pausa
Preenchido pelo /pausar, um bloco por pausa com título `### Pausa · dd/MM/yyyy HH:mm`: onde parou, próximo passo exato, arquivos em edição. O /retomar lê a última.
-->