# Decisões (ADRs)

> Registro de decisões técnicas e de processo que mudam o rumo do código ou da organização. Decisões de **produto** (D1 a D13) ficam em `DECISOES_E_ROADMAP.md` e são atualizadas pelo usuário; aqui entram as decisões de engenharia que as detalham ou que os agentes tomam com aprovação.

## Quando escrever um ADR
- Tecnologia, dependência ou licença nova; desvio da arquitetura (Clean Architecture no app, hexagonal no backend).
- Exceção às regras do perfil (ex.: par `StatefulWidget`/`State` em um arquivo).
- Divergência do DS v2 "brasa", com aprovação do usuário.
- Aceite de risco de segurança alto ou crítico (só o usuário aceita, por escrito).
- Política de dados de saúde e de IA.

## Formato
Arquivo `NNNN-slug-curto.md` com numeração sequencial de 4 dígitos (`0001-excecao-statefulwidget-state.md`), em português, até uma página:

```
# NNNN · Título
- Data: dd/MM/yyyy · Status: proposto | aceito | substituído por NNNN
- Tarefa: LUME-<n> · Autor: <agente> · Decidido por: <usuário | cto>

## Contexto
## Decisão
## Alternativas descartadas
## Consequências
```

- ADR aceito não se edita: se mudar, crie outro que o substitua e atualize o Status do antigo.
- Antes de questionar algo que parece decidido, procure aqui (protocolo §1).

## Índice
Nenhum ADR ainda.
