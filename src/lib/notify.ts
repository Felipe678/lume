/** Notificações locais do navegador — silenciosas quando não suportadas/permitidas. */

export function notificationSupport(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/** Pede permissão (para o toggle da Config). Resolve com o estado final. */
export async function ensureNotificationPermission(): Promise<ReturnType<typeof notificationSupport>> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function notify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/pwa-192.png', silent: false })
  } catch {
    // alguns navegadores exigem service worker — falha silenciosa
  }
}
