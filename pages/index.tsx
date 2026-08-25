import { useState, useEffect } from 'react'
import BalanceCard from '@/components/BalanceCard'
import InsightsBar from '@/components/InsightsBar'
import GoalTracker from '@/components/GoalTracker'
import TransactionInput from '@/components/TransactionInput'
import TransactionsList from '@/components/TransactionsList'
import useFinanceStore from '@/lib/store'
import { isWednesday } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function Home() {
  const [showInput, setShowInput] = useState(false)
  const [showTiktok, setShowTiktok] = useState(false)
  const [tiktokAmount, setTiktokAmount] = useState('')
  const loadFromStorage = useFinanceStore(s => s.loadFromStorage)
  const addTiktokIncome = useFinanceStore(s => s.addTiktokIncome)

  useEffect(() => {
    loadFromStorage()

    // TikTok Shop toda quarta-feira
    if (isWednesday()) {
      const lastDate = localStorage.getItem('lastTiktok')
      const today = new Date().toISOString().split('T')[0]
      if (lastDate !== today) {
        setShowTiktok(true)
      }
    }
  }, [])

  const handleTiktok = () => {
    const val = parseFloat(tiktokAmount.replace(',', '.'))
    if (val > 0) {
      addTiktokIncome(val)
      localStorage.setItem('lastTiktok', new Date().toISOString().split('T')[0])
    }
    setShowTiktok(false)
    setTiktokAmount('')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-olive-900">Niggan</h1>
            <p className="text-xs text-neutral-400">Controle financeiro</p>
          </div>
          <Link href="/settings"
            className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base">
            ⚙️
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <BalanceCard />
        <GoalTracker />
        <InsightsBar />

        {/* Botão de adicionar */}
        <div className="px-4 mt-3 mb-3">
          <button
            onClick={() => setShowInput(!showInput)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${showInput ? 'bg-neutral-200 text-neutral-700' : 'bg-olive-700 text-white'}`}
          >
            {showInput ? '✕ Fechar' : '+ Nova Transação'}
          </button>
        </div>

        {/* Formulário colapsável */}
        {showInput && (
          <div className="bg-white border-y border-neutral-100 animate-slide-up">
            <TransactionInput onSubmit={() => setShowInput(false)} />
          </div>
        )}

        {/* Lista de transações */}
        <div className="mt-3">
          <div className="px-4 mb-2">
            <p className="text-xs font-bold text-neutral-500 uppercase">Histórico</p>
          </div>
          <TransactionsList />
        </div>
      </main>

      {/* Modal TikTok Shop */}
      {showTiktok && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="text-center mb-5">
              <p className="text-4xl mb-2">🎵</p>
              <h2 className="text-xl font-bold text-olive-900">TikTok Shop</h2>
              <p className="text-sm text-neutral-500 mt-1">Quarta-feira! Quanto entrou essa semana?</p>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tiktokAmount}
                onChange={e => setTiktokAmount(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                autoFocus
                className="w-full pl-10 pr-4 py-4 text-xl font-bold text-center bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleTiktok}
                disabled={!tiktokAmount || parseFloat(tiktokAmount) <= 0}
                className="w-full bg-olive-700 disabled:bg-neutral-300 text-white py-3.5 rounded-xl font-bold transition-all"
              >
                ✅ Confirmar {tiktokAmount ? formatCurrency(parseFloat(tiktokAmount) || 0) : ''}
              </button>
              <button
                onClick={() => setShowTiktok(false)}
                className="w-full bg-neutral-100 text-neutral-600 py-3 rounded-xl font-medium"
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
