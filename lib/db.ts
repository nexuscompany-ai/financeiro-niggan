import { getSupabase, isSupabaseConfigured } from './supabase'
import { Transaction, Goal } from './store'

export async function fetchTransactions(): Promise<Transaction[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('transactions').select('*').order('date', { ascending: false })
  if (error) { console.error('fetchTransactions:', error.message); return [] }
  return (data || []).map(r => ({
    id: r.id, type: r.type, category: r.category,
    amount: Number(r.amount), description: r.description,
    date: r.date, processed: r.processed,
  }))
}

export async function insertTransaction(tx: Transaction): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb.from('transactions').insert([{
    id: tx.id, type: tx.type, category: tx.category,
    amount: tx.amount, description: tx.description,
    date: tx.date, processed: tx.processed,
  }])
  if (error) { console.error('insertTransaction:', error.message); return false }
  return true
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb.from('transactions').delete().eq('id', id)
  if (error) { console.error('deleteTransaction:', error.message); return false }
  return true
}

export async function fetchGoals(): Promise<Goal[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.from('goals').select('*').order('target', { ascending: true })
  if (error) { console.error('fetchGoals:', error.message); return [] }
  return (data || []).map(r => ({
    month: r.month, target: Number(r.target),
    actual: r.actual !== null ? Number(r.actual) : null,
  }))
}

export async function upsertGoal(month: string, actual: number): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb.from('goals').upsert({ month, actual }, { onConflict: 'month' })
  if (error) { console.error('upsertGoal:', error.message); return false }
  return true
}

export async function fetchBalance(): Promise<number | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('balance').select('value').eq('id', 1).single()
  if (error) return null
  return data ? Number(data.value) : null
}

export async function saveBalance(value: number): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb.from('balance').upsert({ id: 1, value }, { onConflict: 'id' })
  if (error) { console.error('saveBalance:', error.message); return false }
  return true
}
