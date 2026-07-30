/** Voz local (SpeechSynthesis) em pt-BR — no-op silencioso quando não há suporte/voz. */

let cachedVoice: SpeechSynthesisVoice | null | undefined

function resolveVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return null
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('pt-br')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ??
    voices[0] ??
    null
  )
}

// vozes carregam async em alguns navegadores (edge 38)
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

export function speechAvailable(): boolean {
  if (typeof speechSynthesis === 'undefined') return false
  if (cachedVoice === undefined) cachedVoice = resolveVoice()
  return cachedVoice !== null
}

export function speak(text: string) {
  if (typeof speechSynthesis === 'undefined') return
  if (cachedVoice === undefined) cachedVoice = resolveVoice()
  if (!cachedVoice) return
  try {
    speechSynthesis.cancel() // não empilhar falas (edge 40)
    const u = new SpeechSynthesisUtterance(text)
    u.voice = cachedVoice
    u.lang = cachedVoice.lang
    u.rate = 1.05
    speechSynthesis.speak(u)
  } catch {
    // autoplay policy em background etc. — falha silenciosa (edge 39)
  }
}
