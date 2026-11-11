---
name: incidente
description: Resposta a incidente de segurança ou vazamento de dados - contenção imediata, avaliação de notificação legal pelo DPO, registro e ações. Uso - /incidente "<o que aconteceu>"
disable-model-invocation: true
---
# Incidente de segurança

Relato: $ARGUMENTS

1. **Primeiro conter, depois documentar.** Chame o `seg-lider` com o relato (apoiado por `seg-appsec` para o vetor técnico): ele devolve as ações de contenção imediatas (ex.: revogar/rotacionar credencial, desligar serviço, invalidar tokens JWT, tirar um endpoint do ar). Mostre ao usuário e execute **só com aprovação**. Ações em sistemas externos (rotacionar token em painel, Atlas, GitHub, n8n) são passos para o usuário.
2. Em paralelo, chame o `seg-privacidade-dpo`: há dados pessoais ou de saúde (LGPD, art. 11) envolvidos? quais e de quantos titulares? há obrigação de comunicar a ANPD e os titulares? Ele rascunha as comunicações. `seg-dados` avalia o alcance sobre os dados armazenados (criptografia, backups).
3. Crie `docs/seguranca/incidentes/<AAAA-MM-DD>-<slug>.md` (crie a pasta se faltar), **sem dados pessoais**: linha do tempo, impacto, contenção, causa provável, ações.
4. `seg-lider` classifica a severidade, define as ações de correção (viram issues de bug no Jira com label `seguranca`, via `ops-gestor-demandas`) e atualiza `docs/seguranca/riscos.md` (se existir).
5. Depois de resolvido: `qual-melhoria-continua` faz a causa raiz e as lições (`docs/dev/licoes.md`).
6. Comunicações externas e aceite de risco: **sempre** decisão do usuário.
