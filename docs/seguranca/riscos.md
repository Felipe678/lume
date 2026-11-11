# Matriz de riscos

> Dono: `seg-lider`. Atualizada em auditorias (`/seguranca`) e incidentes (`/incidente`). Atualização inicial: 11/11/2026.

| # | Risco | Área | Probabilidade | Impacto | Mitigação planejada | Estado |
|---|---|---|---|---|---|---|
| R1 | Dados de saúde sem criptografia ou consentimento (E2 em diante) | Saúde | Média | Crítico | Definir criptografia, consentimento e auditoria antes da E2 | Aberto |
| R2 | Sync por documento único sobrescreve dados em conflito (legado React) | Sync | Alta | Alto | Sync por módulo/registro no backend novo | Aberto |
| R3 | Documentos guardados no estado da aplicação (E7) | Documentos | Média | Alto | Armazenamento dedicado e criptografado | Aberto |
| R4 | Saída de IA recomendando dose ou dando orientação médica | IA | Média | Crítico | Guardrails, evals adversariais, revisão do `seg-privacidade-dpo` | Aberto |
| R5 | Dados pessoais enviados a prompts de IA ou a eventos do n8n | IA / n8n | Média | Alto | Minimização, mascaramento, sem dados pessoais nos eventos | Aberto |
| R6 | Webhook do n8n sem autenticação ou com token fraco | n8n | Baixa | Médio | Header `X-Lume-Token` obrigatório, token por variável de ambiente | Mitigado no desenho |
| R7 | Dependências do app React legado com vulnerabilidades (3 altas) | Legado | Alta | Baixo | Aposentar o app React após a E1 | Aberto |
| R8 | Segredos no repositório (JWT_SECRET, MONGODB_URI, tokens) | Geral | Baixa | Alto | Hook `guard-secrets`, `.env.example`, `.gitignore` | Mitigado |
