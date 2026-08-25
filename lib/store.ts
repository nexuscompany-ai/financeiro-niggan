import { create } from 'zustand'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  processed: boolean
}

export interface FinanceState {
  transactions: Transaction[]
  balance: number
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  setWeeklyTiktokIncome: (amount: number) => void
  loadFromStorage: () => void
  saveToStorage: (state: { transactions: Transaction[]; balance: number }) => void
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  balance: 0,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('niggan-store')
      if (saved) {
        const parsed = JSON.parse(saved)
        set({
          transactions: parsed.transactions || [],
          balance: parsed.balance || 0,
        })
      }
    } catch (e) {
      console.error('Error loading from storage:', e)
    }
  },

  saveToStorage: (state) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('niggan-store', JSON.stringify(state))
    } catch (e) {
      console.error('Error saving to storage:', e)
    }
  },

  addTransaction: (tx) => {
    set((state) => {
      const newTransaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }
      const newBalance = state.balance + (tx.type === 'income' ? tx.amount : -tx.amount)
      const newTransactions = [...state.transactions, newTransaction]
      const newState = { transactions: newTransactions, balance: newBalance }
      get().saveToStorage(newState)
      return newState
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === id)
      if (!tx) return state
      const newBalance = state.balance - (tx.type === 'income' ? tx.amount : -tx.amount)
      const newTransactions = state.transactions.filter((t) => t.id !== id)
      const newState = { transactions: newTransactions, balance: newBalance }
      get().saveToStorage(newState)
      return newState
    })
  },

  setWeeklyTiktokIncome: (amount) => {
    set((state) => {
      const newTransaction: Transaction = {
        id: `tiktok-${Date.now()}`,
        type: 'income',
        category: 'TikTok Shop',
        amount,
        description: 'Rendimento semanal TikTok Shop',
        date: new Date().toISOString().split('T')[0],
        processed: true,
      }
      const newBalance = state.balance + amount
      const newTransactions = [...state.transactions, newTransaction]
      const newState = { transactions: newTransactions, balance: newBalance }
      get().saveToStorage(newState)
      return newState
    })
  },
}))

export default useFinanceStore
