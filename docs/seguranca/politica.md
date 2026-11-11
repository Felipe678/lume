# Política de segurança e privacidade do Lume

> Dono: `seg-lider`. Esta política define quando uma tarefa precisa de revisão de segurança (`seguranca: sim`) e como achados são classificados.

## 1. Gatilhos de `seguranca: sim`

Uma tarefa tem revisão de segurança obrigatória quando toca qualquer item abaixo:

| Gatilho | Especialista |
|---|---|
| Dados de saúde (peso, medidas, doses, sono, alimentação) | `seg-privacidade-dpo` + `seg-dados` |
| Autenticação, sessão, tokens, autorização | `seg-appsec` |
| Documentos e upload (E7) | `seg-dados` + `seg-appsec` |
| Sync entre dispositivos e backend | `seg-appsec` + `seg-dados` |
| Funcionalidade com IA | `seg-appsec` + `seg-privacidade-dpo` |
| Webhooks e automações do n8n | `seg-appsec` |
| Novo dado pessoal ou nova finalidade de uso | `seg-privacidade-dpo` |

## 2. Princípios inegociáveis

- **Dados de saúde são sensíveis (LGPD, art. 11):** criptografia em trânsito e em repouso, consentimento explícito, trilha de auditoria.
- **O app registra doses, nunca recomenda dose.** Vale para qualquer medicamento e para qualquer saída de IA.
- **Documentos** só em armazenamento dedicado e criptografado, nunca dentro do estado da aplicação.
- **Sync por módulo ou por registro**, nunca por documento único.
- **Segredos** só por variável de ambiente; agentes não leem nem editam `.env`.
- **Sem dados pessoais** em logs, URLs, exemplos, eventos do n8n ou prompts de IA além do mínimo necessário.
- **Pró-humano:** sem mecânicas de vício, comparação ou punição.

## 3. Severidade dos achados

| Severidade | Critério | Ação |
|---|---|---|
| Crítica | Vazamento de dado de saúde, bypass de autenticação, segredo exposto | Bloqueia release e commit; correção imediata |
| Alta | Falha de autorização, injeção, dado sensível sem criptografia | Bloqueia o commit da tarefa |
| Média | Hardening ausente, log excessivo, dependência com CVE sem exploração direta | Vira issue (`seguranca`) e segue |
| Baixa | Boas práticas, melhoria de defesa em profundidade | Vira issue no backlog |

O `seg-lider` pode vetar release com risco alto ou crítico. Só o usuário aceita o risco, por escrito em `docs/decisoes/`.

## 4. Estrutura de `docs/seguranca/`

- `politica.md` (este arquivo) e `riscos.md` (matriz de riscos viva): `seg-lider`.
- `lgpd/` (ROPA, RIPD, bases legais): `seg-privacidade-dpo`.
- `ameacas/` (modelagem STRIDE): `seg-appsec`.
- `incidentes/` (um arquivo por incidente, sem dados pessoais): skill `/incidente`.
