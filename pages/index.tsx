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
    <div className="min-h-screen" style={{ background: '#F8F8F6' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: '#E5E3D8' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight" style={{ color: '#292615' }}>niggan</h1>
            <p className="text-xs" style={{ color: '#A8A79E' }}>controle financeiro</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHidden(h => !h)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm pressable transition-all"
              style={{ background: hidden ? '#3D3822' : '#F0EFE9', color: hidden ? '#F0D98A' : '#857A50' }}
              title={hidden ? 'Mostrar valores' : 'Ocultar valores'}>
              {hidden ? '○' : '●'}
            </button>
            <Link href="/settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm pressable"
              style={{ background: '#F0EFE9', color: '#857A50' }}>
              ⚙
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-8">
        <BalanceCard hidden={hidden} />
        <GoalTracker hidden={hidden} />
        <InsightsBar hidden={hidden} />
        <CreditCard hidden={hidden} />

        {/* Action buttons */}
        <div className="px-4 mt-4 mb-3 grid grid-cols-2 gap-2">
          <button onClick={() => setShowInput(!showInput)}
            className="py-3.5 rounded-2xl font-semibold text-sm transition-all pressable"
            style={showInput
              ? { background: '#F0EFE9', color: '#857A50' }
              : { background: '#3D3822', color: '#F0D98A', boxShadow: '0 4px 16px rgba(61,56,34,0.3)' }}>
            {showInput ? '✕ Fechar' : '+ Nova transação'}
          </button>
          <Link href="/cofres"
            className="py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 pressable"
            style={{ background: '#fff', color: '#544C31', border: '1.5px solid #D8D4B8' }}>
            🏦 Cofres
          </Link>
        </div>

        {/* Form */}
        {showInput && (
          <div className="mx-4 mb-3 rounded-2xl overflow-hidden shadow-card animate-slide-up"
            style={{ background: '#fff', border: '1px solid #F0EFE9' }}>
            <TransactionInput onSubmit={() => setShowInput(false)} />
          </div>
        )}

        {/* History header */}
        <div className="px-4 mb-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(135deg, #544C31, #3D3822)' }} />
            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B6140' }}>Histórico</p>
          </div>
        </div>

        <TransactionsList hidden={hidden} />
      </main>

      {/* TikTok modal */}
      {showTiktok && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full rounded-t-3xl p-6 animate-slide-up shadow-card"
            style={{ background: '#fff' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#E5E3D8' }} />
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                style={{ background: '#FFF0F8' }}>🎵</div>
              <h2 className="font-display font-bold text-xl" style={{ color: '#292615' }}>TikTok Shop</h2>
              <p className="text-sm mt-1" style={{ color: '#A8A79E' }}>Quarta-feira! Quanto entrou essa semana?</p>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: '#A8A79E' }}>R$</span>
              <input type="number" step="0.01" min="0" value={tiktokAmount}
                onChange={e => setTiktokAmount(e.target.value)}
                placeholder="0,00" inputMode="decimal" autoFocus
                className="w-full pl-10 pr-4 py-4 text-xl font-bold rounded-2xl outline-none tabular"
                style={{ background: '#F8F8F6', border: '1.5px solid #E5E3D8', color: '#292615' }} />
            </div>

            <div className="space-y-2">
              <button onClick={handleTiktok}
                disabled={!tiktokAmount || parseFloat(tiktokAmount) <= 0}
                className="w-full py-4 rounded-2xl font-semibold transition-all pressable"
                style={{
                  background: (!tiktokAmount || parseFloat(tiktokAmount) <= 0) ? '#F0EFE9' : '#3D3822',
                  color: (!tiktokAmount || parseFloat(tiktokAmount) <= 0) ? '#C8C5B8' : '#F0D98A'
                }}>
                Confirmar {tiktokAmount && parseFloat(tiktokAmount) > 0 ? formatCurrency(parseFloat(tiktokAmount)) : ''}
              </button>
              <button onClick={() => setShowTiktok(false)}
                className="w-full py-3 rounded-2xl text-sm font-medium pressable"
                style={{ background: '#F0EFE9', color: '#857A50' }}>
                Pular essa semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
