// SessionStart: injeta no contexto a data/hora local (America/Sao_Paulo), a tarefa em andamento, o modo de
// trabalho (normal/autônomo), os 3 últimos registros de progresso e o lembrete de usar multiagentes.
// Nunca falha a sessão: qualquer erro vira aviso e a saída é sempre 0.
import { lerTexto } from './lib-metricas.mjs';

try {
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const linhas = [`Data e hora local (America/Sao_Paulo): ${fmt.format(new Date())}.`];

  const atual = lerTexto('docs/tarefas/_atual').trim().split(/\r?\n/)[0].trim();
  if (atual) {
    const plano = lerTexto(`docs/tarefas/${atual}.md`);
    const etapa = plano.match(/Etapa atual[^\n]*?:\**\s*(.+)/i)?.[1]?.trim();
    linhas.push(`Tarefa em andamento: ${atual}${etapa ? ` (etapa atual: ${etapa})` : ''}. Para continuar, use /retomar; para o estado geral, /status.`);
  } else {
    linhas.push('Nenhuma tarefa em andamento. Para pegar a próxima do Jira, use /proxima-tarefa.');
  }

  const modo = lerTexto('docs/tarefas/_modo').trim().split(/\r?\n/)[0].trim().toLowerCase();
  if (modo === 'autonomo') {
    linhas.push('MODO AUTÔNOMO ligado (/KeepWORKING): continue o backlog sem esperar o Felipe; decisão dele vira item em docs/pendencias.md e o trabalho segue. Não use AskUserQuestion nem termine respostas esperando resposta. Ação irreversível, gasto, publicação e credenciais viram pendência. /ComeBack volta ao modo normal.');
  } else {
    linhas.push('Modo normal (decisões importantes passam pelo Felipe).');
  }

  const progresso = lerTexto('docs/progresso.md').split(/\r?\n/).filter((l) => /^\d{2}\/\d{2}\/\d{4}\s*·/.test(l));
  const ultimos = progresso.slice(-3).map((l) => l.trim().slice(0, 240));
  if (ultimos.length) linhas.push('Últimos registros de progresso:', ...ultimos.map((l) => `  ${l}`));

  linhas.push('Lembrete: SEMPRE MULTIAGENTES. Dimensione antes de implementar (quantos agentes e em quantas partes), um agente por parte divisível com escopo de arquivos exclusivo, em ondas quando houver dependência; a sessão principal despacha e subagente não chama subagente. Telas e widgets: fiel ao Design System v2 "brasa" (skill ds-fidelidade).');

  console.log(linhas.join('\n'));
} catch (e) {
  console.log(`session-start: não foi possível montar o contexto (${e?.message || e}).`);
}
process.exit(0);
