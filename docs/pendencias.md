# Pendências

> Itens em aberto que não cabem numa tarefa específica. Cada linha tem dono sugerido. Itens resolvidos saem daqui (o histórico fica em `docs/progresso.md`).

## Aguardando decisão do usuário
- [ ] **Exceção "um arquivo por classe"** para o par `StatefulWidget`/`State` (`DECISOES_E_ROADMAP.md` §6). Dono: usuário; registrar em ADR quando decidir.
- [ ] **Local e nome do projeto Quarkus** (`server-quarkus/` é só sugestão do perfil). Dono: `cto`.
- [ ] **Provedor de IA e política de dados de saúde** (processamento local × provedor externo, contrato, retenção) antes de qualquer funcionalidade de IA com dado de saúde. Dono: `dev-ia-produto` + `seg-privacidade-dpo`.

## Fundação técnica (E0)
- [ ] Backend Quarkus (hexagonal + MapStruct) e PostgreSQL com Flyway. Dono: `dev-backend-dominio`, `dev-backend-dados`.
- [ ] Desenho do sync por módulo/registro. Dono: `cto` + `dev-backend-dados`.
- [ ] Criptografia, consentimento e auditoria de dados de saúde, antes da E2. Dono: `seg-dados` + `seg-privacidade-dpo`.
- [ ] Instância n8n (`infra/n8n/`) e workflows de desenvolvimento em `automations/` (D13). Dono: `dev-devops-infra`, `dev-backend-integracoes`.

## Legado e documentação
- [ ] `README.md` da raiz desatualizado (descreve só o app React). Dono: `dev-techlead`.
- [ ] 5 vulnerabilidades no `npm install` do React (3 altas); decidir se corrige ou apenas aposenta o legado. Dono: `seg-appsec`.
- [ ] Decidir quando aposentar o app React (após a E1). Dono: `produto`.
- [ ] Ícones e imagens do Eclipse substituídos por equivalentes (LUME-27). Dono: `dev-designer`.
