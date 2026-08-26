import { useState, useEffect } from 'react'
import Link from 'next/link'
import BalanceCard from '@/components/BalanceCard'
import InsightsBar from '@/components/InsightsBar'
import GoalTracker from '@/components/GoalTracker'
import CreditCard from '@/components/CreditCard'
import TransactionInput from '@/components/TransactionInput'
import TransactionsList from '@/components/TransactionsList'
import SideMenu from '@/components/SideMenu'
import useFinanceStore from '@/lib/store'
import Icon from '@/components/Icon'
import { isWednesday, formatCurrency } from '@/lib/utils'

export default function Home() {
  const [showInput,    setShowInput]    = useState(false)
  const [showTiktok,   setShowTiktok]   = useState(false)
  const [tiktokAmount, setTiktokAmount] = useState('')
  const [hidden,       setHidden]       = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)

  const load           = useFinanceStore(s => s.load)
  const transactions   = useFinanceStore(s => s.transactions)
  const addTransaction = useFinanceStore(s => s.addTransaction)

  useEffect(() => {
    load().then(() => {
      // Só mostra o modal na quarta-feira E se ainda não teve entrada de TikTok hoje
      if (!isWednesday()) return

      const today = new Date().toISOString().split('T')[0]

      // Checa no banco de dados: já existe transação TikTok hoje?
      const store = useFinanceStore.getState()
      const jaTemHoje = store.transactions.some(
        t => t.category === 'TikTok Shop' && t.date === today
      )

      if (!jaTemHoje) setShowTiktok(true)
    })
  }, [])

  // Re-checa assim que as transações carregarem (sync assíncrono)
  useEffect(() => {
    if (!isWednesday()) return
    const today = new Date().toISOString().split('T')[0]
    const jaTemHoje = transactions.some(
      t => t.category === 'TikTok Shop' && t.date === today
    )
    if (jaTemHoje) setShowTiktok(false)
  }, [transactions])

  const handleTiktok = () => {
    const val = parseFloat(tiktokAmount.replace(',', '.'))
    if (val > 0) {
      addTransaction({
        type: 'income',
        category: 'TikTok Shop',
        amount: val,
        description: 'Rendimento semanal TikTok Shop',
        date: new Date().toISOString().split('T')[0],
      })
    }
    setShowTiktok(false)
    setTiktokAmount('')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F8F6' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid #E5E3D8' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight" style={{ color: '#292615' }}>niggan</h1>
            <p className="text-xs" style={{ color: '#A8A79E' }}>controle financeiro</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHidden(h => !h)}
              className="w-9 h-9 rounded-xl flex items-center justify-center pressable transition-all"
              style={{ background: hidden ? '#3D3822' : '#F0EFE9' }}>
              <Icon name={hidden ? 'eye' : 'eyeOff'} size={16} color={hidden ? '#F0D98A' : '#857A50'} />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1 pressable"
              style={{ background: '#F0EFE9' }}>
              <span className="block w-4 h-0.5 rounded-full" style={{ background: '#6B6140' }} />
              <span className="block w-4 h-0.5 rounded-full" style={{ background: '#6B6140' }} />
              <span className="block w-3 h-0.5 rounded-full" style={{ background: '#6B6140' }} />
            </button>
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
            className="py-3.5 rounded-2xl font-semibold text-sm transition-all pressable flex items-center justify-center gap-2"
            style={showInput
              ? { background: '#F0EFE9', color: '#857A50' }
              : { background: '#3D3822', color: '#F0D98A', boxShadow: '0 4px 16px rgba(61,56,34,0.3)' }}>
            <Icon name={showInput ? 'close' : 'plus'} size={15} color={showInput ? '#857A50' : '#F0D98A'} />
            {showInput ? 'Fechar' : 'Nova transação'}
          </button>
          <Link href="/cofres"
            className="py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 pressable"
            style={{ background: '#fff', color: '#544C31', border: '1.5px solid #D8D4B8' }}>
            <Icon name="safe" size={15} color="#544C31" />
            Cofres
          </Link>
        </div>

        {showInput && (
          <div className="mx-4 mb-3 rounded-2xl overflow-hidden shadow-card animate-slide-up"
            style={{ background: '#fff', border: '1px solid #F0EFE9' }}>
            <TransactionInput onSubmit={() => setShowInput(false)} />
          </div>
        )}

        <div className="px-4 mb-2 mt-2 flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(135deg, #544C31, #3D3822)' }} />
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B6140' }}>Histórico</p>
        </div>

        <TransactionsList hidden={hidden} />
      </main>

      <div className="px-4 pb-6 text-center">
        <Link href="/settings" className="text-xs pressable" style={{ color: '#C8C5B8' }}>
          Configurações
        </Link>
      </div>

      {/* Side Menu */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* TikTok modal */}
      {showTiktok && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full rounded-t-3xl p-6 animate-slide-up" style={{ background: '#fff' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#E5E3D8' }} />
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#FDF2F8', border: '1px solid #FBCFE8' }}>
                <Icon name="tiktok" size={26} color="#EC4899" />
              </div>
              <h2 className="font-display font-bold text-xl" style={{ color: '#292615' }}>TikTok Shop</h2>
              <p className="text-sm mt-1" style={{ color: '#A8A79E' }}>Quarta-feira! Quanto entrou essa semana?</p>
            </div>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: '#A8A79E' }}>R$</span>
              <input type="number" step="0.01" min="0" value={tiktokAmount}
                onChange={e => setTiktokAmount(e.target.value)}
                placeholder="0,00" inputMode="decimal" autoFocus
                className="w-full pl-10 pr-4 py-4 text-xl font-bold rounded-2xl tabular"
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
