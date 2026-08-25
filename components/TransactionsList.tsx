import useFinanceStore, { Transaction } from '@/lib/store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

interface TransactionsListProps {
  filter?: 'all' | 'income' | 'expense'
}

const EMOJI_MAP: Record<string, string> = {
  'Salário': '💼',
  'TikTok Shop': '🎵',
  'Contratos': '📋',
  'Freelancer': '💻',
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Moradia': '🏠',
  'Saúde': '⚕️',
  'Lazer': '🎮',
  'Educação': '📚',
  'Outros': '📦',
}

export default function TransactionsList({ filter = 'all' }: TransactionsListProps) {
  const transactions = useFinanceStore((state) => state.transactions)
  const removeTransaction = useFinanceStore((state) => state.removeTransaction)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true
    return t.type === filter
  })

  // Agrupar por data
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach((t) => {
    if (!grouped[t.date]) {
      grouped[t.date] = []
    }
    grouped[t.date].push(t)
  })

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (filtered.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-neutral-500">
        <p className="text-4xl mb-2">📭</p>
        <p className="text-sm">Nenhuma transação ainda</p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-safe">
      {sortedDates.map((date) => (
        <div key={date} className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-neutral-200"></div>
            <p className="text-xs font-medium text-neutral-500 px-2 bg-white">
              {format(new Date(date), 'd \'de\' MMMM', { locale: ptBR })}
            </p>
            <div className="flex-1 h-px bg-neutral-200"></div>
          </div>

          <div className="space-y-2">
            {grouped[date].map((tx) => (
              <div
                key={tx.id}
                className={`bg-white border-2 border-neutral-100 rounded-xl p-3 transition-all ${
                  expandedId === tx.id ? 'border-olive-500 bg-olive-50' : ''
                }`}
              >
                <div
                  onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">
                        {EMOJI_MAP[tx.category] || '💰'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {tx.category}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {tx.description}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-bold flex-shrink-0 ml-2 ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>

                  {expandedId === tx.id && (
                    <div className="border-t border-neutral-200 pt-3 mt-3 animate-slide-up">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Tipo:</span>
                          <span className="font-medium">
                            {tx.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Hora:</span>
                          <span className="font-medium">
                            {format(new Date(tx.date), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Status:</span>
                          <span className="font-medium">
                            {tx.processed ? '✅ Processada' : '⏳ Pendente'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTransaction(tx.id)
                          setExpandedId(null)
                        }}
                        className="w-full mt-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
