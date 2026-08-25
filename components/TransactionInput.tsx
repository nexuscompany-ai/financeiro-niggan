import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, INVESTMENT_CATEGORIES } from '@/lib/utils'

export default function TransactionInput({ onSubmit }: { onSubmit?: () => void }) {
  const [type, setType] = useState<'expense' | 'income' | 'investment'>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const addTransaction = useFinanceStore(s => s.addTransaction)

  const categories = type === 'income' ? INCOME_CATEGORIES : type === 'investment' ? INVESTMENT_CATEGORIES : EXPENSE_CATEGORIES

  const handleType = (t: typeof type) => {
    setType(t)
    setCategory(t === 'income' ? INCOME_CATEGORIES[0] : t === 'investment' ? INVESTMENT_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount.replace(',', '.'))
    if (!val || val <= 0) { setError('Valor inválido'); return }
    if (!description.trim()) { setError('Adicione uma descrição'); return }

    addTransaction({ type, category, amount: val, description: description.trim(), date: new Date().toISOString().split('T')[0] })
    setAmount('')
    setDescription('')
    setError('')
    onSubmit?.()
  }

  return (
    <div className="px-4 py-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Tipo */}
        <div className="flex gap-2">
          {([['expense', '↑ Saída', 'bg-red-600'], ['income', '↓ Entrada', 'bg-green-600'], ['investment', '📈 Invest.', 'bg-blue-600']] as const).map(([t, label, activeClass]) => (
            <button key={t} type="button" onClick={() => handleType(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${type === t ? `${activeClass} text-white` : 'bg-neutral-100 text-neutral-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Valor + Categoria */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">R$</span>
            <input type="number" step="0.01" min="0" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00" inputMode="decimal"
              className="w-full pl-9 pr-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 font-bold text-base transition-all" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex-1 px-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 text-sm transition-all cursor-pointer">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Descrição */}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Descrição rápida"
          className="w-full px-4 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 text-sm transition-all"
          maxLength={60} />

        {error && <p className="text-red-500 text-xs px-1">{error}</p>}

        <button type="submit"
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${type === 'income' ? 'bg-green-600' : type === 'investment' ? 'bg-blue-600' : 'bg-red-600'}`}>
          {type === 'income' ? '↓ Registrar Entrada' : type === 'investment' ? '📈 Registrar Investimento' : '↑ Registrar Saída'}
        </button>
      </form>
    </div>
  )
}
