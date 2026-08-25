import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, INVESTMENT_CATEGORIES } from '@/lib/utils'

export default function TransactionInput({ onSubmit }: { onSubmit?: () => void }) {
  const [type, setType] = useState<'expense'|'income'|'investment'>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [fromCategory, setFromCategory] = useState(INCOME_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const addTransaction = useFinanceStore(s => s.addTransaction)

  const categories = type==='income' ? INCOME_CATEGORIES : type==='investment' ? INVESTMENT_CATEGORIES : EXPENSE_CATEGORIES

  const handleType = (t: typeof type) => {
    setType(t)
    setCategory(t==='income' ? INCOME_CATEGORIES[0] : t==='investment' ? INVESTMENT_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount.replace(',','.'))
    if (!val || val<=0) { setError('Valor inválido'); return }
    if (!description.trim()) { setError('Adicione uma descrição'); return }

    addTransaction({
      type,
      category,
      amount: val,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      ...(type === 'investment' ? { fromCategory } : {}),
    })
    setAmount(''); setDescription(''); setError('')
    onSubmit?.()
  }

  return (
    <div className="px-4 py-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Tipo */}
        <div className="flex gap-2">
          {([['expense','↑ Saída','bg-red-600'],['income','↓ Entrada','bg-green-600'],['investment','📈 Invest.','bg-blue-600']] as const).map(([t,label,cls]) => (
            <button key={t} type="button" onClick={() => handleType(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${type===t ? `${cls} text-white` : 'bg-neutral-100 text-neutral-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Valor + Categoria */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">R$</span>
            <input type="number" step="0.01" min="0" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal"
              className="w-full pl-9 pr-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 font-bold text-base transition-all" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex-1 px-3 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 text-sm cursor-pointer">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Se for investimento: de qual cofre veio? */}
        {type === 'investment' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 mb-2">💡 De qual cofre vem esse investimento?</p>
            <select value={fromCategory} onChange={e => setFromCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white rounded-lg border border-blue-200 text-sm cursor-pointer text-blue-900 font-medium">
              {INCOME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <p className="text-xs text-blue-500 mt-1.5">
              O cofre "{fromCategory}" vai manter o total de entradas, mas o investimento aparece no histórico dele.
            </p>
          </div>
        )}

        {/* Descrição */}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder={type==='investment' ? 'Ex: Aporte C6 CDB' : 'Descrição'}
          className="w-full px-4 py-3 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-400 text-sm transition-all"
          maxLength={60} />

        {error && <p className="text-red-500 text-xs px-1">{error}</p>}

        <button type="submit"
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${type==='income' ? 'bg-green-600' : type==='investment' ? 'bg-blue-600' : 'bg-red-600'}`}>
          {type==='income' ? '↓ Registrar Entrada' : type==='investment' ? '📈 Registrar Investimento' : '↑ Registrar Saída'}
        </button>
      </form>
    </div>
  )
}
