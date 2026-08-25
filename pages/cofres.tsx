import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency, CATEGORY_EMOJI } from '@/lib/utils'

type Period = '7d'|'30d'|'90d'|'all'
const PERIOD_LABELS: Record<Period,string> = { '7d':'7 dias','30d':'Este mês','90d':'90 dias','all':'Tudo' }

const COFRES = [
  { key: 'Salário FGL Brasil', emoji: '💼', color: { bg:'bg-blue-50',border:'border-blue-200',text:'text-blue-800',bar:'bg-blue-500',badge:'bg-blue-100 text-blue-700' } },
  { key: 'Contratos / Instalações', emoji: '🔧', color: { bg:'bg-orange-50',border:'border-orange-200',text:'text-orange-800',bar:'bg-orange-500',badge:'bg-orange-100 text-orange-700' } },
  { key: 'TikTok Shop', emoji: '🎵', color: { bg:'bg-pink-50',border:'border-pink-200',text:'text-pink-800',bar:'bg-pink-500',badge:'bg-pink-100 text-pink-700' } },
  { key: 'Outras receitas', emoji: '💰', color: { bg:'bg-purple-50',border:'border-purple-200',text:'text-purple-800',bar:'bg-purple-500',badge:'bg-purple-100 text-purple-700' } },
  { key: 'Entrada', emoji: '💵', color: { bg:'bg-green-50',border:'border-green-200',text:'text-green-800',bar:'bg-green-500',badge:'bg-green-100 text-green-700' } },
]

const SPECIFIC_CATS = ['Salário FGL Brasil','Contratos / Instalações','TikTok Shop','Outras receitas']

function daysAgo(n: number) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0] }
function startOfMonth() { const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),1).toISOString().split('T')[0] }

export default function Cofres() {
  const transactions = useFinanceStore(s => s.transactions)
  const [hidden, setHidden] = useState(false)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [periods, setPeriods] = useState<Record<string,Period>>({})

  const getPeriod = (k: string): Period => periods[k] || 'all'
  const setPeriod = (k: string, p: Period) => setPeriods(prev => ({...prev,[k]:p}))

  const filterByPeriod = (txs: typeof transactions, p: Period) => {
    if (p==='7d') return txs.filter(t => t.date >= daysAgo(7))
    if (p==='30d') return txs.filter(t => t.date >= startOfMonth())
    if (p==='90d') return txs.filter(t => t.date >= daysAgo(90))
    return txs
  }

  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)

  const cofresData = useMemo(() => {
    return COFRES.map(({ key, emoji, color }) => {
      const isEntrada = key === 'Entrada'

      // Entradas desta categoria
      const allIncomes = transactions.filter(t =>
        t.type === 'income' && (isEntrada ? !SPECIFIC_CATS.includes(t.category) : t.category === key)
      )
      // Investimentos que vieram desta categoria
      const allInvestments = transactions.filter(t =>
        t.type === 'investment' && t.fromCategory === key
      )

      const totalIncomeAll = allIncomes.reduce((s,t)=>s+t.amount,0)
      const totalInvestAll = allInvestments.reduce((s,t)=>s+t.amount,0)

      const period = getPeriod(key)
      const incomes = filterByPeriod(allIncomes, period).sort((a,b)=>b.date.localeCompare(a.date))
      const investments = filterByPeriod(allInvestments, period).sort((a,b)=>b.date.localeCompare(a.date))

      const totalIncome = incomes.reduce((s,t)=>s+t.amount,0)
      const totalInvest = investments.reduce((s,t)=>s+t.amount,0)

      return { key, emoji, color, incomes, investments, totalIncome, totalInvest, totalIncomeAll, totalInvestAll }
    })
  }, [transactions, periods])

  const totalGeral = cofresData.reduce((s,c)=>s+c.totalIncomeAll,0)

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl text-neutral-500">←</Link>
            <div>
              <h1 className="text-xl font-bold text-olive-900">Cofres 🏦</h1>
              <p className="text-xs text-neutral-400">Entradas por origem</p>
            </div>
          </div>
          <button onClick={() => setHidden(h=>!h)}
            className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base active:bg-neutral-200">
            {hidden ? '👁️' : '🙈'}
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-12">
        {/* Total geral */}
        <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white mb-4">
          <p className="text-xs opacity-60 mb-1">Total em todos os cofres</p>
          <p className="text-3xl font-bold">{hidden ? '••••••' : formatCurrency(totalGeral)}</p>
          <p className="text-xs opacity-50 mt-2">{transactions.filter(t=>t.type==='income').length} entradas registradas</p>
        </div>

        {/* Cofres */}
        <div className="space-y-3">
          {cofresData.map(({ key, emoji, color, incomes, investments, totalIncome, totalInvest, totalIncomeAll, totalInvestAll }) => {
            const isOpen = expanded === key
            const period = getPeriod(key)
            const pct = totalIncomeAll > 0 ? Math.round((totalIncomeAll/totalGeral)*100) : 0

            return (
              <div key={key} className={`bg-white border-2 ${color.border} rounded-2xl overflow-hidden`}>
                {/* Header */}
                <div onClick={() => setExpanded(isOpen ? null : key)} className="p-4 cursor-pointer active:bg-neutral-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <p className={`text-sm font-bold ${color.text}`}>{key}</p>
                        <p className="text-xs text-neutral-400">
                          {incomes.length} entrada{incomes.length!==1?'s':''} · {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">{fmt(totalIncomeAll)}</p>
                      {totalInvestAll > 0 && (
                        <p className="text-xs font-medium text-blue-600">📈 {fmt(totalInvestAll)} invest.</p>
                      )}
                    </div>
                  </div>
                  {/* Barra */}
                  <div className="w-full bg-neutral-100 rounded-full h-1.5">
                    <div className={`${color.bar} h-1.5 rounded-full`} style={{width:`${pct}%`}} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-neutral-400">{pct}% do total geral</p>
                    <p className="text-xs text-neutral-400">{isOpen ? '▲ fechar' : '▼ ver detalhes'}</p>
                  </div>
                </div>

                {/* Expandido */}
                {isOpen && (
                  <div className="border-t border-neutral-100">
                    {/* Filtros */}
                    <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                      {(Object.entries(PERIOD_LABELS) as [Period,string][]).map(([p,label]) => (
                        <button key={p} onClick={e=>{e.stopPropagation();setPeriod(key,p)}}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${period===p ? `${color.bar} text-white` : 'bg-neutral-100 text-neutral-500'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                      {/* Entradas */}
                      {incomes.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Entradas</p>
                          {incomes.map(tx => (
                            <div key={tx.id} className={`${color.bg} rounded-xl px-3 py-2.5 flex items-center justify-between`}>
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm font-medium text-neutral-800 truncate">{tx.description}</p>
                                <p className="text-xs text-neutral-400">
                                  {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'})}
                                </p>
                              </div>
                              <p className={`text-sm font-bold flex-shrink-0 ${color.text}`}>+{fmt(tx.amount)}</p>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 border-t border-neutral-100">
                            <p className="text-xs font-bold text-neutral-500">Subtotal entradas</p>
                            <p className={`text-sm font-bold ${color.text}`}>{fmt(totalIncome)}</p>
                          </div>
                        </>
                      )}

                      {/* Investimentos deste cofre */}
                      {investments.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-blue-500 uppercase mt-2">📈 Investimentos deste cofre</p>
                          {investments.map(tx => (
                            <div key={tx.id} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-center justify-between">
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm font-medium text-blue-800 truncate">{tx.description}</p>
                                <p className="text-xs text-blue-400">
                                  {tx.category} · {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'})}
                                </p>
                              </div>
                              <p className="text-sm font-bold flex-shrink-0 text-blue-700">📈 {fmt(tx.amount)}</p>
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
                          <p className="text-xs text-neutral-400">Nenhuma movimentação neste período</p>
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
