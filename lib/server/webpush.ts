import webpush from 'web-push'

let configured = false

function ensureConfigured() {
  if (configured) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:felipealmeidasouza0777@gmail.com'
  if (!publicKey || !privateKey) throw new Error('VAPID keys não configuradas no Vercel')
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

export function pushConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY
}

export async function sendPush(subscription: webpush.PushSubscription, payload: Record<string, any>) {
  ensureConfigured()
  return webpush.sendNotification(subscription, JSON.stringify(payload))
}
