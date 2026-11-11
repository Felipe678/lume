export const meta = {
  name: 'executar-plano',
  description: 'Executa a tabela de despacho de docs/tarefas/<codigo>.md (implementação, QA, segurança, até 2 rodadas de correção e review) e devolve um JSON só',
  phases: ['Ler plano', 'Executar passos', 'QA e segurança', 'Correção', 'Review'],
}

// Chamado pelo /proxima-tarefa depois da aprovação do plano, com args = { codigo: 'LUME-68' }.
// O despachante recebe só o retorno final; plano, aprovação, commit, PR e Jira continuam na sessão.
// Regras do protocolo que o roteiro respeita: passos do mesmo módulo em sequência, no máximo 8 passos,
// 2 rodadas de correção, um QA por tarefa e segurança só quando o plano diz "sim".
// Testes e CI sempre pelo resumo: node scripts/dev/ci.mjs --resumo <app|legado|servidor|n8n|tudo>.
// Cada mudança de etapa é refletida no orquestrador n8n pelos hooks; o workflow não envia eventos.
// ATENCAO: o nome da opção que escolhe o agente de .claude/agents/ está só em papel(). Antes da primeira execução,
// carregue /workflow-authoring e confirme o nome (a doc pública não o lista); se mudar, só papel() muda.
const papel = (agente, extra = {}) => ({ agentType: agente, ...extra })

const codigo = args && args.codigo
if (!codigo || !/^LUME-\d+$/.test(codigo)) throw new Error('args.codigo obrigatório (ex.: LUME-68)')

const relatorio = {
  type: 'object',
  required: ['resultado', 'arquivos', 'comandos', 'desvios', 'pendencias'],
  properties: {
    resultado: { enum: ['concluido', 'parcial', 'bloqueado'] },
    arquivos: { type: 'array', items: { type: 'string' } },
    comandos: { type: 'array', items: { type: 'string' } },
    desvios: { type: 'string' },
    pendencias: { type: 'array', items: { type: 'string' } },
  },
}
const passo = {
  type: 'object',
  required: ['n', 'agente', 'briefing', 'grupo'],
  properties: {
    n: { type: 'integer' },
    agente: { type: 'string' },
    briefing: { type: 'object' },
    grupo: { type: 'integer', description: 'grupos rodam em sequência; passos do mesmo módulo/pasta ficam no mesmo grupo só se não dependerem entre si e não compilarem o mesmo módulo' },
  },
}
const revisao = {
  type: 'object',
  required: ['agente', 'briefing'],
  properties: { agente: { type: 'string' }, briefing: { type: 'object' } },
}

phase('Ler plano')
const plano = await agent(
  `Leia docs/tarefas/${codigo}.md (só este arquivo; não leia o .log.md nem o .contratos.md). Devolva os passos da tabela de despacho que ainda não estão "concluido", ` +
  `cada um com o agente e o briefing JSON do passo exatamente como está no arquivo. Atribua "grupo": passos com dependência ficam em grupos posteriores aos de que dependem; ` +
  `passos que compilam o mesmo módulo (mesmo app Flutter em app/, mesmo projeto Maven, mesmo pacote do servidor) nunca ficam no mesmo grupo. Devolva também o QA da tarefa, a segurança (null se "não") ` +
  `e o executor principal (o agente do passo com mais arquivos). Não execute nada.`,
  {
    label: 'ler plano',
    schema: {
      type: 'object',
      required: ['passos', 'qa', 'seguranca', 'executorPrincipal'],
      properties: {
        passos: { type: 'array', maxItems: 8, items: passo },
        qa: revisao,
        seguranca: { anyOf: [revisao, { type: 'null' }] },
        executorPrincipal: { type: 'string' },
      },
    },
  },
)
log(`${codigo}: ${plano.passos.length} passo(s) pendente(s)`)

phase('Executar passos')
const feitos = {}
const grupos = [...new Set(plano.passos.map((p) => p.grupo))].sort((a, b) => a - b)
for (const g of grupos) {
  const doGrupo = plano.passos.filter((p) => p.grupo === g)
  const res = await parallel(doGrupo.map((p) => () =>
    agent(JSON.stringify(p.briefing), papel(p.agente, { label: `passo ${p.n} · ${p.agente}`, schema: relatorio }))))
  doGrupo.forEach((p, i) => { feitos[p.n] = res[i] })
  const travados = doGrupo.filter((p, i) => !res[i] || res[i].resultado === 'bloqueado')
  if (travados.length) {
    return { codigo, resultado: 'bloqueado', etapa: 'implementacao', passos: feitos, bloqueados: travados.map((p) => p.n) }
  }
}

phase('QA e segurança')
const [qa, seg] = await parallel([
  () => agent(JSON.stringify(plano.qa.briefing), papel(plano.qa.agente, { label: `QA · ${plano.qa.agente}`, schema: relatorio })),
  () => (plano.seguranca
    ? agent(JSON.stringify(plano.seguranca.briefing), papel(plano.seguranca.agente, { label: `segurança · ${plano.seguranca.agente}`, schema: relatorio }))
    : Promise.resolve(null)),
])

phase('Correção')
const arquivos = [...new Set(Object.values(feitos).filter(Boolean).flatMap((r) => r.arquivos))]
let pendencias = [...((qa && qa.pendencias) || []), ...((seg && seg.pendencias) || [])]
let rodadas = 0
while (pendencias.length && rodadas < 2) {
  rodadas++
  // O workflow não retoma um agente pelo ID: a correção é um agente novo, então o briefing leva só as pendências e os arquivos exatos.
  const fix = await agent(
    JSON.stringify({
      tarefa: codigo, passo: `correcao-${rodadas}`,
      objetivo: 'Corrigir somente as pendências abaixo, sem mudar o resto.',
      pendencias, contexto_minimo: arquivos.slice(0, 5),
      pronto_quando: ['node scripts/dev/ci.mjs --resumo <etapa afetada> verde'],
      limite_resposta: 'até 150 palavras + lista de arquivos',
    }),
    papel(plano.executorPrincipal, { label: `correção ${rodadas}`, schema: relatorio }),
  )
  const reteste = await agent(
    JSON.stringify({ ...plano.qa.briefing, objetivo: `Reconferir somente: ${pendencias.join('; ')}` }),
    papel(plano.qa.agente, { label: `reteste ${rodadas}`, schema: relatorio }),
  )
  pendencias = (reteste && reteste.pendencias) || (fix ? fix.pendencias : pendencias)
}

phase('Review')
const review = await agent(
  `Revise o diff da tarefa ${codigo} (git diff main...HEAD e arquivos não commitados) contra a definição de pronto de docs/tarefas/${codigo}.md. ` +
  `Em tarefa de tela, confira fidelidade ao Design System v2 "brasa" (D12 em DECISOES_E_ROADMAP.md). ` +
  `Relate só lacunas de correção que bloqueiam o commit, em pendencias. Não edite arquivos.`,
  papel('dev-techlead', { label: 'review', schema: relatorio }),
)

const resultado = pendencias.length || (review && review.pendencias.length) ? 'parcial' : 'concluido'
return { codigo, resultado, passos: feitos, qa, seguranca: seg, rodadas_correcao: rodadas, pendencias, review }
