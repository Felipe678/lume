---
name: conselho
description: Reúne o conselho (cto, produto, seg-lider e dev-techlead em paralelo) para uma decisão estratégica ou conflito entre áreas; cada um opina e o produto consolida a decisão. Uso - /conselho "<tema ou pergunta>"
disable-model-invocation: true
---
# Conselho

Tema: $ARGUMENTS

1. Reúna o contexto mínimo: o tema, os dados relevantes (status do sprint via Jira/`/status`, `DECISOES_E_ROADMAP.md`, decisões D1–D13 relacionadas) e as opções já conhecidas.
2. Rode o workflow `conselho-paralelo` com `args = { "tema": "...", "contexto": "<o que você levantou no passo 1>" }`. Ele chama `cto`, `produto`, `seg-lider` e `dev-techlead` em paralelo, passa os pareceres ao `produto`, que consolida, e devolve só a decisão e uma linha por conselheiro: os pareceres não passam pelo seu contexto.
3. Sem workflows disponíveis: chame **em paralelo** `cto`, `produto`, `seg-lider` e `dev-techlead` com o mesmo contexto (até 8 linhas cada: visão, riscos, recomendação) e depois o `produto` com as respostas.
4. Mostre ao usuário: a decisão consolidada e uma linha por conselheiro. **A decisão só vale com o "ok" do usuário.** Guardrails sempre valem: pró-humano, nunca recomendar dose, dado de saúde sensível, fidelidade ao DS v2 "brasa".
5. Aprovada e relevante: registre em `docs/decisoes/NNNN-<slug>.md`, acrescente a decisão (D14, D15…) em `DECISOES_E_ROADMAP.md` e, se gerar trabalho, crie as issues via `ops-gestor-demandas`.
