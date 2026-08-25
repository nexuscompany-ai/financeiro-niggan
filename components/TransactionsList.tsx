import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { Transaction } from '@/lib/store'
import { formatCurrency, formatDate, CATEGORY_EMOJI, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils'

type FilterType = 'today' | '7days' | 'month' | 'all' | 'income' | 'expense' | 'investment'

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, 'CDB / Reserva', 'Imprevistos', 'Compras pessoais', 'Equipamentos']

export default function TransactionsList() {
  const transactions = useFinanceStore(s => s.transactions)
  const removeTransaction = useFinanceStore(s => s.removeTransaction)
  const updateTransaction = useFinanceStore(s => s.updateTransaction)

  const [filter, setFilter] = useState<FilterType>('month')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Transaction>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()
  const now = new Date()

  const filtered = transactions.filter(t => {
    if (filter === 'today') return t.date === today
    if (filter === '7days') return t.date >= sevenDaysAgo
    if (filter === 'month') {
      const d = new Date(t.date + 'T12:00:00')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (filter === 'income') return t.type === 'income'
    if (filter === 'expense') return t.type === 'expense'
    if (filter === 'investment') return t.type === 'investment'
    return true
  })

  // Agrupar por data
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = []
    grouped[t.date].push(t)
  })
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setEditData({ type: tx.type, category: tx.category, amount: tx.amount, description: tx.description, date: tx.date })
    setExpandedId(null)
  }

  const saveEdit = () => {
    if (!editingId || !editData.amount || editData.amount <= 0) return
    updateTransaction(editingId, editData)
    setEditingId(null)
    setEditData({})
  }

  const cancelEdit = () => { setEditingId(null); setEditData({}) }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: '7days', label: '7 dias' },
    { key: 'month', label: 'Mês' },
    { key: 'all', label: 'Tudo' },
    { key: 'income', label: '↓ Entrada' },
    { key: 'expense', label: '↑ Saída' },
    { key: 'investment', label: '📈 Invest.' },
  ]

  const typeColor = (type: string) => {
    if (type === 'income') return 'text-green-600'
    if (type === 'investment') return 'text-blue-600'
    return 'text-red-600'
  }

  const typeSign = (type: string) => type === 'income' ? '+' : '-'

  return (
    <div>
      {/* Filtros */}
      <div className="px-4 mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.key ? 'bg-olive-700 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
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
              {/* Header data */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-neutral-400">{formatDate(date)}</p>
                <div className="flex-1 h-px bg-neutral-100" />
                <p className="text-xs font-bold text-neutral-400">
                  {formatCurrency(grouped[date].reduce((s, t) =>
                    t.type === 'income' ? s + t.amount : s - t.amount, 0))}
                </p>
              </div>

              <div className="space-y-2">
                {grouped[date].map(tx => (
                  <div key={tx.id} className="bg-white border border-neutral-100 rounded-xl overflow-hidden">

                    {/* MODO EDIÇÃO */}
                    {editingId === tx.id ? (
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-bold text-olive-700 mb-1">✏️ Editando transação</p>

                        {/* Tipo */}
                        <div className="flex gap-2">
                          {(['expense', 'income', 'investment'] as const).map(tp => (
                            <button key={tp} type="button"
                              onClick={() => setEditData(d => ({ ...d, type: tp }))}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${editData.type === tp
                                ? tp === 'income' ? 'bg-green-600 text-white'
                                  : tp === 'investment' ? 'bg-blue-600 text-white'
                                  : 'bg-red-600 text-white'
                                : 'bg-neutral-100 text-neutral-500'}`}>
                              {tp === 'income' ? '↓ Entrada' : tp === 'investment' ? '📈 Invest.' : '↑ Saída'}
                            </button>
                          ))}
                        </div>

                        {/* Valor */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-bold">R$</span>
                          <input type="number" step="0.01" min="0"
                            value={editData.amount || ''}
                            onChange={e => setEditData(d => ({ ...d, amount: parseFloat(e.target.value) }))}
                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-100 rounded-lg text-sm font-bold border-2 border-transparent focus:border-olive-400"
                            inputMode="decimal" />
                        </div>

                        {/* Categoria */}
                        <select value={editData.category}
                          onChange={e => setEditData(d => ({ ...d, category: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400">
                          {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>

                        {/* Descrição */}
                        <input type="text" value={editData.description || ''}
                          onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                          placeholder="Descrição"
                          className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400" />

                        {/* Data */}
                        <input type="date" value={editData.date || ''}
                          onChange={e => setEditData(d => ({ ...d, date: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400" />

                        {/* Botões */}
                        <div className="flex gap-2 pt-1">
                          <button onClick={cancelEdit}
                            className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium">
                            Cancelar
                          </button>
                          <button onClick={saveEdit}
                            className="flex-1 py-2.5 bg-olive-700 text-white rounded-lg text-sm font-bold">
                            ✅ Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* MODO NORMAL */
                      <>
                        <div onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                          className="flex items-center gap-3 p-3 cursor-pointer active:bg-neutral-50">
                          <span className="text-xl flex-shrink-0">
                            {CATEGORY_EMOJI[tx.category] || (tx.type === 'income' ? '💰' : tx.type === 'investment' ? '📈' : '💸')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-800 truncate">{tx.description}</p>
                            <p className="text-xs text-neutral-400">{tx.category}</p>
                          </div>
                          <p className={`text-sm font-bold flex-shrink-0 ${typeColor(tx.type)}`}>
                            {typeSign(tx.type)}{formatCurrency(tx.amount)}
                          </p>
                        </div>

                        {/* Ações expandidas */}
                        {expandedId === tx.id && (
                          <div className="border-t border-neutral-100 px-3 py-2 flex gap-2 bg-neutral-50">
                            <button onClick={() => startEdit(tx)}
                              className="flex-1 py-2 bg-olive-100 text-olive-800 rounded-lg text-xs font-bold active:bg-olive-200">
                              ✏️ Editar
                            </button>
                            {confirmDelete === tx.id ? (
                              <>
                                <button onClick={() => { removeTransaction(tx.id); setExpandedId(null); setConfirmDelete(null) }}
                                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
                                  Confirmar
                                </button>
                                <button onClick={() => setConfirmDelete(null)}
                                  className="flex-1 py-2 bg-neutral-200 text-neutral-600 rounded-lg text-xs font-medium">
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setConfirmDelete(tx.id)}
                                className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold active:bg-red-100">
                                🗑️ Deletar
                              </button>
                            )}
                          </div>
                        )}
                      </>
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
