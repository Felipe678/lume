---
name: seguranca
description: Auditoria de segurança e privacidade - appsec, dados e privacidade (DPO) em paralelo; o seg-lider consolida, atualiza a matriz de riscos e os achados viram issues no Jira. Uso - /seguranca [escopo: pasta, tarefa, "tudo" ou "release"]
disable-model-invocation: true
---
# Auditoria de segurança

Escopo: $ARGUMENTS (se vazio, as mudanças desde o último sprint fechado; "tudo" = repositório inteiro; "release" = o que vai para a `main`).

Atenção ao que é específico do Lume: dados de saúde são sensíveis (LGPD, art. 11): criptografia, consentimento explícito e trilha de auditoria; o app registra doses, nunca recomenda; documentos em armazenamento dedicado e criptografado; sync por módulo ou registro; funcionalidades de IA com os guardrails (nunca recomendar dose, dado sensível, pró-humano).

1. Defina o escopo concreto: lista de pastas/arquivos ou intervalo do git (`git diff --stat <base>..HEAD`).
2. **Padrão: workflow** `seguranca-paralela` com `args = { "escopo": "<pastas ou intervalo do git>", "release": <true para release> }`: `seg-appsec`, `seg-dados` e `seg-privacidade-dpo` rodam em paralelo e o `seg-lider` consolida; você recebe só a consolidação. Confira o campo `sem_resposta` do retorno: especialista listado ali não respondeu e deve ser chamado direto. **Fallback** (sem workflows): chame **em paralelo**, cada um com o escopo e `docs/seguranca/politica.md` (se existir):
   - `seg-appsec`: código, APIs, dependências, segredos, autenticação, sync;
   - `seg-dados`: classificação, criptografia, isolamento, retenção, backups, dados de saúde;
   - `seg-privacidade-dpo`: operações com dados pessoais, consentimento, direitos dos titulares, trilha de auditoria.
3. Só no fallback: `seg-lider` consolida (no workflow já vem consolidado): deduplica, classifica pela política, atualiza `docs/seguranca/riscos.md` (se existir) e devolve o veredito.
4. Mostre ao usuário: achados por severidade e veredito (com "release": liberar ou vetar). Com o "ok", `ops-gestor-demandas` cria as issues no Jira (`createJiraIssue`, tipo bug, label `seguranca` e `sev-<critica|alta|media|baixa>`, título com a severidade).
5. Achado crítico: proponha `/incidente` se houver indício de exposição real.
