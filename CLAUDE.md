# CLAUDE.md — Contexto do projeto

> Este arquivo é lido automaticamente pelo Claude Code em toda sessão.
> **Fonte de verdade:** `DECISOES_E_ROADMAP.md` (decisões D1–D13, roadmap E0–E7) e o projeto **LUME** no Jira. Em conflito, vale o `DECISOES_E_ROADMAP.md`.

## Quem sou e o que estou construindo

- Felipe, desenvolvedor full-stack, São Paulo. Trabalho sozinho no projeto, então o time de agentes é a minha equipe.
- **Lume** é um **ERP pessoal**: um gerenciador de uma vida, assim como um ERP gerencia o ecossistema de uma empresa. Princípios:
  - **Tirar o ruído mental:** tudo da vida da pessoa fica visível, tangível e manipulável.
  - **Frentes conectadas:** sono, alimentação, peso/IMC, trabalho, objetivos, finanças e prazeres se influenciam; o app mostra as ligações.
  - **Caminho do meio:** ajuda a sair dos extremos (conforto demais ou pressão extrema).
  - **Pró-humano:** o oposto de redes sociais e apps de apostas. Sem gatilhos de vício, impulso, comparação ou punição.
  - **Profissional:** visual impecável, contraste forte, layout limpo.

## Stack

- **Frontend:** Flutter/Dart com Clean Architecture em `app/` (go_router, tokens de cor centralizados, temas claro e escuro).
- **Backend (planejado, não iniciado):** Quarkus (hexagonal, MapStruct) + PostgreSQL com Flyway, auditoria, soft delete, optimistic locking e UUIDs públicos.
- **Legado de referência:** o app React na raiz e `server/` (Express + MongoDB) só servem para consulta de funcionalidades e regras de domínio a portar. Não evoluir.
- **Orquestração:** n8n é o orquestrador do fluxo de desenvolvimento (D13); o painel de estado fica em `http://localhost:5678/webhook/lume-painel`. Os hooks enviam eventos ao n8n (falha aberta: n8n fora do ar nunca trava a sessão); `LUME_N8N_URL` e `LUME_N8N_TOKEN` vêm do ambiente. Detalhes em `docs/org/n8n.md`.
- Qualidade: `node scripts/dev/ci.mjs --resumo <app|legado|servidor|n8n|tudo>`; no app, `flutter analyze` limpo e `flutter test` verde.

## Time de agentes (organização)

- 25 agentes em `.claude/agents/`: C-levels, Desenvolvimento, Qualidade, Segurança e Privacidade, Operações. Organograma: `docs/org/organograma.md`. Regras comuns: `docs/org/protocolo.md`.
- Os agentes são genéricos; o que é deste projeto (stack, comandos, convenções, regras de domínio, Jira) está em **`docs/projeto/perfil.md`**.
- **SEMPRE MULTIAGENTES (regra permanente).** Antes de implementar, dimensione: quantos agentes são ideais e em quantas partes a tarefa se divide. Um agente por parte divisível, cada um com escopo de arquivos exclusivo; em ondas quando houver dependência. Registre essa conta no plano de despacho. A sessão principal despacha; **subagente não chama subagente**.
- **Fiel ao Design System v2 "brasa" (D12).** Antes de qualquer tela ou widget, consulte o DS e use os tokens centralizados (cores, espaçamentos, raios, sombras, movimento), nunca valores soltos. Qualquer desvio vira **pendência explícita** em `docs/pendencias.md`, nunca silencioso. Use a skill `ds-fidelidade`.
- **Fidelidade ao planejado:** havendo planejamento, design ou arquitetura, siga EXATAMENTE como planejado. Use o `dev-edge-cases` (com QA) para verificar o que ninguém conferiu: botões sem efeito, campos que não salvam, fluxos que não rodam de ponta a ponta, telas diferentes do design. Se um agente não terminar (tempo, tokens, turnos), o próximo continua a solução como foi desenhada. A tarefa não termina enquanto o resultado ideal não for alcançado; limitações reais são registradas e mostradas, nunca escondidas.
- **Qualidade acima de tokens e de limites de execução:** nunca sacrifique a qualidade final para poupar tokens nem por qualquer limite (orçamento, contexto, turnos, tempo, rate limit). Se for preciso, pause com passagem de contexto COMPLETA (estado, decisões, o que falta, arquivos, critérios de pronto). Os hooks de métricas registram o consumo em `docs/metricas/execucoes.csv` e avisam; o orçamento do plano é referência: passou dela, escala até 2x e o trabalho segue; passou de 2x, a sessão/agente encerra com passagem de contexto e a tarefa continua em outro.
- **IA em funcionalidades dinâmicas:** onde uma funcionalidade ainda não especificada ganhar com IA, ela é possível, com guardrails. Passa obrigatoriamente por `dev-ia-produto`, `seg-privacidade-dpo` e `produto` antes de ir ao plano. Nunca recomenda dose ou conduta de saúde; nenhum dado sensível vai a serviço externo sem consentimento explícito.
- Comandos do dia a dia: `/proxima-tarefa`, `/pausar`, `/retomar`, `/status`, `/daily`, `/sprint-planning`, `/sprint-review`, `/conselho`, `/melhoria`, `/revisar`, `/revisao-pr` (corrige os comentários do revisor no PR), `/seguranca`, `/incidente`, `/novo-agente`, `/ds-fidelidade`.
- Fluxo de uma tarefa: `/proxima-tarefa` (chave Jira `LUME-<n>`) → `dev-techlead` planeja + `dev-edge-cases` lista os cenários extremos → eu aprovo → implementadores → QA → (`seg-*` se tocar segurança ou dados de saúde) → `qual-revisor-critico` + `dev-techlead` revisam e `dev-edge-cases` confere → commit `tipo(LUME-68): resumo` → push e PR para `main` (`docs/org/fim-de-tarefa.md`) → `ops-gestor-demandas` registra no Jira e em `docs/progresso.md`.
- Arquivos da tarefa: `docs/tarefas/LUME-68.md` (plano, até 150 linhas), `.contratos.md`, `.log.md`; ponteiros locais `docs/tarefas/_atual` e `_modo`; pendências em `docs/pendencias.md`.
- Ao validar mudanças na organização: `node scripts/dev/validar-agentes.mjs`.

## Restrições de produto

- **Saúde é dado sensível (LGPD, art. 11):** criptografia, consentimento explícito e trilha de auditoria antes da E2.
- **O app registra doses, nunca recomenda dose.** Vale para canetas (Mounjaro/tirzepatida) e qualquer medicamento.
- **Documentos** ficam em armazenamento dedicado e criptografado, nunca dentro do estado da aplicação.
- **Sync por módulo ou por registro**, nunca por documento único; conflito não descarta mudanças de outros módulos.
- **Sem gatilhos de vício:** nada de streak que pune, comparação com outras pessoas, notificações de pressão. Consistência (ex.: 5 de 7 dias) e recompensas conscientes (D3).

## Regras para o Claude Code

- Comunicação, textos de interface e nomes de telas em **português do Brasil**, com acentos. Código (classes, variáveis, endpoints) segue a convenção do projeto.
- Valores em reais, formato `R$ 1.234,56`. Datas em `dd/MM/yyyy`, fuso `America/Sao_Paulo`.
- **Uma tarefa por vez** (chaves Jira `LUME-68`, `LUME-77`…). Antes de codar, mostre um plano curto. Ao terminar, rode os testes e faça commit `tipo(LUME-68): resumo` (tipos: feat, fix, chore, docs, test, refactor, perf, ci, build, style, revert, wip, sec). O hook bloqueia mensagem fora do padrão e `.env` no commit.
- Branch de trabalho `new-plan/mudanca_de_escopo` ou uma branch por tarefa; o PR vai para `main` (use `gh`).
- **Nada de over-engineering:** entregue o que a tarefa pede, sem abstrações para hipóteses futuras. Reaproveite o que já existe (catálogo de módulos, tokens, widgets base).
- Segredos só por **variável de ambiente**; nunca no código, em commit ou em log. Documente a variável no `.env.example`. Não leia nem edite `.env`.
- Atualize o `DECISOES_E_ROADMAP.md` quando uma decisão nova for tomada (com a aprovação do Felipe) e o Jira quando uma entrega avançar.
- Se uma decisão registrada parecer errada na prática, **pare e pergunte** antes de mudar.

## Modos de trabalho (/KeepWORKING e /ComeBack)

- `/KeepWORKING` liga o **modo autônomo** (`docs/tarefas/_modo` = `autonomo`): continuar o backlog sem esperar o Felipe; decisão dele vira item detalhado em `docs/pendencias.md` e o trabalho segue para a próxima tarefa. Ação irreversível, gasto, publicação e credenciais nunca são executados: viram pendência.
- `/ComeBack` volta ao **modo normal** (`normal`): gera o resumo de todas as pendências, agrupadas por assunto, com as perguntas prontas; a partir daí nada novo entra na lista.
- Em sessão com o modo autônomo ligado (o hook de início de sessão avisa), não use `AskUserQuestion` nem termine respostas esperando o Felipe.
