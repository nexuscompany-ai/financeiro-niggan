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
  startDate: string   // "YYYY-MM"
  category: string
}

// Conta fixa (recorrente) ou avulsa
export interface Bill {
  id: string
  description: string
  amount: number
  dueDay: number          // dia do mês
  category: string
  recurring: boolean      // true = todo mês
  active: boolean
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
  bills: Bill[]
  patrimony: Patrimony[]
  goals: Goal[]
  syncing: boolean
  lastSync: string | null

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void

  // Credit cards
  addCreditCardPurchase: (p: Omit<CreditCardPurchase, 'id'>) => void
  updateCreditCardPurchase: (id: string, updates: Partial<Omit<CreditCardPurchase, 'id'>>) => void
  removeCreditCardPurchase: (id: string) => void
  advanceInstallment: () => void   // chamado todo mês

  // Bills
  addBill: (b: Omit<Bill, 'id'>) => void
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id'>>) => void
  removeBill: (id: string) => void

  // Patrimony & Goals
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
  getCreditCardTotal: (card: 'C6' | 'Nubank') => number
  getActiveBills: () => Bill[]

  // Sync
  load: () => Promise<void>
  save: (state: any) => Promise<void>
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_PATRIMONY: Patrimony[] = [
  { account: 'Conta corrente',   balance: 161.14  },
  { account: 'C6 Investimentos', balance: 11023.85 },
  { account: 'Mercado Pago',     balance: 0        },
  { account: 'Outros',           balance: 0        },
]

const INITIAL_GOALS: Goal[] = [
  { month: 'Ago/2026', target: 3000,  actual: null },
  { month: 'Set/2026', target: 6000,  actual: null },
  { month: 'Out/2026', target: 9000,  actual: null },
  { month: 'Nov/2026', target: 12000, actual: null },
  { month: 'Dez/2026', target: 15000, actual: null },
  { month: 'Jan/2027', target: 18000, actual: null },
  { month: 'Fev/2027', target: 21000, actual: null },
  { month: 'Mar/2027', target: 24000, actual: null },
  { month: 'Abr/2027', target: 27000, actual: null },
  { month: 'Mai/2027', target: 30000, actual: null },
]

// Contas fixas reais - sem "Seguro Conta C6"
const INITIAL_BILLS: Bill[] = [
  { id:'bill-1', description:'Internet VIVO',    amount:65.33, dueDay:20, category:'Internet',     recurring:true, active:true },
  { id:'bill-2', description:'Spotify',           amount:23.90, dueDay:26, category:'Assinatura',  recurring:true, active:true },
  { id:'bill-3', description:'Combustível (est.)',amount:150.00,dueDay:10, category:'Combustível',  recurring:true, active:true },
  { id:'bill-4', description:'Corte de cabelo',   amount:65.00, dueDay:15, category:'Pessoal',      recurring:true, active:true },
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  {id:"ago-1", type:"income",     category:"Outras receitas",  amount:60,     description:"PIX Felipe Almeida de Sousa",      date:"2026-08-01"},
  {id:"ago-2", type:"income",     category:"Outras receitas",  amount:75.98,  description:"PIX Gabriel Almeida de Sousa",     date:"2026-08-01"},
  {id:"ago-3", type:"income",     category:"Outras receitas",  amount:960.10, description:"PIX Felipe Almeida de Sousa",      date:"2026-08-04"},
  {id:"ago-4", type:"income",     category:"TikTok Shop",      amount:101.91, description:"Bytedance Brasil - TikTok Shop",   date:"2026-08-05"},
  {id:"ago-5", type:"income",     category:"Outras receitas",  amount:50,     description:"PIX Gabriel Almeida de Sousa",    date:"2026-08-07"},
  {id:"ago-6", type:"income",     category:"TikTok Shop",      amount:237.13, description:"Bytedance Brasil - TikTok Shop",   date:"2026-08-12"},
  {id:"ago-7", type:"income",     category:"Outras receitas",  amount:100,    description:"PIX Felipe Almeida de Sousa",      date:"2026-08-14"},
  {id:"ago-8", type:"income",     category:"Contratos FGL",    amount:893.06, description:"Contrato FGL",                    date:"2026-08-17"},
  {id:"ago-9", type:"income",     category:"TikTok Shop",      amount:386.80, description:"Bytedance Brasil - TikTok Shop",   date:"2026-08-19"},
  {id:"ago-10",type:"income",     category:"Outras receitas",  amount:568.58, description:"PIX Felipe Almeida de Sousa",      date:"2026-08-19"},
  {id:"ago-11",type:"expense",    category:"Combustível",      amount:151.96, description:"Posto Portal Estrela D Barueri",   date:"2026-08-01"},
  {id:"ago-12",type:"expense",    category:"Outras despesas",  amount:11.98,  description:"Ferreira Aoki Osasco",             date:"2026-08-02"},
  {id:"ago-13",type:"investment", category:"CDB / Reserva",    amount:540,    description:"CDB C6 Lim. Garant.",              date:"2026-08-04", fromCategory:"Outras receitas"},
  {id:"ago-14",type:"expense",    category:"Assinaturas",      amount:18,     description:"Luciana Aparecida Cruz Barueri",   date:"2026-08-05"},
  {id:"ago-15",type:"expense",    category:"Combustível",      amount:123.80, description:"Auto Posto do Golf Jandira",       date:"2026-08-06"},
  {id:"ago-16",type:"expense",    category:"Outras despesas",  amount:8,      description:"Mobilicidade Tecnologia",          date:"2026-08-07"},
  {id:"ago-17",type:"expense",    category:"Alimentação",      amount:58.90,  description:"Aromeu Barueri",                   date:"2026-08-07"},
  {id:"ago-18",type:"expense",    category:"Lazer",            amount:20.05,  description:"Outback Alphaville",              date:"2026-08-07"},
  {id:"ago-19",type:"expense",    category:"Lazer",            amount:176.74, description:"Outback Alphaville",              date:"2026-08-07"},
  {id:"ago-20",type:"expense",    category:"Combustível",      amount:50.39,  description:"Posto Portal Estrela D Barueri",   date:"2026-08-08"},
  {id:"ago-21",type:"expense",    category:"Outras despesas",  amount:60,     description:"PIX Gabriel Almeida de Sousa",    date:"2026-08-10"},
  {id:"ago-22",type:"expense",    category:"Outras despesas",  amount:110,    description:"PIX Vinicius Loyola Batista",      date:"2026-08-15"},
  {id:"ago-23",type:"expense",    category:"Alimentação",      amount:15.98,  description:"Supermercado Fátima Jandira",      date:"2026-08-15"},
  {id:"ago-24",type:"expense",    category:"Lazer",            amount:20,     description:"Festpay Payments São Paulo",       date:"2026-08-15"},
  {id:"ago-25",type:"expense",    category:"Outras despesas",  amount:65,     description:"PIX Julia Marques Pereira Lima",   date:"2026-08-17"},
  {id:"ago-26",type:"expense",    category:"Alimentação",      amount:19,     description:"Café Yeshua Barueri",             date:"2026-08-17"},
  {id:"ago-27",type:"investment", category:"CDB / Reserva",    amount:540,    description:"CDB C6 Lim. Garant.",              date:"2026-08-17", fromCategory:"Contratos FGL"},
  {id:"ago-28",type:"expense",    category:"Outras despesas",  amount:95,     description:"PIX Gabriel Almeida de Sousa",    date:"2026-08-18"},
  {id:"ago-29",type:"investment", category:"CDB / Reserva",    amount:468,    description:"CDB C6 Lim. Garant.",              date:"2026-08-19", fromCategory:"Outras receitas"},
]

const INITIAL_CC: CreditCardPurchase[] = [
  {
    id:"cc-1", card:"C6", description:"Fatura C6 atual",
    totalAmount:310.64, installments:1, currentInstallment:1,
    monthlyAmount:310.64, startDate:"2026-08", category:"Cartão de Crédito"
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]
}
function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

// ─── Supabase sync ────────────────────────────────────────────────────────────

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

// ─── Store ────────────────────────────────────────────────────────────────────

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  creditCardPurchases: [],
  bills: [],
  patrimony: INITIAL_PATRIMONY,
  goals: INITIAL_GOALS,
  syncing: false,
  lastSync: null,

  // ── Sync ──────────────────────────────────────────────────────────────────
  load: async () => {
    if (typeof window === 'undefined') return
    set({ syncing: true })

    const remote = await fetchData()
    if (remote && remote.transactions && remote.transactions.length > 0) {
      set({
        transactions:        remote.transactions,
        creditCardPurchases: remote.creditCardPurchases ?? INITIAL_CC,
        bills:               remote.bills               ?? INITIAL_BILLS,
        patrimony:           remote.patrimony            ?? INITIAL_PATRIMONY,
        goals:               remote.goals                ?? INITIAL_GOALS,
        syncing: false,
        lastSync: new Date().toISOString(),
      })
      localStorage.setItem('niggan-cache', JSON.stringify(remote))
      return
    }

    try {
      const cached = localStorage.getItem('niggan-cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.transactions?.length > 0) {
          set({
            transactions:        data.transactions,
            creditCardPurchases: data.creditCardPurchases ?? INITIAL_CC,
            bills:               data.bills               ?? INITIAL_BILLS,
            patrimony:           data.patrimony            ?? INITIAL_PATRIMONY,
            goals:               data.goals                ?? INITIAL_GOALS,
            syncing: false,
          })
          await saveData(data)
          return
        }
      }
    } catch {}

    const initial = {
      transactions: INITIAL_TRANSACTIONS,
      creditCardPurchases: INITIAL_CC,
      bills: INITIAL_BILLS,
      patrimony: INITIAL_PATRIMONY,
      goals: INITIAL_GOALS,
    }
    set({ ...initial, syncing: false })
    localStorage.setItem('niggan-cache', JSON.stringify(initial))
    await saveData(initial)
  },

  save: async (data) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('niggan-cache', JSON.stringify(data))
    saveData(data)
  },

  // ── Helpers save ──────────────────────────────────────────────────────────
  _ns: (state: any, extra?: any) => ({
    transactions:        state.transactions,
    creditCardPurchases: state.creditCardPurchases,
    bills:               state.bills,
    patrimony:           state.patrimony,
    goals:               state.goals,
    ...extra,
  }),

  // ── Transactions ──────────────────────────────────────────────────────────
  addTransaction: (tx) => {
    set((state) => {
      const newTx: Transaction = { ...tx, id:`tx-${Date.now()}-${Math.random().toString(36).substr(2,5)}` }
      const newTxs = [newTx, ...state.transactions]
      const ns = { transactions:newTxs, creditCardPurchases:state.creditCardPurchases, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { transactions: newTxs }
    })
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const newTxs = state.transactions.map(t => t.id===id ? {...t,...updates} : t)
      const ns = { transactions:newTxs, creditCardPurchases:state.creditCardPurchases, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { transactions: newTxs }
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const newTxs = state.transactions.filter(t => t.id!==id)
      const ns = { transactions:newTxs, creditCardPurchases:state.creditCardPurchases, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { transactions: newTxs }
    })
  },

  // ── Credit cards ──────────────────────────────────────────────────────────
  addCreditCardPurchase: (p) => {
    set((state) => {
      const newP: CreditCardPurchase = { ...p, id:`cc-${Date.now()}` }
      const newCCs = [...state.creditCardPurchases, newP]
      const ns = { transactions:state.transactions, creditCardPurchases:newCCs, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { creditCardPurchases: newCCs }
    })
  },

  updateCreditCardPurchase: (id, updates) => {
    set((state) => {
      const newCCs = state.creditCardPurchases.map(p => p.id===id ? {...p,...updates} : p)
      const ns = { transactions:state.transactions, creditCardPurchases:newCCs, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { creditCardPurchases: newCCs }
    })
  },

  removeCreditCardPurchase: (id) => {
    set((state) => {
      const newCCs = state.creditCardPurchases.filter(p => p.id!==id)
      const ns = { transactions:state.transactions, creditCardPurchases:newCCs, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { creditCardPurchases: newCCs }
    })
  },

  // Avança parcelas no início do mês (parcelas que acabaram são removidas)
  advanceInstallment: () => {
    set((state) => {
      const ym = currentYearMonth()
      const newCCs = state.creditCardPurchases
        .map(p => {
          if (p.startDate === ym) return p            // ainda no mês de início, não avança
          if (p.installments <= 1) return p            // à vista, não avança
          const next = p.currentInstallment + 1
          if (next > p.installments) return null       // terminou
          return { ...p, currentInstallment: next }
        })
        .filter(Boolean) as CreditCardPurchase[]
      const ns = { transactions:state.transactions, creditCardPurchases:newCCs, bills:state.bills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { creditCardPurchases: newCCs }
    })
  },

  // ── Bills ─────────────────────────────────────────────────────────────────
  addBill: (b) => {
    set((state) => {
      const newB: Bill = { ...b, id:`bill-${Date.now()}` }
      const newBills = [...state.bills, newB]
      const ns = { transactions:state.transactions, creditCardPurchases:state.creditCardPurchases, bills:newBills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { bills: newBills }
    })
  },

  updateBill: (id, updates) => {
    set((state) => {
      const newBills = state.bills.map(b => b.id===id ? {...b,...updates} : b)
      const ns = { transactions:state.transactions, creditCardPurchases:state.creditCardPurchases, bills:newBills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { bills: newBills }
    })
  },

  removeBill: (id) => {
    set((state) => {
      const newBills = state.bills.filter(b => b.id!==id)
      const ns = { transactions:state.transactions, creditCardPurchases:state.creditCardPurchases, bills:newBills, patrimony:state.patrimony, goals:state.goals }
      get().save(ns); return { bills: newBills }
    })
  },

  // ── Patrimony & Goals ─────────────────────────────────────────────────────
  updatePatrimony: (account, balance) => {
    set((state) => {
      const newPat = state.patrimony.map(p => p.account===account ? {...p,balance} : p)
      const ns = { transactions:state.transactions, creditCardPurchases:state.creditCardPurchases, bills:state.bills, patrimony:newPat, goals:state.goals }
      get().save(ns); return { patrimony: newPat }
    })
  },

  updateGoal: (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map(g => g.month===month ? {...g,actual} : g)
      const ns = { transactions:state.transactions, creditCardPurchases:state.creditCardPurchases, bills:state.bills, patrimony:state.patrimony, goals:newGoals }
      get().save(ns); return { goals: newGoals }
    })
  },

  // ── Computed ──────────────────────────────────────────────────────────────
  getBalance: () => {
    const m = get().getThisMonth()
    return m.income - m.expense - m.investment
  },

  getTotalPatrimony: () => get().patrimony.reduce((s,p)=>s+p.balance,0),

  getCreditCardTotal: (card) =>
    get().creditCardPurchases.filter(p=>p.card===card).reduce((s,p)=>s+p.monthlyAmount,0),

  getActiveBills: () => get().bills.filter(b=>b.active),

  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter(t=>t.date===today)
    return {
      income:     txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense:    txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getLast7Days: () => {
    const start = daysAgo(7)
    const txs = get().transactions.filter(t=>t.date>=start)
    return {
      income:  txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getThisMonth: () => {
    const start = startOfMonth()
    const txs = get().transactions.filter(t=>t.date>=start)
    return {
      income:     txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense:    txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getByCategory: (days=30) => {
    const start = daysAgo(days)
    const txs = get().transactions.filter(t=>t.type==='expense'&&t.date>=start)
    const result: Record<string,number> = {}
    txs.forEach(t=>{ result[t.category]=(result[t.category]||0)+t.amount })
    return result
  },

  getInsights: () => {
    const start = startOfMonth()
    const txs = get().transactions.filter(t=>t.date>=start)
    const expenses = txs.filter(t=>t.type==='expense')
    const total = expenses.reduce((s,t)=>s+t.amount,0)
    const now = new Date()
    const daysGone = now.getDate()
    const daysInMonth = new Date(now.getFullYear(),now.getMonth()+1,0).getDate()
    const dailyAverage = daysGone>0 ? total/daysGone : 0
    const byCategory: Record<string,number> = {}
    expenses.forEach(t=>{ byCategory[t.category]=(byCategory[t.category]||0)+t.amount })
    const mostSpentCategory = Object.entries(byCategory).sort(([,a],[,b])=>b-a)[0]?.[0]??'-'
    const biggestExpense = expenses.length>0 ? expenses.reduce((m,t)=>t.amount>m.amount?t:m,expenses[0]) : null
    return { dailyAverage, projectedMonthly:dailyAverage*daysInMonth, mostSpentCategory, biggestExpense }
  },
}))

export default useFinanceStore
