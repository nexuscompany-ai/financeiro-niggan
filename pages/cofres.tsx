import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency, CATEGORY_EMOJI } from '@/lib/utils'

type Period = '7d' | '30d' | '90d' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 dias',
  '30d': 'Este mês',
  '90d': '90 dias',
  'all': 'Tudo',
}

const COFRE_CATEGORIES = [
  'Salário FGL Brasil',
  'Contratos / Instalações',
  'TikTok Shop',
  'Outras receitas',
  'Entrada',
]

const COFRE_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  'Salário FGL Brasil':    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   bar: 'bg-blue-500' },
  'Contratos / Instalações': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', bar: 'bg-orange-500' },
  'TikTok Shop':           { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-800',   bar: 'bg-pink-500' },
  'Outras receitas':       { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', bar: 'bg-purple-500' },
  'Entrada':               { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  bar: 'bg-green-500' },
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function startOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

export default function Cofres() {
  const transactions = useFinanceStore(s => s.transactions)
  const [hidden, setHidden] = useState(false)
  const [expandedCofre, setExpandedCofre] = useState<string | null>(null)
  const [periods, setPeriods] = useState<Record<string, Period>>({})

  const getPeriod = (cat: string): Period => periods[cat] || '30d'
  const setPeriod = (cat: string, p: Period) => setPeriods(prev => ({ ...prev, [cat]: p }))

  const filterByPeriod = (txs: typeof transactions, period: Period) => {
    if (period === 'all') return txs
    if (period === '7d') return txs.filter(t => t.date >= daysAgo(7))
    if (period === '30d') return txs.filter(t => t.date >= startOfMonth())
    if (period === '90d') return txs.filter(t => t.date >= daysAgo(90))
    return txs
  }

  // Para cada cofre, calcular total e transações
  const cofresData = useMemo(() => {
    return COFRE_CATEGORIES.map(cat => {
      // "Entrada" agrupa todas as income que não têm categoria específica
      const catTxs = transactions.filter(t => {
        if (t.type !== 'income') return false
        if (cat === 'Entrada') {
          return !COFRE_CATEGORIES.filter(c => c !== 'Entrada').includes(t.category)
        }
        return t.category === cat
      })

      const totalAll = catTxs.reduce((s, t) => s + t.amount, 0)
      const period = getPeriod(cat)
      const filtered = filterByPeriod(catTxs, period)
      const total = filtered.reduce((s, t) => s + t.amount, 0)
      const count = filtered.length

      return { cat, total, totalAll, count, transactions: filtered.sort((a,b) => b.date.localeCompare(a.date)) }
    })
  }, [transactions, periods])

  const totalGeral = cofresData.reduce((s, c) => s + c.totalAll, 0)
  const color = (cat: string) => COFRE_COLORS[cat] || COFRE_COLORS['Entrada']

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl text-neutral-500">←</Link>
            <div>
              <h1 className="text-xl font-bold text-olive-900">Cofres 🏦</h1>
              <p className="text-xs text-neutral-400">Entradas por origem</p>
            </div>
          </div>
          <button onClick={() => setHidden(h => !h)}
            className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base active:bg-neutral-200">
            {hidden ? '👁️' : '🙈'}
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-12">
        {/* Total Geral */}
        <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white mb-5">
          <p className="text-xs opacity-60 mb-1">Total em todos os cofres</p>
          <p className="text-3xl font-bold">
            {hidden ? '••••••' : formatCurrency(totalGeral)}
          </p>
          <p className="text-xs opacity-50 mt-2">{transactions.filter(t => t.type === 'income').length} entradas registradas</p>
        </div>

        {/* Cofres */}
        <div className="space-y-3">
          {cofresData.map(({ cat, total, totalAll, count, transactions: txs }) => {
            const isOpen = expandedCofre === cat
            const period = getPeriod(cat)
            const c = color(cat)
            const pct = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0

            return (
              <div key={cat} className={`bg-white border rounded-2xl overflow-hidden transition-all ${c.border}`}>
                {/* Cabeçalho do cofre */}
                <div
                  onClick={() => setExpandedCofre(isOpen ? null : cat)}
                  className="p-4 cursor-pointer active:bg-neutral-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {cat === 'Entrada' ? '💵' : CATEGORY_EMOJI[cat] || '💰'}
                      </span>
                      <div>
                        <p className={`text-sm font-bold ${c.text}`}>{cat}</p>
                        <p className="text-xs text-neutral-400">{count} transação{count !== 1 ? 'ões' : ''} · {PERIOD_LABELS[period]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">
                        {hidden ? '••••' : formatCurrency(total)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {hidden ? '••••' : `total: ${formatCurrency(totalAll)}`}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso do período */}
                  <div className="w-full bg-neutral-100 rounded-full h-1.5">
                    <div className={`${c.bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-neutral-400">{PERIOD_LABELS[period]}</p>
                    <p className="text-xs text-neutral-400">{pct}% do total</p>
                  </div>
                </div>

                {/* Expandido */}
                {isOpen && (
                  <div className="border-t border-neutral-100">
                    {/* Filtros de período */}
                    <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                        <button key={p}
                          onClick={e => { e.stopPropagation(); setPeriod(cat, p) }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${period === p ? `${c.bar} text-white` : 'bg-neutral-100 text-neutral-500'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Lista de transações */}
                    {txs.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-2xl mb-1">📭</p>
                        <p className="text-xs text-neutral-400">Nenhuma entrada neste período</p>
                      </div>
                    ) : (
                      <div className="px-4 pb-4 space-y-2">
                        {txs.map(tx => (
                          <div key={tx.id} className={`${c.bg} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-sm font-medium text-neutral-800 truncate">{tx.description}</p>
                              <p className="text-xs text-neutral-400">
                                {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                              </p>
                            </div>
                            <p className={`text-sm font-bold flex-shrink-0 ${c.text}`}>
                              {hidden ? '••••' : `+${formatCurrency(tx.amount)}`}
                            </p>
                          </div>
                        ))}

                        {/* Subtotal do período */}
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                          <p className="text-xs font-bold text-neutral-500 uppercase">Total {PERIOD_LABELS[period]}</p>
                          <p className={`text-base font-bold ${c.text}`}>
                            {hidden ? '••••••' : formatCurrency(total)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
