import { useState, useRef } from 'react'
import useFinanceStore from '@/lib/store'

interface TransactionInputProps {
  onSubmit?: () => void
}

const CATEGORIES = {
  income: ['Salário', 'TikTok Shop', 'Contratos', 'Freelancer', 'Outros'],
  expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'],
}

export default function TransactionInput({ onSubmit }: TransactionInputProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const addTransaction = useFinanceStore((state) => state.addTransaction)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount.trim() || parseFloat(amount) <= 0) {
      setError('Digite um valor válido')
      return
    }

    if (!description.trim()) {
      setError('Digite uma descrição')
      return
    }

    try {
      addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date().toISOString().split('T')[0],
        processed: true,
      })

      // Limpar formulário
      setAmount('')
      setDescription('')
      setError('')
      setType('expense')
      setCategory(CATEGORIES.expense[0])
      
      onSubmit?.()
    } catch (err) {
      setError('Erro ao adicionar transação')
      console.error(err)
    }
  }

  const categoriesForType = type === 'income' ? CATEGORIES.income : CATEGORIES.expense

  return (
    <div className="w-full px-4 pb-safe">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Tipo de Transação */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setType('expense')
              setCategory(CATEGORIES.expense[0])
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              type === 'expense'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            ❌ Saída
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income')
              setCategory(CATEGORIES.income[0])
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              type === 'income'
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            💚 Entrada
          </button>
        </div>

        {/* Valor */}
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          className="w-full px-4 py-3 bg-neutral-100 rounded-xl focus:bg-white border-2 border-transparent focus:border-olive-500 font-bold text-lg transition-all"
          inputMode="decimal"
        />

        {/* Categoria */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-100 rounded-xl focus:bg-white border-2 border-transparent focus:border-olive-500 transition-all cursor-pointer"
        >
          {categoriesForType.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Descrição */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (ex: Almoço)"
          className="w-full px-4 py-3 bg-neutral-100 rounded-xl focus:bg-white border-2 border-transparent focus:border-olive-500 transition-all"
          maxLength={100}
        />

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-olive-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-olive-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all"
        >
          ✅ Adicionar
        </button>
      </form>
    </div>
  )
}
