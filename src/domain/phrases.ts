/** Frases motivacionais do Lume — curtas, despojadas, prontas para voz e notificação. */

export const START_PHRASES = [
  'Bora acender essa chama!',
  'Um bloco de cada vez — esse é o caminho.',
  'Começou. Só você e essa atividade agora.',
  'Constância vence intensidade. Vamos.',
  'A escola tocou o sinal: hora de {title}.',
  'Pequeno hoje, gigante em um ano. Bora.',
  'Foco no agora — o resto espera.',
]

export const END_PHRASES = [
  'Fechou! Mais um tijolo no muro.',
  'Feito é melhor que perfeito — e você fez.',
  'A chama agradece. Próxima!',
  'Isso é disciplina virando identidade.',
  'Um passo a menos até o objetivo.',
]

export const DAY_CLOSE_PHRASES = [
  'Amanhã a gente continua — mais um dia acima da linha.',
  'Dia encerrado. A constância mora nesses finais.',
  'Descanse: quem apaga a luz hoje acende a chama amanhã.',
  'O que você repetiu hoje é quem você vira amanhã.',
  'Missão do dia cumprida. O futuro agradece.',
]

/** Escolha determinística — sem Math.random espalhado e sem repetir na mesma âncora. */
export function pickPhrase(list: string[], seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return list[Math.abs(hash) % list.length]
}
