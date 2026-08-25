import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  processed: boolean
}

export interface DailyBalance {
  date: string
  balance: number
  income: number
  expense: number
}

export interface FinanceState {
  transactions: Transaction[]
  balance: number
  weeklyTiktokIncome: number
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, tx: Partial<Transaction>) => void
  getBalance: () => number
  getDailyBalance: (date: string) => DailyBalance
  getMonthlyBalance: (month: number, year: number) => DailyBalance
  setWeeklyTiktokIncome: (amount: number) => void
}

const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      balance: 0,
      weeklyTiktokIncome: 0,

      addTransaction: (tx) => {
        set((state) => {
          const newId = `tx-${Date.now()}`
          const newTransaction = { ...tx, id: newId } as Transaction
          const newBalance = state.balance + (tx.type === 'income' ? tx.amount : -tx.amount)
          
          return {
            transactions: [...state.transactions, newTransaction],
            balance: newBalance,
          }
        })
      },

      removeTransaction: (id) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id)
          if (!tx) return state
          
          const newBalance = state.balance - (tx.type === 'income' ? tx.amount : -tx.amount)
          
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            balance: newBalance,
          }
        })
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const oldTx = state.transactions.find((t) => t.id === id)
          if (!oldTx) return state

          const newTx = { ...oldTx, ...updates }
          const oldImpact = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount
          const newImpact = newTx.type === 'income' ? newTx.amount : -newTx.amount
          const balanceDiff = newImpact - oldImpact

          return {
            transactions: state.transactions.map((t) => (t.id === id ? newTx : t)),
            balance: state.balance + balanceDiff,
          }
        })
      },

      getBalance: () => get().balance,

      getDailyBalance: (date) => {
        const state = get()
        const dayTransactions = state.transactions.filter((t) => t.date === date)
        const income = dayTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = dayTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          date,
          balance: income - expense,
          income,
          expense,
        }
      },

      getMonthlyBalance: (month, year) => {
        const state = get()
        const monthTransactions = state.transactions.filter((t) => {
          const date = new Date(t.date)
          return date.getMonth() === month && date.getFullYear() === year
        })

        const income = monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          date: `${month + 1}/${year}`,
          balance: income - expense,
          income,
          expense,
        }
      },

      setWeeklyTiktokIncome: (amount) => {
        set((state) => ({
          weeklyTiktokIncome: amount,
          balance: state.balance + amount,
          transactions: [
            ...state.transactions,
            {
              id: `tiktok-${Date.now()}`,
              type: 'income',
              category: 'TikTok Shop',
              amount,
              description: 'Rendimento semanal TikTok Shop',
              date: new Date().toISOString().split('T')[0],
              processed: true,
            },
          ],
        }))
      },
    }),
    {
      name: 'niggan-finances-store',
      version: 1,
    }
  )
)

export default useFinanceStore
