# IA no Lume

> Dono: `dev-ia-produto`. Estado: **sem funcionalidade especificada** (decisão D13, 11/11/2026). Este diretório guarda prompts versionados, evals e decisões de IA quando a primeira funcionalidade for definida.

## Quando uma funcionalidade de IA nasce

1. O Felipe descreve a necessidade. `produto` confere com os princípios (pró-humano, caminho do meio, sem gatilhos de vício).
2. `dev-ia-produto` especifica: objetivo, dados de entrada mínimos, saída, custo estimado e falhas aceitáveis.
3. `seg-privacidade-dpo` e `seg-appsec` revisam (tarefa com `seguranca: sim`).
4. Os **evals vêm primeiro** (mínimo de 12 casos, incluindo adversariais), depois o prompt e a integração.

## Guardrails (valem para toda funcionalidade)

- Nunca recomendar dose nem dar orientação médica ou diagnóstico; registrar não é recomendar.
- Dados de saúde são sensíveis (LGPD, art. 11): consentimento explícito, minimização, trilha de auditoria.
- Sem comparação, culpa, punição ou gatilhos de vício; tom gentil ("Constância vale mais que intensidade").
- Confirmação humana antes de qualquer ação com efeito (gravar, alterar, enviar).
- Preferência pela API do Claude direta; frameworks de agentes só com justificativa registrada em `docs/decisoes/`.
- Orquestração via n8n quando houver fluxo assíncrono: ver `docs/org/n8n.md`.

## Estrutura prevista

- `docs/ia/<funcionalidade>.md`: especificação.
- `ia/agentes/<nome>/`: configuração, ferramentas, `prompt.md` e `evals/` (criados pela skill `/novo-agente`).
