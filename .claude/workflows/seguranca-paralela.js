export const meta = {
  name: 'seguranca-paralela',
  description: 'Auditoria de segurança em fan-out: seg-appsec, seg-dados e seg-privacidade-dpo em paralelo; o seg-lider consolida',
  phases: ['Especialistas', 'Consolidação'],
}

// Usado pelo /seguranca: args = { escopo: 'lista de pastas ou intervalo do git', release: bool }.
// O despachante recebe só a consolidação do seg-lider; as issues continuam sendo criadas pela sessão (ops-gestor-demandas, via MCP Atlassian).
// ATENCAO: confirme com /workflow-authoring o nome da opção do tipo de agente antes da primeira execução (só papel() muda).
const papel = (agente, extra = {}) => ({ agentType: agente, ...extra })

if (!args || typeof args.escopo !== 'string' || !args.escopo.trim()) throw new Error('args.escopo obrigatório')

const achados = {
  type: 'object',
  required: ['achados'],
  properties: {
    achados: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severidade', 'titulo', 'arquivo', 'correcao'],
        properties: {
          severidade: { enum: ['critica', 'alta', 'media', 'baixa'] },
          titulo: { type: 'string' }, arquivo: { type: 'string' }, correcao: { type: 'string' },
        },
      },
    },
  },
}

phase('Especialistas')
const foco = {
  'seg-appsec': 'código, APIs, autenticação, sync, segredos e dependências',
  'seg-dados': 'classificação, criptografia, isolamento, retenção e backups, com atenção a dados de saúde (LGPD, art. 11)',
  'seg-privacidade-dpo': 'dados pessoais, consentimento explícito, direitos dos titulares e trilha de auditoria',
}
const nomes = Object.keys(foco)
const res = await parallel(nomes.map((n) => () => agent(
  `Auditoria de segurança. Escopo: ${args.escopo}\nSeu foco: ${foco[n]}\nPolítica: docs/seguranca/politica.md (se existir).\n` +
  'Leia só o escopo. Devolva os achados com severidade pela política (lista vazia se nada). Não edite arquivos.',
  papel(n, { label: n, schema: achados }),
)))

phase('Consolidação')
const porEspecialista = nomes.map((n, i) => ({ especialista: n, achados: res[i] ? res[i].achados : null }))
const consolidado = await agent(
  `Consolide a auditoria de segurança (escopo: ${args.escopo}${args.release ? ', RELEASE' : ''}).\nAchados por especialista (JSON; null = não respondeu):\n` +
  `${JSON.stringify(porEspecialista)}\n\nDeduplique, classifique pela política, atualize docs/seguranca/riscos.md (se existir) e devolva o veredito` +
  `${args.release ? ' (liberar ou vetar a release)' : ''}.`,
  papel('seg-lider', {
    label: 'seg-lider',
    schema: {
      type: 'object',
      required: ['veredito', 'achados'],
      properties: { veredito: { type: 'string' }, achados: achados.properties.achados },
    },
  }),
)

return { escopo: args.escopo, ...consolidado, sem_resposta: nomes.filter((n, i) => !res[i]) }
