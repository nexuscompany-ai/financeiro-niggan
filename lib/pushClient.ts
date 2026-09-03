// Assinatura de push no navegador (Safari 16.4+ inclui suporte nativo à Web
// Push API padrão, sem precisar de certificado APNs separado). Usado só
// pela tela de Configurações — o resto do app não depende disso.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const bytes = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i)
  return bytes
}

export function pushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return null
  return reg.pushManager.getSubscription()
}

// Nunca deixa o erro estourar pra quem chamou — a tela de Configurações
// depende do retorno {ok,reason} pra sair do estado "Ativando..." mesmo
// quando o navegador recusa (permissão negada, sem suporte em aba anônima,
// etc.).
export async function subscribeToPush(): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: 'Seu navegador não suporta notificações push' }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) return { ok: false, reason: 'Notificações ainda não configuradas no servidor' }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'Permissão de notificação negada' }

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    })
    if (!res.ok) return { ok: false, reason: 'Falha ao salvar a inscrição no servidor' }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, reason: err?.message || 'Não foi possível ativar as notificações' }
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    const sub = await getPushSubscription()
    if (!sub) return
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    }).catch(() => {})
  } catch {}
}

export async function sendTestPush(): Promise<{ ok: boolean; reason?: string }> {
  try {
    const res = await fetch('/api/push/test', { method: 'POST' })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return { ok: false, reason: j.error || 'Falha ao enviar notificação de teste' }
    }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, reason: err?.message || 'Falha ao enviar notificação de teste' }
  }
}
