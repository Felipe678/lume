---
name: revisar
description: Roda testes e revisão no que mudou desde o último commit, sem commitar. Use antes de fechar qualquer trabalho feito fora do /proxima-tarefa.
disable-model-invocation: true
---
# Revisar mudanças

1. `git status --short` e `git diff --stat` para ver o escopo e decidir a etapa de CI: `app` (Flutter em `app/`), `legado` (React na raiz), `servidor`, `n8n` ou `tudo`.
2. Em paralelo:
   - QA adequado ao tipo de mudança (`dev-qa-funcional` por padrão; `dev-qa-automacao` se mexeu em fluxos integrados; `dev-qa-extremos` para extremos), rodando só `node scripts/dev/ci.mjs --resumo <etapa>`;
   - `dev-techlead`, revisando o diff;
   - se o diff tocar tela ou widget do app, `/ds-fidelidade` (dev-frontend-design + dev-qa-extremos);
   - se o diff tocar dados pessoais, dados de saúde, autenticação, sync, criptografia ou segredos, o especialista `seg-*` correspondente (`seg-appsec`, `seg-dados` ou `seg-privacidade-dpo`).
3. Mostre um resumo: testes (passou/falhou), itens que bloqueiam o commit, achados de segurança e recomendações. Não faça commit.
