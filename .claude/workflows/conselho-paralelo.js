export const meta = {
  name: 'conselho-paralelo',
  description: 'Conselho em fan-out: cto, produto, seg-lider e dev-techlead opinam em paralelo e o produto consolida a decisão',
  phases: ['Conselheiros', 'Decisão'],
}

// Usado pelo /conselho: args = { tema, contexto }.
// Os pareceres ficam em variáveis do script; o despachante recebe só a decisão consolidada e uma linha por conselheiro.
// ATENCAO: confirme com /workflow-authoring o nome da opção do tipo de agente antes da primeira execução (só papel() muda).
const papel = (agente, extra = {}) => ({ agentType: agente, ...extra })

if (!args || typeof args.tema !== 'string' || !args.tema.trim()) throw new Error('args.tema obrigatório')
const contexto = typeof args.contexto === 'string' ? args.contexto : ''

const parecer = {
  type: 'object',
  required: ['visao', 'riscos', 'recomendacao'],
  properties: {
    visao: { type: 'string', description: 'visão da sua área, até 4 linhas' },
    riscos: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    recomendacao: { type: 'string', description: 'uma frase' },
  },
}

phase('Conselheiros')
const nomes = ['cto', 'produto', 'seg-lider', 'dev-techlead']
const pedido = `Tema do conselho: ${args.tema}\n\nContexto (dados já levantados pelo despachante):\n${contexto}\n\n` +
  'Responda pela sua área, em até 8 linhas no total. Respeite os guardrails do Lume: pró-humano, dado de saúde sensível, nunca recomendar dose, fidelidade ao Design System v2 "brasa". Não edite arquivos.'
const pareceres = await parallel(nomes.map((n) => () => agent(pedido, papel(n, { label: n, schema: parecer }))))

phase('Decisão')
const recebidos = nomes.map((n, i) => ({ conselheiro: n, parecer: pareceres[i] })).filter((x) => x.parecer)
const decisao = await agent(
  `Tema: ${args.tema}\n\nPareceres do conselho (JSON):\n${JSON.stringify(recebidos)}\n\n` +
  'Consolide no seu formato: decisão, justificativa, o que fica de fora e o próximo passo. Conselheiro sem parecer = ausente. A decisão só vale com o ok do usuário. Não edite arquivos.',
  papel('produto', {
    label: 'produto',
    schema: {
      type: 'object',
      required: ['decisao', 'justificativa', 'fora_do_escopo', 'proximo_passo'],
      properties: {
        decisao: { type: 'string' }, justificativa: { type: 'string' },
        fora_do_escopo: { type: 'array', items: { type: 'string' } }, proximo_passo: { type: 'string' },
      },
    },
  }),
)

return { tema: args.tema, decisao, conselheiros: recebidos.map((x) => `${x.conselheiro}: ${x.parecer.recomendacao}`), ausentes: nomes.filter((n, i) => !pareceres[i]) }
