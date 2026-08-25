import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { formatCurrency, formatDate, CATEGORY_EMOJI } from '@/lib/utils'
import { Transaction } from '@/lib/store'

type FilterType = 'all' | 'income' | 'expense' | '7days' | 'today'

export default function TransactionsList() {
  const transactions = useFinanceStore(s => s.transactions)
  const removeTransaction = useFinanceStore(s => s.removeTransaction)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0]

  const filtered = transactions.filter(t => {
    if (filter === 'today') return t.date === today
    if (filter === '7days') return t.date >= sevenDaysStr
    if (filter === 'income') return t.type === 'income'
    if (filter === 'expense') return t.type === 'expense'
    return true
  })

  // Agrupar por data
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = []
    grouped[t.date].push(t)
  })
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const filters: { key: FilterType; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: '7days', label: '7 dias' },
    { key: 'all', label: 'Tudo' },
    { key: 'income', label: 'Entradas' },
    { key: 'expense', label: 'Saídas' },
  ]

  return (
    <div>
      {/* Filtros */}
      <div className="px-4 mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-olive-700 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-4 pb-32">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-neutral-500">Nenhuma transação</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="mb-4">
              {/* Header da data */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-neutral-500">{formatDate(date)}</p>
                <div className="flex-1 h-px bg-neutral-100" />
                <p className="text-xs font-bold text-neutral-400">
                  {formatCurrency(grouped[date].reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0))}
                </p>
              </div>

              <div className="space-y-2">
                {grouped[date].map(tx => (
                  <div key={tx.id}
                    className={`bg-white border rounded-xl overflow-hidden transition-all ${expandedId === tx.id ? 'border-olive-300' : 'border-neutral-100'}`}>
                    <div
                      onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                      className="flex items-center gap-3 p-3 cursor-pointer active:bg-neutral-50"
                    >
                      <span className="text-2xl flex-shrink-0">
                        {CATEGORY_EMOJI[tx.category] || (tx.type === 'income' ? '💰' : '💸')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 truncate">{tx.description}</p>
                        <p className="text-xs text-neutral-400">{tx.category}</p>
                      </div>
                      <p className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>

                    {expandedId === tx.id && (
                      <div className="border-t border-neutral-100 px-3 py-2 flex justify-between items-center bg-neutral-50">
                        <p className="text-xs text-neutral-500">
                          {tx.type === 'income' ? '✅ Entrada' : '🔴 Saída'} · {tx.date}
                        </p>
                        <button
                          onClick={() => { removeTransaction(tx.id); setExpandedId(null) }}
                          className="text-xs text-red-500 font-medium py-1 px-3 bg-red-50 rounded-lg active:bg-red-100"
                        >
                          Deletar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
