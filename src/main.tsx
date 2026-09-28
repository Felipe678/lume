import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { startClock } from './store/useClock'
import { startSync } from './store/sync'
import { STORAGE_KEY, storageAvailable, useAppStore } from './store/useAppStore'
import { useFocusSession } from './store/useFocusSession'

startClock()
startSync()

// registra o instante em que o app foi fechado/ocultado (pagehide cobre fechar a
// aba; visibilitychange cobre trocar de app no celular/tablet)
const recordClose = () => useFocusSession.getState().recordAppClosed(new Date().toISOString())
window.addEventListener('pagehide', recordClose)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) recordClose()
})

if (storageAvailable) {
  // outra aba gravou → re-hidrata este estado (last-write-wins)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useAppStore.persist.rehydrate()
  })
  void navigator.storage?.persist?.().catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
