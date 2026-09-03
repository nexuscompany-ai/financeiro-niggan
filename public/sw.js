// Service worker só para push notifications (Safari 16.4+/macOS e outros
// navegadores compatíveis) — não faz cache de páginas nem funciona como PWA
// offline, só recebe o push do servidor e mostra a notificação.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = { title: 'Niggan Finances', body: 'Você tem uma conta vencendo.', url: '/contas' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/notification-icon.png',
      badge: '/notification-icon.png',
      data: { url: payload.url || '/contas' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/contas'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      return self.clients.openWindow(url)
    })
  )
})
