import type { NextApiRequest, NextApiResponse } from 'next'
import { getNigganData, patchNigganData, supabaseConfigured } from '@/lib/server/supabase'
import { sendPush, pushConfigured } from '@/lib/server/webpush'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Supabase não configurado' })
  if (!pushConfigured()) return res.status(500).json({ error: 'VAPID keys não configuradas' })

  try {
    const data = (await getNigganData()) || {}
    const subscriptions: any[] = Array.isArray(data.pushSubscriptions) ? data.pushSubscriptions : []
    if (subscriptions.length === 0) return res.status(400).json({ error: 'Nenhum dispositivo inscrito' })

    let sent = 0
    const survivors: any[] = []
    for (const sub of subscriptions) {
      try {
        await sendPush(sub, {
          title: 'Neggan Finances',
          body: 'Notificações ativadas — você vai receber avisos de contas e faturas vencendo por aqui.',
          url: '/contas',
        })
        sent++
        survivors.push(sub)
      } catch (err: any) {
        if (err?.statusCode !== 404 && err?.statusCode !== 410) survivors.push(sub)
      }
    }
    if (survivors.length !== subscriptions.length) {
      await patchNigganData({ ...data, pushSubscriptions: survivors })
    }
    return res.status(200).json({ ok: true, sent })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
