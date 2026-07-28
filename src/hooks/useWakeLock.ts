import { useEffect } from 'react'

interface WakeLockSentinelLike {
  release: () => Promise<void>
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> }
}

/**
 * Mantém a tela do tablet acesa enquanto o Painel está visível.
 * Sem suporte (ou sem permissão), degrada em silêncio.
 */
export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinelLike | null = null
    let disposed = false

    const request = async () => {
      try {
        const nav = navigator as NavigatorWithWakeLock
        const lock = await nav.wakeLock?.request('screen')
        if (disposed) void lock?.release().catch(() => {})
        else sentinel = lock ?? null
      } catch {
        // silencioso — usuário configura o tablet
      }
    }

    void request()
    const onVisibility = () => {
      if (!document.hidden) void request()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release().catch(() => {})
    }
  }, [])
}
