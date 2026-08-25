import { create } from 'zustand'

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
  month: string        // "Ago/2026"
  target: number       // R$ 3.000
  actual: number | null
}

export interface FinanceState {
  transactions: Transaction[]
  balance: number
  goals: Goal[]

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  addTiktokIncome: (amount: number) => void
  updateGoal: (month: string, actual: number) => void

  // Storage
  loadFromStorage: () => void
  saveToStorage: (data: any) => void

  // Computed
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

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  balance: 0,
  goals: INITIAL_GOALS,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('niggan-v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        set({
          transactions: parsed.transactions || [],
          balance: parsed.balance || 0,
          goals: parsed.goals || INITIAL_GOALS,
        })
      }
    } catch (e) { console.error(e) }
  },

  saveToStorage: (data) => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem('niggan-v2', JSON.stringify(data)) }
    catch (e) { console.error(e) }
  },

  addTransaction: (tx) => {
    set((state) => {
      const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` }
      const newBalance = state.balance + (tx.type === 'income' ? tx.amount : -tx.amount)
      const newTransactions = [newTx, ...state.transactions]
      const newState = { transactions: newTransactions, balance: newBalance, goals: state.goals }
      get().saveToStorage(newState)
      return { transactions: newTransactions, balance: newBalance }
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === id)
      if (!tx) return state
      const newBalance = state.balance - (tx.type === 'income' ? tx.amount : -tx.amount)
      const newTransactions = state.transactions.filter((t) => t.id !== id)
      const newState = { transactions: newTransactions, balance: newBalance, goals: state.goals }
      get().saveToStorage(newState)
      return { transactions: newTransactions, balance: newBalance }
    })
  },

  addTiktokIncome: (amount) => {
    get().addTransaction({
      type: 'income',
      category: 'TikTok Shop',
      amount,
      description: 'Rendimento semanal TikTok Shop',
      date: new Date().toISOString().split('T')[0],
      processed: true,
    })
  },

  updateGoal: (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map((g) => g.month === month ? { ...g, actual } : g)
      get().saveToStorage({ transactions: state.transactions, balance: state.balance, goals: newGoals })
      return { goals: newGoals }
    })
  },

  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter((t) => t.date === today)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getLast7Days: () => {
    const { start } = getDateRange(7)
    const txs = get().transactions.filter((t) => t.date >= start)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getThisMonth: () => {
    const now = new Date()
    const txs = get().transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getByCategory: (days = 30) => {
    const { start } = getDateRange(days)
    const txs = get().transactions.filter((t) => t.type === 'expense' && t.date >= start)
    const result: Record<string, number> = {}
    txs.forEach((t) => {
      result[t.category] = (result[t.category] || 0) + t.amount
    })
    return result
  },

  getInsights: () => {
    const { transactions: last7 } = get().getLast7Days()
    const expenses = last7.filter(t => t.type === 'expense')
    const byCategory = get().getByCategory(7)

    const biggestExpense = expenses.length > 0
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null

    const mostSpentCategory = Object.entries(byCategory).length > 0
      ? Object.entries(byCategory).sort(([,a],[,b]) => b - a)[0][0]
      : '-'

    const totalExpense7 = expenses.reduce((s, t) => s + t.amount, 0)
    const dailyAverage = totalExpense7 / 7
    const projectedMonthly = dailyAverage * 30

    return { biggestExpense, mostSpentCategory, dailyAverage, projectedMonthly }
  },
}))

export default useFinanceStore
