import type { NextApiRequest, NextApiResponse } from 'next'
import { getNigganData, patchNigganData, supabaseConfigured } from '@/lib/server/supabase'
import { sendPush, pushConfigured } from '@/lib/server/webpush'
import { CARD_DUE_DAY, CARD_LABEL, openPurchasesForMonth } from '@/lib/creditCards'
import { isBillPaidThisMonth, daysUntilDue } from '@/lib/bills'
import { formatCurrency } from '@/lib/utils'

// Disparado 1x por dia pelo Vercel Cron (vercel.json). Manda UMA notificação
// resumindo o que vence hoje/amanhã ou já venceu e continua em aberto — com
// os valores reais (variáveis) de cada conta/fatura, não um aviso genérico.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Supabase não configurado' })
  if (!pushConfigured()) return res.status(500).json({ error: 'VAPID keys não configuradas' })

  try {
    const data = await getNigganData()
    if (!data) return res.status(200).json({ ok: true, sent: 0, reason: 'sem dados' })

    const bills = data.bills || []
    const creditCardPurchases = data.creditCardPurchases || []
    const transactions = data.transactions || []
    const subscriptions: any[] = Array.isArray(data.pushSubscriptions) ? data.pushSubscriptions : []
    if (subscriptions.length === 0) return res.status(200).json({ ok: true, sent: 0, reason: 'sem inscrições' })

    const now = new Date()
    type DueItem = { description: string; amount: number; days: number }
    const due: DueItem[] = []

    for (const b of bills) {
      if (!b.active || !b.recurring) continue
      if (isBillPaidThisMonth(transactions, b.id, now)) continue
      const days = daysUntilDue(b.dueDay, 0, now)
      if (days <= 1) due.push({ description: b.description, amount: b.amount, days })
    }

    const cards: ('C6'|'Nubank')[] = ['C6', 'Nubank']
    for (const card of cards) {
      const open = openPurchasesForMonth(creditCardPurchases, card, 0, now)
      const amount = open.reduce((s: number, p: any) => s + p.monthlyAmount, 0)
      if (amount <= 0) continue
      const days = daysUntilDue(CARD_DUE_DAY[card], 0, now)
      if (days <= 1) due.push({ description: `Fatura ${CARD_LABEL[card]}`, amount, days })
    }

    if (due.length === 0) return res.status(200).json({ ok: true, sent: 0, reason: 'nada vencendo' })

    due.sort((a, b) => a.days - b.days)
    const total = due.reduce((s, d) => s + d.amount, 0)
    const suffix = (d: DueItem) => d.days < 0 ? 'vencida' : d.days === 0 ? 'vence hoje' : 'vence amanhã'

    const title = due.length === 1
      ? `${due[0].description} — ${suffix(due[0])}`
      : `${due.length} contas precisam de atenção`
    const body = due.length === 1
      ? formatCurrency(due[0].amount)
      : due.slice(0, 4).map(d => `${d.description}: ${formatCurrency(d.amount)}`).join(' · ')
        + (due.length > 4 ? ` · +${due.length - 4}` : '') + ` · Total ${formatCurrency(total)}`

    let sent = 0
    const survivors: any[] = []
    for (const sub of subscriptions) {
      try {
        await sendPush(sub, { title, body, url: '/contas' })
        sent++
        survivors.push(sub)
      } catch (err: any) {
        // 404/410 = inscrição expirada/revogada no navegador — descarta.
        if (err?.statusCode !== 404 && err?.statusCode !== 410) survivors.push(sub)
      }
    }
    if (survivors.length !== subscriptions.length) {
      await patchNigganData({ ...data, pushSubscriptions: survivors })
    }

    return res.status(200).json({ ok: true, sent, dueCount: due.length })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
