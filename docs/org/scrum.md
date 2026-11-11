# Rotina Scrum

> Dono: `ops-gestor-demandas` (Scrum master). É o **único** agente que escreve no Jira, sempre via MCP Atlassian (projeto LUME, `felipeoliveiranogueira.atlassian.net`). Não há script de Jira.

## Estrutura no Jira
| Item | No Jira |
|---|---|
| Entrega do roadmap (E0 a E7, E0.1) | Épico (LUME-1 a LUME-8 e LUME-67; ver `DECISOES_E_ROADMAP.md` §7) |
| Tarefa ou história | Issue `LUME-<n>` dentro do épico; estimativa em horas |
| Item de checklist | Subtarefa |
| Atualização | Comentário `[feito]`, `[próximo]` ou `[bloqueio]` (`[bloqueio]` adiciona a label `impedimento`; `[feito]` remove) |
| Plano de despacho | Comentário `[plano]` na issue + `docs/tarefas/LUME-<n>.md` |
| Melhoria (lição, causa raiz, ação de retro) | Tarefa com label `melhoria`, no backlog |
| Vulnerabilidade | Bug com labels `seguranca` + `sev-critica/alta/media/baixa` |

O Jira guarda o detalhamento; `DECISOES_E_ROADMAP.md` guarda o **porquê** das decisões. Ao concluir uma tarefa, o `ops-gestor-demandas` atualiza o Jira e acrescenta uma linha em `docs/progresso.md`.

## Cerimônias
| Cerimônia | Comando | Quando | Saída |
|---|---|---|---|
| Planning | `/sprint-planning` | início do sprint | Meta + issues que cabem, aprovadas pelo usuário |
| Daily | `/daily` | dia de trabalho | Feito (24h) · Próximo · Impedimentos, a partir do Jira, `git log` e `docs/progresso.md` |
| Review | `/sprint-review` | fim do sprint | Entregue × planejado, demonstração do que está pronto |
| Retro | `/sprint-review` (2ª parte) | fim do sprint | 1 a 3 melhorias no **backlog** |
| Refinamento | dentro do planning | — | Issues com checklist, estimativa e definição de pronto |

## Regras
- **Definição de pronto** de toda issue: checklist completo + QA aprovado + review do `dev-techlead` + (`seguranca: sim` → revisão `seg-*` aprovada) + (UI → `ds-fidelidade` aprovada) + commit com a chave + PR para `main`.
- Sprint de até 7 dias; meta atingida antes: review curto e novo planning.
- Issues sem estimativa não entram no sprint. Melhorias nascem no backlog.
- Carry-over volta ao topo do backlog com comentário `[próximo]` dizendo onde parou.
- Prioridade: impedimentos e bugs `sev-critica/alta` → issues do épico em andamento (respeitando a ordem E0 → E7 e a dependência E1 em E0.1) → melhorias → resto.
- Prazo em risco: o `ops-gestor-demandas` sinaliza no daily; a decisão de cortar escopo é do usuário, assessorado por `produto`.

## Sem Jira disponível
Registre em `docs/progresso.md` no formato `dd/MM/yyyy · LUME-<n> · <tipo> · <texto> [pendente-sync]`. O próximo comando com o MCP Atlassian disponível sincroniza e remove a marca.
