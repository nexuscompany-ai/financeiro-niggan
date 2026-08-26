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
      type, category, amount: val, description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      ...(type==='investment' ? { fromCategory } : {}),
    })
    setAmount(''); setDescription(''); setError('')
    onSubmit?.()
  }

  const typeConfig = {
    expense:    { label: '↑ Saída',    bg: '#C0392B', active: '#FCECEA', text: '#C0392B' },
    income:     { label: '↓ Entrada',  bg: '#2D7A4F', active: '#EBF7F0', text: '#2D7A4F' },
    investment: { label: '↗ Investir', bg: '#2563EB', active: '#EFF6FF', text: '#2563EB' },
  }

  const activeColor = typeConfig[type].bg

  return (
    <div className="px-4 py-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Type selector */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: '#F0EFE9' }}>
          {(['expense','income','investment'] as const).map(t => (
            <button key={t} type="button" onClick={() => handleType(t)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all pressable"
              style={type===t
                ? { background: '#fff', color: typeConfig[t].text, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                : { background: 'transparent', color: '#A8A79E' }}>
              {typeConfig[t].label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E5E3D8' }}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: '#A8A79E' }}>R$</span>
          <input type="number" step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal"
            className="w-full pl-10 pr-4 py-3.5 bg-transparent font-bold text-lg outline-none tabular"
            style={{ color: '#292615' }} />
        </div>

        {/* Category + Description row */}
        <div className="flex gap-2">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="flex-1 px-3 py-3 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: '#fff', border: '1.5px solid #E5E3D8', color: '#292615' }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descrição" maxLength={60}
            className="flex-1 px-3 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#fff', border: '1.5px solid #E5E3D8', color: '#292615' }} />
        </div>

        {/* Investment origin */}
        {type === 'investment' && (
          <div className="rounded-xl p-3 animate-fade-in" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#2563EB' }}>De qual cofre vem este investimento?</p>
            <select value={fromCategory} onChange={e => setFromCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{ background: '#fff', border: '1px solid #BFDBFE', color: '#1D4ED8' }}>
              {INCOME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-xs px-1 font-medium" style={{ color: '#C0392B' }}>{error}</p>}

        <button type="submit" className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all pressable"
          style={{ background: activeColor, color: '#fff' }}>
          {typeConfig[type].label} · confirmar
        </button>
      </form>
    </div>
  )
}
