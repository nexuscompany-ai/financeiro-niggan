import { create } from 'zustand'

export type TransactionType = 'income' | 'expense' | 'investment'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
}

export interface Patrimony {
  account: string
  balance: number
}

export interface Goal {
  month: string
  target: number
  actual: number | null
}

export interface FinanceState {
  transactions: Transaction[]
  patrimony: Patrimony[]
  goals: Goal[]

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void
  updatePatrimony: (account: string, balance: number) => void
  updateGoal: (month: string, actual: number) => void

  // Computed
  getBalance: () => number
  getToday: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getLast7Days: () => { income: number; expense: number; transactions: Transaction[] }
  getThisMonth: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getByCategory: (days?: number) => Record<string, number>
  getInsights: () => { dailyAverage: number; projectedMonthly: number; mostSpentCategory: string; biggestExpense: Transaction | null }
  getTotalPatrimony: () => number

  // Storage
  load: () => void
  save: (state: any) => void
}

const INITIAL_PATRIMONY: Patrimony[] = [
  { account: 'C6 Investimentos', balance: 9976.31 },
  { account: 'XP Investimentos', balance: 0 },
  { account: 'Mercado Pago', balance: 303.44 },
  { account: 'Dinheiro em conta', balance: 420.10 },
  { account: 'Santander', balance: 284.78 },
]

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

// Dados reais da planilha mais recente (Agosto/2026)
const INITIAL_TRANSACTIONS: Transaction[] = [
  // ENTRADAS
  { id: 'init-1', type: 'income', category: 'Salário FGL Brasil', amount: 1500, description: 'Salário FGL Brasil - Ago/2026', date: '2026-08-01' },
  { id: 'init-2', type: 'income', category: 'Outras receitas', amount: 272.75, description: 'Outras receitas - Ago/2026', date: '2026-08-01' },
  // DESPESAS FIXAS
  { id: 'init-3', type: 'expense', category: 'Internet VIVO', amount: 65.33, description: 'Internet VIVO', date: '2026-08-01' },
  { id: 'init-4', type: 'expense', category: 'Combustível', amount: 184.39, description: 'Combustível', date: '2026-08-01' },
  { id: 'init-5', type: 'expense', category: 'Cartão de Crédito', amount: 132.50, description: 'Cartão de Crédito', date: '2026-08-01' },
  { id: 'init-6', type: 'expense', category: 'Corte Cabelo', amount: 65, description: 'Corte de Cabelo', date: '2026-08-01' },
  { id: 'init-7', type: 'expense', category: 'Assinaturas', amount: 63, description: 'Assinaturas (IA, VPN, etc.)', date: '2026-08-01' },
  // DESPESAS VARIÁVEIS
  { id: 'init-8', type: 'expense', category: 'Lazer', amount: 196.79, description: 'Lazer', date: '2026-08-01' },
  { id: 'init-9', type: 'expense', category: 'Presentes', amount: 58.90, description: 'Presentes', date: '2026-08-01' },
  { id: 'init-10', type: 'expense', category: 'Imprevistos', amount: 8, description: 'Imprevistos', date: '2026-08-01' },
  // INVESTIMENTOS
  { id: 'init-11', type: 'investment', category: 'CDB / Reserva', amount: 540, description: 'Investimento - Salário (C6/XP)', date: '2026-08-01' },
]

function daysBefore(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  patrimony: INITIAL_PATRIMONY,
  goals: INITIAL_GOALS,

  load: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('niggan-v3')
      if (raw) {
        const data = JSON.parse(raw)
        set({
          transactions: data.transactions ?? INITIAL_TRANSACTIONS,
          patrimony: data.patrimony ?? INITIAL_PATRIMONY,
          goals: data.goals ?? INITIAL_GOALS,
        })
      } else {
        // Primeira vez: carrega com dados da planilha
        set({ transactions: INITIAL_TRANSACTIONS, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS })
        get().save({ transactions: INITIAL_TRANSACTIONS, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS })
      }
    } catch (e) {
      set({ transactions: INITIAL_TRANSACTIONS, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS })
    }
  },

  save: (data) => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem('niggan-v3', JSON.stringify(data)) } catch {}
  },

  addTransaction: (tx) => {
    set((state) => {
      const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }
      const newTxs = [newTx, ...state.transactions]
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const newTxs = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const newTxs = state.transactions.filter(t => t.id !== id)
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  updatePatrimony: (account, balance) => {
    set((state) => {
      const newPat = state.patrimony.map(p => p.account === account ? { ...p, balance } : p)
      const newState = { transactions: state.transactions, patrimony: newPat, goals: state.goals }
      get().save(newState)
      return { patrimony: newPat }
    })
  },

  updateGoal: (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map(g => g.month === month ? { ...g, actual } : g)
      const newState = { transactions: state.transactions, patrimony: state.patrimony, goals: newGoals }
      get().save(newState)
      return { goals: newGoals }
    })
  },

  getBalance: () => {
    return get().transactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount
      return sum - t.amount
    }, 0)
  },

  getTotalPatrimony: () => get().patrimony.reduce((s, p) => s + p.balance, 0),

  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter(t => t.date === today)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      investment: txs.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getLast7Days: () => {
    const start = daysBefore(7)
    const txs = get().transactions.filter(t => t.date >= start)
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getThisMonth: () => {
    const now = new Date()
    const txs = get().transactions.filter(t => {
      const d = new Date(t.date + 'T12:00:00')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      investment: txs.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
      transactions: txs,
    }
  },

  getByCategory: (days = 30) => {
    const start = daysBefore(days)
    const txs = get().transactions.filter(t => t.type === 'expense' && t.date >= start)
    const result: Record<string, number> = {}
    txs.forEach(t => { result[t.category] = (result[t.category] || 0) + t.amount })
    return result
  },

  getInsights: () => {
    const { transactions: last7 } = get().getLast7Days()
    const expenses = last7.filter(t => t.type === 'expense')
    const byCategory = get().getByCategory(7)
    const total7 = expenses.reduce((s, t) => s + t.amount, 0)
    const dailyAverage = total7 / 7
    const mostSpentCategory = Object.entries(byCategory).sort(([,a],[,b]) => b - a)[0]?.[0] ?? '-'
    const biggestExpense = expenses.length > 0 ? expenses.reduce((m, t) => t.amount > m.amount ? t : m, expenses[0]) : null
    return { dailyAverage, projectedMonthly: dailyAverage * 30, mostSpentCategory, biggestExpense }
  },
}))

export default useFinanceStore
