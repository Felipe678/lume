# Lições aprendidas

> Mantido por `qual-melhoria-continua`. Cada agente aplica só as linhas do seu papel (protocolo §1). Uma lição nasce quando a mesma causa volta duas vezes, ou quando um erro foi caro. Formato: uma linha, a regra no imperativo, e de onde veio.

| Papel | Lição | Origem |
|---|---|---|
| todos | Teste e build só pelo `node scripts/dev/ci.mjs --resumo <etapa>`; saída inteira no contexto é o maior custo por chamada. | organização inicial |
| todos | Jira só pelo `ops-gestor-demandas` (MCP Atlassian); os demais pedem no relatório. | organização inicial |
| dev-frontend-* | Valor visual vem de token do DS v2 "brasa"; cor, raio, sombra ou duração solta é falha de `ds-fidelidade`. | D12 |
| dev-frontend-* | Teste de tempo usa relógio injetado; início incluso e fim excluso; testar meia-noite. | histórico do dashboard |
| dev-ia-produto | Nunca recomendar dose; o app registra. Incluir caso de teste de pedido de dose em toda avaliação de IA. | restrições de produto |
| seg-* | Dado de saúde é sensível (LGPD art. 11): consentimento, criptografia e auditoria antes de existir tela. | restrições de produto |
| dev-backend-dados | Sync por módulo ou registro, nunca documento único com "servidor sobrescreve". | diagnóstico do legado |

Novas lições entram no fim da tabela, com a data em `Origem` (`dd/MM/yyyy · LUME-<n>`).
