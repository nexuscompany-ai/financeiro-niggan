import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils'

interface TransactionInputProps {
  onSubmit?: () => void
}

export default function TransactionInput({ onSubmit }: TransactionInputProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const addTransaction = useFinanceStore((s) => s.addTransaction)

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType)
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!parsed || parsed <= 0) { setError('Digite um valor válido'); return }
    if (!description.trim()) { setError('Digite uma descrição'); return }

    addTransaction({
      type,
      amount: parsed,
      category,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      processed: true,
    })

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
          <button type="button" onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
            ↑ Saída
          </button>
          <button type="button" onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${type === 'income' ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
            ↓ Entrada
          </button>
        </div>

        {/* Valor */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">R$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500 focus:bg-white font-bold text-lg transition-all"
          />
        </div>

        {/* Linha: Categoria + Descrição */}
        <div className="flex gap-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="flex-1 px-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500 focus:bg-white text-sm transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição"
            maxLength={60}
            className="flex-1 px-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500 focus:bg-white text-sm transition-all"
          />
        </div>

        {error && <p className="text-red-600 text-xs px-1">{error}</p>}

        <button type="submit"
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${type === 'expense' ? 'bg-red-600 active:bg-red-700' : 'bg-green-600 active:bg-green-700'}`}>
          {type === 'expense' ? '↑ Registrar Saída' : '↓ Registrar Entrada'}
        </button>
      </form>
    </div>
  )
}
