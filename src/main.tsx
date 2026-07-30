import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { startClock } from './store/useClock'
import { startSync } from './store/sync'
import { STORAGE_KEY, storageAvailable, useAppStore } from './store/useAppStore'

startClock()
startSync()

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
