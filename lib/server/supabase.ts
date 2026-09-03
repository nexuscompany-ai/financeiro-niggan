// Mesmo padrão/tabela usados por pages/api/sync.ts (uma linha única
// `niggan_data` id='main', coluna `data` em JSON) — reaproveitado aqui pelas
// rotas de push pra guardar as inscrições (`pushSubscriptions`) dentro do
// mesmo blob, sem precisar de uma tabela nova no Supabase.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.ANON_KEY_SUPA || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_ANON_KEY_SUPA

function headers() {
  return { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` }
}

export function supabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY
}

export async function getNigganData(): Promise<any | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main&select=data`, { headers: headers() })
  if (!res.ok) return null
  const rows = await res.json()
  return rows?.[0]?.data ?? null
}

// Substitui o blob inteiro (igual ao POST de /api/sync) — por isso quem
// chama precisa ler os dados atuais primeiro e só alterar o campo que
// interessa, senão apaga o resto (transações, contas, etc).
export async function patchNigganData(data: any): Promise<void> {
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/niggan_data?id=eq.main`, {
    method: 'PATCH',
    headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
  })
  const rows = await patchRes.json().catch(() => [])
  if (!Array.isArray(rows) || rows.length === 0) {
    await fetch(`${SUPABASE_URL}/rest/v1/niggan_data`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ id: 'main', data, updated_at: new Date().toISOString() }),
    })
  }
}
