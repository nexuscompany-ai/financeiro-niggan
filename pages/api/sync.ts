import type { NextApiRequest, NextApiResponse } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_ANON_KEY_SUPA

async function supabaseRequest(method: string, body?: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main`, {
    method,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return res
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase não configurado', SUPABASE_URL: !!SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_KEY })
  }

  // GET - buscar dados
  if (req.method === 'GET') {
    try {
      const response = await supabaseRequest('GET')
      const rows = await response.json()

      if (!response.ok) {
        return res.status(500).json({ error: 'Erro ao buscar', details: rows })
      }

      // Se não tem dados, cria o registro
      if (!rows || rows.length === 0) {
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ id: 'main', data: {} }),
        })
        const created = await createRes.json()
        return res.status(200).json({ data: null, created: true })
      }

      return res.status(200).json({ data: rows[0]?.data || null })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  // POST - salvar dados
  if (req.method === 'POST') {
    try {
      const { data } = req.body
      if (!data) return res.status(400).json({ error: 'Sem dados' })

      // Tenta PATCH primeiro
      const patchRes = await supabaseRequest('PATCH', { data, updated_at: new Date().toISOString() })

      if (!patchRes.ok) {
        const patchErr = await patchRes.json()
        return res.status(500).json({ error: 'Erro ao salvar', details: patchErr })
      }

      const rows = await patchRes.json()

      // Se PATCH não atualizou nada, faz INSERT
      if (!rows || rows.length === 0) {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ id: 'main', data, updated_at: new Date().toISOString() }),
        })
        const inserted = await insertRes.json()
        return res.status(200).json({ ok: true, inserted: true })
      }

      return res.status(200).json({ ok: true, updated: true })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
