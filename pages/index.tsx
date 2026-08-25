import { useState, useEffect } from 'react'
import BalanceCard from '@/components/BalanceCard'
import TransactionInput from '@/components/TransactionInput'
import TransactionsList from '@/components/TransactionsList'
import useFinanceStore from '@/lib/store'

type FilterType = 'all' | 'income' | 'expense'

export default function Home() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [showTiktokModal, setShowTiktokModal] = useState(false)
  const [tiktokAmount, setTiktokAmount] = useState('0')
  const setWeeklyTiktokIncome = useFinanceStore((state) => state.setWeeklyTiktokIncome)

  // Verificar se é quarta-feira e adicionar TikTok Shop
  useEffect(() => {
    const checkAndAddTikTok = () => {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 3 = Wednesday

      if (dayOfWeek === 3) {
        // É quarta-feira
        const lastTiktokDate = localStorage.getItem('lastTiktokDate')
        const todayDate = today.toISOString().split('T')[0]

        if (lastTiktokDate !== todayDate) {
          // Não adicionamos TikTok hoje ainda
          setShowTiktokModal(true)
          localStorage.setItem('lastTiktokDate', todayDate)
        }
      }
    }

    checkAndAddTikTok()
  }, [])

  const handleAddTikTok = () => {
    const amount = parseFloat(tiktokAmount)
    if (amount > 0) {
      setWeeklyTiktokIncome(amount)
      setShowTiktokModal(false)
      setTiktokAmount('0')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-olive-900">Niggan</h1>
            <p className="text-xs text-neutral-500">Finanças com IA</p>
          </div>
          <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center text-lg">
            🤖
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <BalanceCard />

        {/* Filter Tabs */}
        <div className="sticky top-[76px] bg-white border-b border-neutral-100 z-30 px-4 py-3 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-olive-700 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'income'
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'expense'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Saídas
          </button>
        </div>

        {/* Transactions List */}
        <TransactionsList filter={filter} />
      </main>

      {/* Transaction Input - Fixed Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-100 shadow-lg">
        <TransactionInput />
      </div>

      {/* TikTok Modal */}
      {showTiktokModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">🎵</p>
              <h2 className="text-2xl font-bold text-olive-900 mb-1">
                TikTok Shop - Quarta-feira
              </h2>
              <p className="text-neutral-600 text-sm">
                Quanto você ganhou essa semana?
              </p>
            </div>

            <div className="mb-6">
              <input
                type="number"
                step="0.01"
                min="0"
                value={tiktokAmount}
                onChange={(e) => setTiktokAmount(e.target.value)}
                placeholder="Digite o valor"
                className="w-full px-4 py-3 text-lg font-bold text-center bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500 focus:bg-white transition-all"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddTikTok}
                disabled={parseFloat(tiktokAmount) <= 0}
                className="w-full bg-olive-700 hover:bg-olive-800 disabled:bg-neutral-300 text-white py-3 px-4 rounded-xl font-medium transition-all"
              >
                ✅ Confirmar R$ {parseFloat(tiktokAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </button>
              <button
                onClick={() => setShowTiktokModal(false)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-3 px-4 rounded-xl font-medium transition-all"
              >
                Pular essa semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
