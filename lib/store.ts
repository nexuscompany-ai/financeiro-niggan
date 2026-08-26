import { create } from 'zustand'

export type TransactionType = 'income' | 'expense' | 'investment'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  fromCategory?: string
  creditCard?: string
}

export interface CreditCardPurchase {
  id: string
  card: 'C6' | 'Nubank'
  description: string
  totalAmount: number
  installments: number
  currentInstallment: number
  monthlyAmount: number
  startDate: string
  category: string
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
  creditCardPurchases: CreditCardPurchase[]
  patrimony: Patrimony[]
  goals: Goal[]
  syncing: boolean
  lastSync: string | null

  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void
  addCreditCardPurchase: (p: Omit<CreditCardPurchase, 'id'>) => void
  removeCreditCardPurchase: (id: string) => void
  updatePatrimony: (account: string, balance: number) => void
  updateGoal: (month: string, actual: number) => void

  getBalance: () => number
  getToday: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getLast7Days: () => { income: number; expense: number; transactions: Transaction[] }
  getThisMonth: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getByCategory: (days?: number) => Record<string, number>
  getInsights: () => { dailyAverage: number; projectedMonthly: number; mostSpentCategory: string; biggestExpense: Transaction | null }
  getTotalPatrimony: () => number
  getCreditCardTotal: (card: 'C6' | 'Nubank') => number

  load: () => Promise<void>
  save: (state: any) => Promise<void>
}

const INITIAL_PATRIMONY: Patrimony[] = [
  { account: 'Conta corrente', balance: 161.14 },
  { account: 'C6 Investimentos', balance: 11023.85 },
  { account: 'Mercado Pago', balance: 0 },
  { account: 'Outros', balance: 0 },
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

const INITIAL_TRANSACTIONS: Transaction[] = [
  {id:"ago-1",type:"income",category:"Outras receitas",amount:60,description:"PIX Felipe Almeida de Sousa",date:"2026-08-01"},
  {id:"ago-2",type:"income",category:"Outras receitas",amount:75.98,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-01"},
  {id:"ago-3",type:"income",category:"Outras receitas",amount:960.10,description:"PIX Felipe Almeida de Sousa",date:"2026-08-04"},
  {id:"ago-4",type:"income",category:"TikTok Shop",amount:101.91,description:"Bytedance Brasil - TikTok Shop",date:"2026-08-05"},
  {id:"ago-5",type:"income",category:"Outras receitas",amount:50,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-07"},
  {id:"ago-6",type:"income",category:"TikTok Shop",amount:237.13,description:"Bytedance Brasil - TikTok Shop",date:"2026-08-12"},
  {id:"ago-7",type:"income",category:"Outras receitas",amount:100,description:"PIX Felipe Almeida de Sousa",date:"2026-08-14"},
  {id:"ago-8",type:"income",category:"Contratos FGN",amount:893.06,description:"Contrato FGN",date:"2026-08-17"},
  {id:"ago-9",type:"income",category:"TikTok Shop",amount:386.80,description:"Bytedance Brasil - TikTok Shop",date:"2026-08-19"},
  {id:"ago-10",type:"income",category:"Outras receitas",amount:568.58,description:"PIX Felipe Almeida de Sousa",date:"2026-08-19"},
  {id:"ago-11",type:"expense",category:"Combustível",amount:151.96,description:"Posto Portal Estrela D Barueri",date:"2026-08-01"},
  {id:"ago-12",type:"expense",category:"Outras despesas",amount:11.98,description:"Ferreira Aoki Osasco",date:"2026-08-02"},
  {id:"ago-13",type:"investment",category:"CDB / Reserva",amount:540,description:"CDB C6 Lim. Garant.",date:"2026-08-04",fromCategory:"Outras receitas"},
  {id:"ago-14",type:"expense",category:"Assinaturas",amount:18,description:"Luciana Aparecida Cruz Barueri",date:"2026-08-05"},
  {id:"ago-15",type:"expense",category:"Combustível",amount:123.80,description:"Auto Posto do Golf Jandira",date:"2026-08-06"},
  {id:"ago-16",type:"expense",category:"Outras despesas",amount:8,description:"Mobilicidade Tecnologia",date:"2026-08-07"},
  {id:"ago-17",type:"expense",category:"Alimentação",amount:58.90,description:"Aromeu Barueri",date:"2026-08-07"},
  {id:"ago-18",type:"expense",category:"Lazer",amount:20.05,description:"Outback Alphaville",date:"2026-08-07"},
  {id:"ago-19",type:"expense",category:"Lazer",amount:176.74,description:"Outback Alphaville",date:"2026-08-07"},
  {id:"ago-20",type:"expense",category:"Combustível",amount:50.39,description:"Posto Portal Estrela D Barueri",date:"2026-08-08"},
  {id:"ago-21",type:"expense",category:"Outras despesas",amount:60,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-10"},
  {id:"ago-22",type:"expense",category:"Outras despesas",amount:110,description:"PIX Vinicius Loyola Batista",date:"2026-08-15"},
  {id:"ago-23",type:"expense",category:"Alimentação",amount:15.98,description:"Supermercado Fátima Jandira",date:"2026-08-15"},
  {id:"ago-24",type:"expense",category:"Lazer",amount:20,description:"Festpay Payments São Paulo",date:"2026-08-15"},
  {id:"ago-25",type:"expense",category:"Outras despesas",amount:65,description:"PIX Julia Marques Pereira Lima",date:"2026-08-17"},
  {id:"ago-26",type:"expense",category:"Alimentação",amount:19,description:"Café Yeshua Barueri",date:"2026-08-17"},
  {id:"ago-27",type:"investment",category:"CDB / Reserva",amount:540,description:"CDB C6 Lim. Garant.",date:"2026-08-17",fromCategory:"Contratos FGN"},
  {id:"ago-28",type:"expense",category:"Outras despesas",amount:95,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-18"},
  {id:"ago-29",type:"investment",category:"CDB / Reserva",amount:468,description:"CDB C6 Lim. Garant.",date:"2026-08-19",fromCategory:"Outras receitas"},
]

const INITIAL_CC: CreditCardPurchase[] = [
  {id:"cc-1",card:"C6",description:"Fatura C6 atual",totalAmount:310.64,installments:1,currentInstallment:1,monthlyAmount:310.64,startDate:"2026-08-01",category:"Cartão de Crédito"},
]

function startOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]
}

// Usa API route server-side (mais confiável que chamar Supabase direto do browser)
async function fetchData() {
  try {
    const res = await fetch('/api/sync')
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch { return null }
}

async function saveData(data: any) {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
  } catch {}
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  creditCardPurchases: [],
  patrimony: INITIAL_PATRIMONY,
  goals: INITIAL_GOALS,
  syncing: false,
  lastSync: null,

  load: async () => {
    if (typeof window === 'undefined') return
    set({ syncing: true })

    // 1. Tenta buscar do servidor (Supabase via API route)
    const remote = await fetchData()

    if (remote && remote.transactions && remote.transactions.length > 0) {
      set({
        transactions: remote.transactions,
        creditCardPurchases: remote.creditCardPurchases ?? INITIAL_CC,
        patrimony: remote.patrimony ?? INITIAL_PATRIMONY,
        goals: remote.goals ?? INITIAL_GOALS,
        syncing: false,
        lastSync: new Date().toISOString(),
      })
      // Cache local para offline
      localStorage.setItem('niggan-cache', JSON.stringify(remote))
      return
    }

    // 2. Fallback: cache local
    try {
      const cached = localStorage.getItem('niggan-cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.transactions && data.transactions.length > 0) {
          set({
            transactions: data.transactions,
            creditCardPurchases: data.creditCardPurchases ?? INITIAL_CC,
            patrimony: data.patrimony ?? INITIAL_PATRIMONY,
            goals: data.goals ?? INITIAL_GOALS,
            syncing: false,
          })
          // Sobe para o servidor
          await saveData(data)
          return
        }
      }
    } catch {}

    // 3. Dados iniciais do código
    const initial = {
      transactions: INITIAL_TRANSACTIONS,
      creditCardPurchases: INITIAL_CC,
      patrimony: INITIAL_PATRIMONY,
      goals: INITIAL_GOALS,
    }
    set({ ...initial, syncing: false })
    localStorage.setItem('niggan-cache', JSON.stringify(initial))
    await saveData(initial)
  },

  save: async (data) => {
    if (typeof window === 'undefined') return
    // 1. Salva local imediato (UX rápida)
    localStorage.setItem('niggan-cache', JSON.stringify(data))
    // 2. Sobe para servidor em background
    saveData(data)
  },

  addTransaction: (tx) => {
    set((state) => {
      const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).substr(2,5)}` }
      const newTxs = [newTx, ...state.transactions]
      const ns = { transactions: newTxs, creditCardPurchases: state.creditCardPurchases, patrimony: state.patrimony, goals: state.goals }
      get().save(ns)
      return { transactions: newTxs }
    })
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const newTxs = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      const ns = { transactions: newTxs, creditCardPurchases: state.creditCardPurchases, patrimony: state.patrimony, goals: state.goals }
      get().save(ns)
      return { transactions: newTxs }
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const newTxs = state.transactions.filter(t => t.id !== id)
      const ns = { transactions: newTxs, creditCardPurchases: state.creditCardPurchases, patrimony: state.patrimony, goals: state.goals }
      get().save(ns)
      return { transactions: newTxs }
    })
  },

  addCreditCardPurchase: (p) => {
    set((state) => {
      const newP: CreditCardPurchase = { ...p, id: `cc-${Date.now()}` }
      const newCCs = [...state.creditCardPurchases, newP]
      const ns = { transactions: state.transactions, creditCardPurchases: newCCs, patrimony: state.patrimony, goals: state.goals }
      get().save(ns)
      return { creditCardPurchases: newCCs }
    })
  },

  removeCreditCardPurchase: (id) => {
    set((state) => {
      const newCCs = state.creditCardPurchases.filter(p => p.id !== id)
      const ns = { transactions: state.transactions, creditCardPurchases: newCCs, patrimony: state.patrimony, goals: state.goals }
      get().save(ns)
      return { creditCardPurchases: newCCs }
    })
  },

  updatePatrimony: (account, balance) => {
    set((state) => {
      const newPat = state.patrimony.map(p => p.account === account ? { ...p, balance } : p)
      const ns = { transactions: state.transactions, creditCardPurchases: state.creditCardPurchases, patrimony: newPat, goals: state.goals }
      get().save(ns)
      return { patrimony: newPat }
    })
  },

  updateGoal: (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map(g => g.month === month ? { ...g, actual } : g)
      const ns = { transactions: state.transactions, creditCardPurchases: state.creditCardPurchases, patrimony: state.patrimony, goals: newGoals }
      get().save(ns)
      return { goals: newGoals }
    })
  },

  getBalance: () => {
    const month = get().getThisMonth()
    return month.income - month.expense - month.investment
  },

  getTotalPatrimony: () => get().patrimony.reduce((s,p) => s + p.balance, 0),

  getCreditCardTotal: (card) =>
    get().creditCardPurchases.filter(p => p.card === card).reduce((s,p) => s + p.monthlyAmount, 0),

  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter(t => t.date === today)
    return {
      income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getLast7Days: () => {
    const start = daysAgo(7)
    const txs = get().transactions.filter(t => t.date >= start)
    return {
      income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getThisMonth: () => {
    const start = startOfMonth()
    const txs = get().transactions.filter(t => t.date >= start)
    return {
      income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getByCategory: (days=30) => {
    const start = daysAgo(days)
    const txs = get().transactions.filter(t => t.type==='expense' && t.date>=start)
    const result: Record<string,number> = {}
    txs.forEach(t => { result[t.category] = (result[t.category]||0) + t.amount })
    return result
  },

  getInsights: () => {
    const start = startOfMonth()
    const txs = get().transactions.filter(t => t.date >= start)
    const expenses = txs.filter(t=>t.type==='expense')
    const total = expenses.reduce((s,t)=>s+t.amount,0)
    const now = new Date()
    const daysGone = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
    const dailyAverage = daysGone > 0 ? total / daysGone : 0
    const byCategory: Record<string,number> = {}
    expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category]||0) + t.amount })
    const mostSpentCategory = Object.entries(byCategory).sort(([,a],[,b])=>b-a)[0]?.[0] ?? '-'
    const biggestExpense = expenses.length>0 ? expenses.reduce((m,t)=>t.amount>m.amount?t:m,expenses[0]) : null
    return { dailyAverage, projectedMonthly: dailyAverage * daysInMonth, mostSpentCategory, biggestExpense }
  },
}))

export default useFinanceStore
