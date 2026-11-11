# Automações do Lume (n8n)

Quatro workflows, de propósito. No hyper-project acabamos com dezenas de fluxos soltos, difíceis de enxergar. Aqui a regra é o contrário: **poucos workflows, muito conteúdo visível em cada canvas**. A cada desenvolvimento dá para abrir um só canvas e ver como a tarefa está sendo gerada e orquestrada (decisão D13: o n8n orquestra o Lume).

| Arquivo | Papel | Ativo |
|---|---|---|
| `workflows/lume-orquestrador-desenvolvimento.json` | Mestre do desenvolvimento: recebe eventos dos agentes e roteia por etapa | sim |
| `workflows/lume-orquestrador-produto.json` | Mestre do produto: um ramo por módulo do ERP, mais a raia de IA futura | não |
| `workflows/_core/lume-core.json` | Núcleo: normalizar, registrar, notificar, tratar erro, ler estado | (subworkflow) |
| `workflows/lume-painel.json` | `GET /webhook/lume-painel`: página HTML com o estado atual | sim |

## Contrato do evento
`POST /webhook/lume-dev-evento` com o cabeçalho `X-Lume-Token` (credencial Header Auth chamada `lume-token`, criada no n8n; nunca no JSON) e o corpo
`{tarefa, etapa, agente, status, resumo, sessao, ts}`.
- `etapa`: jira, plano, aprovado, implementacao, qa, seguranca, review, commit, pr, registro, concluida, pausada
- `status`: iniciada, concluida, falhou, bloqueada
- Resposta imediata `200 {"ok":true}`. Evento fora do contrato é descartado (contador no painel).

## Mapa das raias (orquestrador de desenvolvimento)
Entrada → Jira → Plano (dev-techlead, dev-edge-cases) → Aprovação → Implementação (backend, frontend, design system, devops, IA) → QA → Segurança → Review → Commit e PR → Registro no Jira → Concluída → Pausa → Bloqueios.
Cada etapa é um nó nomeado em português (ex.: "2 · Plano — dev-techlead"). Todas seguem para o nó comum **Registrar estado**; depois, falha ou bloqueio vai para a raia **Bloqueios** (subworkflow de erro) e a conclusão da tarefa notifica. Uma nota adesiva colorida por raia, nós em grade.

## Como ler
- **Canvas:** leia da esquerda para a direita na entrada, depois de cima para baixo pelas raias.
- **Histórico de execuções:** cada evento é uma execução. Filtrar por data mostra a trilha do desenvolvimento: qual etapa, em que ordem, onde falhou. Os dados ficam salvos também para sucesso.
- **Painel:** o estado atual por tarefa (raias por etapa, agente, status, linha do tempo, contadores). Laranja → brasa é o que acontece agora; violeta é o que esfriou ou terminou. Atualiza a cada 5 s por `meta refresh` (a página do n8n roda em sandbox, então não usa JavaScript).

## Armazenamento de estado
Escolha: **static data do `_core`** (`$getWorkflowStaticData('global')`), e não Data Tables.
Motivos: a versão do n8n ainda não estava fixada quando isto foi escrito; Data Tables só existem em versões recentes e precisam ser criadas à mão antes da importação (não dá para importá-las por JSON); static data funciona em qualquer versão, sem passo manual. Como static data é por workflow, **todo acesso passa pelo `_core`** (mestres e painel chamam `registrar_estado` / `ler_estado`).
Estruturas: `tarefas` (tarefa, titulo, etapa, agente, status, atualizado_em) e `eventos` (ts, tarefa, etapa, agente, status, resumo), com teto de 200 tarefas e 500 eventos.
Limites conhecidos: static data só persiste em execuções de produção (não em testes manuais) e eventos simultâneos podem se sobrepor. Se isso incomodar, trocar as operações `registrar_estado` e `ler_estado` por nós Data Table, sem tocar nos mestres.

## Importação e credencial
`n8n import:workflow --separate --input=automations/workflows` (e a subpasta `_core`). Os ids dos workflows são fixos (`lumeCore00000001` etc.) para a chamada ao núcleo resolver. Crie a credencial Header Auth com **id e nome `lume-token`**, cabeçalho `X-Lume-Token`; se o id for outro, religue no webhook.

## Como adicionar um ramo sem criar workflow novo
- **Nova etapa de desenvolvimento:** uma nota adesiva de raia, um nó Set `operacao = registrar_estado` ligado a **Registrar estado**, uma nova saída em "Rotear por etapa" (e em `ETAPAS` do `_core/normalizar`).
- **Novo módulo de produto:** duplique uma raia do orquestrador de produto, troque o gatilho (nasce desativado) e o texto, ligue em **Registrar**.
- **Nova operação comum:** nova saída em "Qual operação?" do `_core` e um nó de código.
Rode `node automations/validar-workflows.mjs` e `node --test automations` depois de editar.

## Extensão de IA (futuro)
Só há nós de passagem desativados no orquestrador de produto. Antes de ligar qualquer um: nunca recomendar dose (o app só registra), saúde é dado sensível (LGPD art. 11, consentimento, criptografia, enviar o mínimo), pró-humano (sem gatilhos de vício, impulso, comparação ou punição), consentimento por funcionalidade e auditoria de cada chamada.
