import type { NextApiRequest, NextApiResponse } from 'next'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.ANON_KEY_SUPA || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_ANON_KEY_SUPA

async function supabaseGet() {
  return fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main&select=data`, {
    headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
}

async function supabasePatch(data: any) {
  return fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify({ data, updated_at: new Date().toISOString() })
  })
}

async function supabaseInsert(data: any) {
  return fetch(`${SUPABASE_URL}/rest/v1/niggan_data`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify({ id: 'main', data, updated_at: new Date().toISOString() })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({
      error: 'Supabase não configurado',
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_KEY: !!SUPABASE_KEY,
    })
  }

  if (req.method === 'GET') {
    try {
      const getRes = await supabaseGet()
      const rows = await getRes.json()
      if (!getRes.ok) return res.status(500).json({ error: 'Erro ao buscar', details: rows })
      if (!rows || rows.length === 0) {
        await supabaseInsert({})
        return res.status(200).json({ data: null })
      }
      return res.status(200).json({ data: rows[0]?.data || null })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  if (req.method === 'POST') {
    try {
      const { data } = req.body
      if (!data) return res.status(400).json({ error: 'Sem dados' })
      const patchRes = await supabasePatch(data)
      const patchRows = await patchRes.json()
      if (!patchRows || patchRows.length === 0) {
        await supabaseInsert(data)
        return res.status(200).json({ ok: true, action: 'inserted' })
      }
      return res.status(200).json({ ok: true, action: 'updated' })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
