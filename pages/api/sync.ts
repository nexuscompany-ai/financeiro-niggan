import type { NextApiRequest, NextApiResponse } from 'next'

// Tenta com e sem prefixo NEXT_PUBLIC_
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_ANON_KEY_SUPA || process.env.ANON_KEY_SUPA

async function supabaseGet() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main&select=data`, {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    }
  })
  return res
}

async function supabasePatch(data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ data, updated_at: new Date().toISOString() })
  })
  return res
}

async function supabaseInsert(data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ id: 'main', data, updated_at: new Date().toISOString() })
  })
  return res
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({
      error: 'Supabase não configurado',
      vars: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        NEXT_PUBLIC_ANON_KEY_SUPA: !!process.env.NEXT_PUBLIC_ANON_KEY_SUPA,
        ANON_KEY_SUPA: !!process.env.ANON_KEY_SUPA,
      }
    })
  }

  // GET - buscar dados
  if (req.method === 'GET') {
    try {
      const getRes = await supabaseGet()
      const rows = await getRes.json()

      if (!getRes.ok) {
        return res.status(500).json({ error: 'Erro ao buscar', details: rows })
      }

      if (!rows || rows.length === 0) {
        // Registro não existe, cria
        await supabaseInsert({})
        return res.status(200).json({ data: null })
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

      // Tenta atualizar
      const patchRes = await supabasePatch(data)
      const patchRows = await patchRes.json()

      // Se não atualizou nenhuma linha, insere
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
