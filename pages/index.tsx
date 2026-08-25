import { useState, useEffect } from 'react'
import Link from 'next/link'
import BalanceCard from '@/components/BalanceCard'
import InsightsBar from '@/components/InsightsBar'
import GoalTracker from '@/components/GoalTracker'
import CreditCard from '@/components/CreditCard'
import TransactionInput from '@/components/TransactionInput'
import TransactionsList from '@/components/TransactionsList'
import useFinanceStore from '@/lib/store'
import { isWednesday, formatCurrency } from '@/lib/utils'

export default function Home() {
  const [showInput, setShowInput] = useState(false)
  const [showTiktok, setShowTiktok] = useState(false)
  const [tiktokAmount, setTiktokAmount] = useState('')
  const [hidden, setHidden] = useState(false)
  const load = useFinanceStore(s => s.load)
  const addTransaction = useFinanceStore(s => s.addTransaction)

  useEffect(() => {
    load()
    if (isWednesday()) {
      const last = localStorage.getItem('lastTiktok')
      const today = new Date().toISOString().split('T')[0]
      if (last !== today) setShowTiktok(true)
    }
  }, [])

  const handleTiktok = () => {
    const val = parseFloat(tiktokAmount.replace(',', '.'))
    if (val > 0) {
      addTransaction({ type: 'income', category: 'TikTok Shop', amount: val, description: 'Rendimento semanal TikTok Shop', date: new Date().toISOString().split('T')[0] })
      localStorage.setItem('lastTiktok', new Date().toISOString().split('T')[0])
    }
    setShowTiktok(false)
    setTiktokAmount('')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-olive-900">Niggan 💰</h1>
            <p className="text-xs text-neutral-400">Controle financeiro</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHidden(h => !h)}
              className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base active:bg-neutral-200">
              {hidden ? '👁️' : '🙈'}
            </button>
            <Link href="/settings"
              className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center text-base active:bg-neutral-200">
              ⚙️
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-8">
        <BalanceCard hidden={hidden} />
        <GoalTracker hidden={hidden} />
        <InsightsBar hidden={hidden} />
        <CreditCard hidden={hidden} />

        {/* Botões */}
        <div className="px-4 mt-3 mb-3 grid grid-cols-2 gap-2">
          <button onClick={() => setShowInput(!showInput)}
            className={`py-3.5 rounded-xl font-bold text-sm transition-all ${showInput ? 'bg-neutral-200 text-neutral-600' : 'bg-olive-700 text-white'}`}>
            {showInput ? '✕ Fechar' : '+ Nova Transação'}
          </button>
          <Link href="/cofres"
            className="py-3.5 rounded-xl font-bold text-sm bg-white border-2 border-olive-200 text-olive-800 text-center flex items-center justify-center gap-1 active:bg-olive-50">
            🏦 Cofres
          </Link>
        </div>

        {showInput && (
          <div className="bg-white border-y border-neutral-100 mb-3">
            <TransactionInput onSubmit={() => setShowInput(false)} />
          </div>
        )}

        <div className="px-4 mb-2">
          <p className="text-xs font-bold text-neutral-500 uppercase">Histórico do mês</p>
          <p className="text-xs text-neutral-400">Toque para editar ou deletar</p>
        </div>
        <TransactionsList hidden={hidden} />
      </main>

      {/* Modal TikTok */}
      {showTiktok && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <div className="text-center mb-5">
              <p className="text-4xl mb-2">🎵</p>
              <h2 className="text-xl font-bold text-olive-900">TikTok Shop</h2>
              <p className="text-sm text-neutral-500 mt-1">Quarta-feira! Quanto entrou essa semana?</p>
            </div>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">R$</span>
              <input type="number" step="0.01" min="0" value={tiktokAmount}
                onChange={e => setTiktokAmount(e.target.value)} placeholder="0,00" inputMode="decimal" autoFocus
                className="w-full pl-10 pr-4 py-4 text-xl font-bold bg-neutral-100 rounded-xl border-2 border-transparent focus:border-olive-500" />
            </div>
            <div className="space-y-2">
              <button onClick={handleTiktok} disabled={!tiktokAmount || parseFloat(tiktokAmount) <= 0}
                className="w-full bg-olive-700 disabled:bg-neutral-300 text-white py-4 rounded-xl font-bold">
                ✅ Confirmar {tiktokAmount ? formatCurrency(parseFloat(tiktokAmount) || 0) : ''}
              </button>
              <button onClick={() => setShowTiktok(false)}
                className="w-full bg-neutral-100 text-neutral-600 py-3 rounded-xl font-medium">
                Pular essa semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
