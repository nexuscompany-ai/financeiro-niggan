import { create } from 'zustand'
import {
  fetchTransactions, insertTransaction, deleteTransaction,
  fetchGoals, upsertGoal,
  fetchBalance, saveBalance,
} from './db'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  processed: boolean
}

export interface Goal {
  month: string
  target: number
  actual: number | null
}

export interface FinanceState {
  transactions: Transaction[]
  balance: number
  goals: Goal[]
  synced: boolean   // true = dados vêm do Supabase

  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  addTiktokIncome: (amount: number) => Promise<void>
  updateGoal: (month: string, actual: number) => Promise<void>

  loadFromStorage: () => void
  loadFromSupabase: () => Promise<void>

  getToday: () => { income: number; expense: number; transactions: Transaction[] }
  getLast7Days: () => { income: number; expense: number; transactions: Transaction[] }
  getThisMonth: () => { income: number; expense: number; transactions: Transaction[] }
  getByCategory: (days?: number) => Record<string, number>
  getInsights: () => {
    biggestExpense: Transaction | null
    mostSpentCategory: string
    dailyAverage: number
    projectedMonthly: number
  }
}

const INITIAL_GOALS: Goal[] = [
  { month: 'Ago/2026', target: 3000, actual: null },
  { month: 'Set/2026', target: 6000, actual: null },
  { month: 'Out/2026', target: 9000, actual: null },
  { month: 'Nov/2026', target: 12000, actual: null },
  { month: 'Dez/2026', target: 15000, actual: null },
  { month: 'Jan/2027', target: 18000, actual: null },
  { month: 'Fev/2027', target: 21000, actual: null },
  { month: 'Mar/2027', target: 24000, actual: null },
  { month: 'Abr/2027', target: 27000, actual: null },
  { month: 'Mai/2027', target: 30000, actual: null },
]

function makeId() {
  return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

function dateRange(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function saveLocal(state: { transactions: Transaction[]; balance: number; goals: Goal[] }) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem('niggan-v2', JSON.stringify(state)) } catch {}
}

function recalcBalance(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  balance: 0,
  goals: INITIAL_GOALS,
  synced: false,

  // ── Carregar do localStorage (fallback) ──────────────────────
  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('niggan-v2')
      if (saved) {
        const p = JSON.parse(saved)
        set({
          transactions: p.transactions || [],
          balance: p.balance || 0,
          goals: p.goals || INITIAL_GOALS,
        })
      }
    } catch {}
  },

  // ── Carregar do Supabase (fonte principal) ───────────────────
  loadFromSupabase: async () => {
    const [txs, goals, balanceRow] = await Promise.all([
      fetchTransactions(),
      fetchGoals(),
      fetchBalance(),
    ])
    if (txs.length === 0 && goals.length === 0) return // Supabase vazio ou não configurado

    const balance = balanceRow !== null ? balanceRow : recalcBalance(txs)
    const mergedGoals = INITIAL_GOALS.map(g => {
      const found = goals.find(sg => sg.month === g.month)
      return found ? { ...g, actual: found.actual } : g
    })

    set({ transactions: txs, balance, goals: mergedGoals, synced: true })
    saveLocal({ transactions: txs, balance, goals: mergedGoals })
  },

  // ── Adicionar transação ──────────────────────────────────────
  addTransaction: async (tx) => {
    const newTx: Transaction = { ...tx, id: makeId() }
    set((state) => {
      const newTxs = [newTx, ...state.transactions]
      const newBal = state.balance + (tx.type === 'income' ? tx.amount : -tx.amount)
      saveLocal({ transactions: newTxs, balance: newBal, goals: state.goals })
      return { transactions: newTxs, balance: newBal }
    })
    // Persistir no Supabase em background
    await insertTransaction(newTx)
    await saveBalance(get().balance)
  },

  // ── Remover transação ────────────────────────────────────────
  removeTransaction: async (id) => {
    const tx = get().transactions.find(t => t.id === id)
    if (!tx) return
    set((state) => {
      const newTxs = state.transactions.filter(t => t.id !== id)
      const newBal = state.balance - (tx.type === 'income' ? tx.amount : -tx.amount)
      saveLocal({ transactions: newTxs, balance: newBal, goals: state.goals })
      return { transactions: newTxs, balance: newBal }
    })
    await deleteTransaction(id)
    await saveBalance(get().balance)
  },

  // ── TikTok Shop ──────────────────────────────────────────────
  addTiktokIncome: async (amount) => {
    await get().addTransaction({
      type: 'income',
      category: 'TikTok Shop',
      amount,
      description: 'Rendimento semanal TikTok Shop',
      date: new Date().toISOString().split('T')[0],
      processed: true,
    })
  },

  // ── Atualizar meta ───────────────────────────────────────────
  updateGoal: async (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map(g => g.month === month ? { ...g, actual } : g)
      saveLocal({ transactions: state.transactions, balance: state.balance, goals: newGoals })
      return { goals: newGoals }
    })
    await upsertGoal(month, actual)
  },

  // ── Computed: Hoje ───────────────────────────────────────────
  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter(t => t.date === today)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  // ── Computed: 7 Dias ─────────────────────────────────────────
  getLast7Days: () => {
    const start = dateRange(7)
    const txs = get().transactions.filter(t => t.date >= start)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  // ── Computed: Este Mês ───────────────────────────────────────
  getThisMonth: () => {
    const now = new Date()
    const txs = get().transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  // ── Computed: Por Categoria ──────────────────────────────────
  getByCategory: (days = 30) => {
    const start = dateRange(days)
    const txs = get().transactions.filter(t => t.type === 'expense' && t.date >= start)
    const result: Record<string, number> = {}
    txs.forEach(t => { result[t.category] = (result[t.category] || 0) + t.amount })
    return result
  },

  // ── Computed: Insights ───────────────────────────────────────
  getInsights: () => {
    const expenses7 = get().transactions.filter(t => t.type === 'expense' && t.date >= dateRange(7))
    const byCategory = get().getByCategory(7)
    const biggestExpense = expenses7.length > 0
      ? expenses7.reduce((max, t) => t.amount > max.amount ? t : max, expenses7[0])
      : null
    const mostSpentCategory = Object.entries(byCategory).length > 0
      ? Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0][0]
      : '-'
    const totalExpense7 = expenses7.reduce((s, t) => s + t.amount, 0)
    const dailyAverage = totalExpense7 / 7
    return { biggestExpense, mostSpentCategory, dailyAverage, projectedMonthly: dailyAverage * 30 }
  },
}))

export default useFinanceStore
