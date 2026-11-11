# Progresso

> Diário do projeto, do mais antigo para o mais novo. Mantido pelo `ops-gestor-demandas` (e pelo `/daily`). O Jira é a fonte de verdade das issues; aqui fica o histórico legível e o registro quando o Jira está indisponível.

## Formato
Uma linha por fato, começando pela data:

```
dd/MM/yyyy · LUME-<n> · <tipo> · <texto curto> [pendente-sync]
```

- `tipo`: `feito`, `proximo`, `bloqueio`, `decisao`, `entrega`, `melhoria`.
- `[pendente-sync]` só quando o Jira estava indisponível; o próximo comando com o MCP Atlassian sincroniza e remove a marca.
- Sem dados pessoais nem de saúde. Decisões de produto vão também para `DECISOES_E_ROADMAP.md` (pelo usuário).

## Registro
09/11/2026 · LUME-67 · decisao · Design System v2 "brasa" (D12) decidido; épico E0.1 criado no Jira
11/11/2026 · LUME-19 · feito · Splash do app removido
11/11/2026 · - · decisao · Organização de agentes do Lume criada (25 agentes, n8n como orquestrador, D13)
11/11/2026 · - · decisao · LUME Sprint 1 (11/11–17/11) planejado no board 36 (sprint 40): LUME-71, 68, 70, 72, 73 (32 h, capacidade 5 h/dia); E0.1 estimada em 93 h; sprint iniciado com meta no Jira
11/11/2026 · LUME-71 · entrega · AppMotion e reduzir movimento (menu e páginas); 141 testes; commit 1919a77 no PR #3 (aguarda merge); entrada da tela fica para a LUME-72
