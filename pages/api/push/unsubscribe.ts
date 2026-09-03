import type { NextApiRequest, NextApiResponse } from 'next'
import { getNigganData, patchNigganData, supabaseConfigured } from '@/lib/server/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!supabaseConfigured()) return res.status(500).json({ error: 'Supabase não configurado' })

  const endpoint = req.body?.endpoint
  if (!endpoint) return res.status(400).json({ error: 'endpoint faltando' })

  try {
    const data = (await getNigganData()) || {}
    const existing: any[] = Array.isArray(data.pushSubscriptions) ? data.pushSubscriptions : []
    const merged = existing.filter(s => s.endpoint !== endpoint)
    await patchNigganData({ ...data, pushSubscriptions: merged })
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
