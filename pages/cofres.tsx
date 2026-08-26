import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency, CATEGORY_EMOJI } from '@/lib/utils'

type Period = 'month' | '7d' | '90d' | 'all'
const PERIOD_LABELS: Record<Period, string> = { 'month':'Este mês','7d':'7 dias','90d':'90 dias','all':'Histórico' }

// Apenas os cofres relevantes (removido "Outras receitas" e "Entrada")
const COFRES = [
  { key: 'Salário FGL Brasil', emoji: '💼', color: { bg:'bg-blue-50', border:'border-blue-200', text:'text-blue-800', bar:'bg-blue-500' } },
  { key: 'Contratos / Instalações', emoji: '🔧', color: { bg:'bg-orange-50', border:'border-orange-200', text:'text-orange-800', bar:'bg-orange-500' } },
  { key: 'TikTok Shop', emoji: '🎵', color: { bg:'bg-pink-50', border:'border-pink-200', text:'text-pink-800', bar:'bg-pink-500' } },
  { key: 'F7 Empresa', emoji: '🏢', color: { bg:'bg-indigo-50', border:'border-indigo-200', text:'text-indigo-800', bar:'bg-indigo-500' } },
  { key: 'Outras receitas', emoji: '💰', color: { bg:'bg-neutral-50', border:'border-neutral-200', text:'text-neutral-700', bar:'bg-neutral-400' } },
]

function getStartDate(period: Period): string {
  const now = new Date()
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  if (period === '7d') { const d = new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] }
  if (period === '90d') { const d = new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0] }
  return '2000-01-01'
}

export default function Cofres() {
  const transactions = useFinanceStore(s => s.transactions)
  const [hidden, setHidden] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [periods, setPeriods] = useState<Record<string, Period>>({})

  const getPeriod = (k: string): Period => periods[k] || 'month'
  const setPeriod = (k: string, p: Period) => setPeriods(prev => ({ ...prev, [k]: p }))
  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  // Total geral do mês (todas as categorias de entrada)
  const totalGeralMes = transactions
    .filter(t => t.type === 'income' && t.date >= startOfMonth)
    .reduce((s, t) => s + t.amount, 0)

  const cofresData = useMemo(() => {
    return COFRES.map(({ key, emoji, color }) => {
      const period = getPeriod(key)
      const start = getStartDate(period)

      const incomes = transactions
        .filter(t => t.type === 'income' && t.date >= start && t.category === key)
        .sort((a, b) => b.date.localeCompare(a.date))

      const investments = transactions
        .filter(t => t.type === 'investment' && t.date >= start && t.fromCategory === key)
        .sort((a, b) => b.date.localeCompare(a.date))

      const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
      const totalInvest = investments.reduce((s, t) => s + t.amount, 0)

      // % proporcional ao mês atual (sempre)
      const incomeThisMonth = transactions
        .filter(t => t.type === 'income' && t.date >= startOfMonth && t.category === key)
        .reduce((s, t) => s + t.amount, 0)
      const pct = totalGeralMes > 0 ? Math.min(100, Math.round((incomeThisMonth / totalGeralMes) * 100)) : 0

      return { key, emoji, color, incomes, investments, totalIncome, totalInvest, pct, period }
    })
  }, [transactions, periods])

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl text-neutral-500">←</Link>
            <div>
              <h1 className="text-xl font-bold text-olive-900">Cofres 🏦</h1>
              <p className="text-xs text-neutral-400">
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => setHidden(h => !h)}
            className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base active:bg-neutral-200">
            {hidden ? '👁️' : '🙈'}
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-12">
        {/* Total do mês */}
        <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white mb-4">
          <p className="text-xs opacity-60 mb-1">Total entrou este mês</p>
          <p className="text-3xl font-bold">{hidden ? '••••••' : formatCurrency(totalGeralMes)}</p>
          <p className="text-xs opacity-50 mt-1">
            {transactions.filter(t => t.type === 'income' && t.date >= startOfMonth).length} entradas em{' '}
            {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
          </p>
        </div>

        <div className="space-y-3">
          {cofresData.map(({ key, emoji, color, incomes, investments, totalIncome, totalInvest, pct, period }) => {
            const isOpen = expanded === key

            return (
              <div key={key} className={`bg-white border-2 ${color.border} rounded-2xl overflow-hidden`}>
                <div onClick={() => setExpanded(isOpen ? null : key)} className="p-4 cursor-pointer active:bg-neutral-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <p className={`text-sm font-bold ${color.text}`}>{key}</p>
                        <p className="text-xs text-neutral-400">
                          {incomes.length} entrada{incomes.length !== 1 ? 's' : ''} · {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">{fmt(totalIncome)}</p>
                      {totalInvest > 0 && (
                        <p className="text-xs font-medium text-blue-600">📈 {fmt(totalInvest)} invest.</p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5">
                    <div className={`${color.bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-neutral-400">{pct}% do mês</p>
                    <p className="text-xs text-neutral-400">{isOpen ? '▲ fechar' : '▼ detalhes'}</p>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-neutral-100">
                    {/* Filtros */}
                    <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                        <button key={p} onClick={e => { e.stopPropagation(); setPeriod(key, p) }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${period === p ? `${color.bar} text-white` : 'bg-neutral-100 text-neutral-500'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                      {incomes.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Entradas</p>
                          {incomes.map(tx => (
                            <div key={tx.id} className={`${color.bg} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm font-medium text-neutral-800 truncate">{tx.description}</p>
                                <p className="text-xs text-neutral-400">
                                  {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                                </p>
                              </div>
                              <p className={`text-sm font-bold ${color.text}`}>+{fmt(tx.amount)}</p>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 border-t border-neutral-100">
                            <p className="text-xs font-bold text-neutral-500">Subtotal</p>
                            <p className={`text-sm font-bold ${color.text}`}>{fmt(totalIncome)}</p>
                          </div>
                        </>
                      )}

                      {investments.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-blue-500 uppercase mt-2">📈 Investimentos</p>
                          {investments.map(tx => (
                            <div key={tx.id} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-center justify-between">
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm font-medium text-blue-800 truncate">{tx.description}</p>
                                <p className="text-xs text-blue-400">{new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}</p>
                              </div>
                              <p className="text-sm font-bold text-blue-700">📈 {fmt(tx.amount)}</p>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 border-t border-blue-100">
                            <p className="text-xs font-bold text-blue-500">Total investido</p>
                            <p className="text-sm font-bold text-blue-700">{fmt(totalInvest)}</p>
                          </div>
                        </>
                      )}

                      {incomes.length === 0 && investments.length === 0 && (
                        <div className="py-6 text-center">
                          <p className="text-2xl mb-1">📭</p>
                          <p className="text-xs text-neutral-400">Nenhuma movimentação {PERIOD_LABELS[period].toLowerCase()}</p>
                        </div>
                      )}
                    </div>
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
