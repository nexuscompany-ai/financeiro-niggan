import { useState } from 'react'
import useFinanceStore, { CreditCardPurchase } from '@/lib/store'
import { formatCurrency, EXPENSE_CATEGORIES } from '@/lib/utils'

const CARD_STYLES = {
  C6: { bg: 'from-neutral-800 to-neutral-950', accent: 'text-yellow-400', border: 'border-yellow-500/30', badge: 'bg-yellow-400 text-neutral-900' },
  Nubank: { bg: 'from-purple-700 to-purple-950', accent: 'text-white', border: 'border-purple-400/30', badge: 'bg-white text-purple-900' },
}

export default function CreditCard({ hidden = false }: { hidden?: boolean }) {
  const creditCardPurchases = useFinanceStore(s => s.creditCardPurchases)
  const addCreditCardPurchase = useFinanceStore(s => s.addCreditCardPurchase)
  const removeCreditCardPurchase = useFinanceStore(s => s.removeCreditCardPurchase)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)

  const [showForm, setShowForm] = useState(false)
  const [selectedCard, setSelectedCard] = useState<'C6' | 'Nubank'>('C6')
  const [expandedCard, setExpandedCard] = useState<'C6' | 'Nubank' | null>(null)
  const [form, setForm] = useState({ description: '', totalAmount: '', installments: '1', category: EXPENSE_CATEGORIES[0], card: 'C6' as 'C6' | 'Nubank' })
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)

  const totalC6 = getCreditCardTotal('C6')
  const totalNu = getCreditCardTotal('Nubank')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(form.totalAmount.replace(',', '.'))
    const inst = parseInt(form.installments)
    if (!total || total <= 0 || !form.description.trim()) return

    addCreditCardPurchase({
      card: form.card,
      description: form.description.trim(),
      totalAmount: total,
      installments: inst,
      currentInstallment: 1,
      monthlyAmount: parseFloat((total / inst).toFixed(2)),
      startDate: new Date().toISOString().split('T')[0],
      category: form.category,
    })
    setForm({ description: '', totalAmount: '', installments: '1', category: EXPENSE_CATEGORIES[0], card: 'C6' })
    setShowForm(false)
  }

  const cardPurchases = (card: 'C6' | 'Nubank') =>
    creditCardPurchases.filter(p => p.card === card)

  const dueDate = (card: 'C6' | 'Nubank') => {
    const now = new Date()
    const day = card === 'C6' ? 1 : 10
    const next = new Date(now.getFullYear(), now.getMonth() + 1, day)
    return next.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  }

  return (
    <div className="px-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-neutral-500 uppercase">Cartões de Crédito</p>
        <button onClick={() => setShowForm(!showForm)}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${showForm ? 'bg-neutral-200 text-neutral-600' : 'bg-olive-700 text-white'}`}>
          {showForm ? '✕ Fechar' : '+ Parcela'}
        </button>
      </div>

      {/* Formulário de nova parcela */}
      {showForm && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-3 animate-slide-up">
          <p className="text-sm font-bold text-neutral-700 mb-3">Nova compra parcelada</p>
          <form onSubmit={handleAdd} className="space-y-2">
            {/* Cartão */}
            <div className="flex gap-2">
              {(['C6', 'Nubank'] as const).map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, card: c }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.card === c ? (c === 'C6' ? 'bg-neutral-800 text-yellow-400' : 'bg-purple-700 text-white') : 'bg-neutral-100 text-neutral-500'}`}>
                  {c === 'C6' ? '⚫ C6' : '🟣 Nubank'}
                </button>
              ))}
            </div>
            {/* Descrição */}
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição da compra"
              className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400" />
            {/* Valor + Parcelas */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                <input type="number" step="0.01" min="0" value={form.totalAmount}
                  onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
                  placeholder="0,00" inputMode="decimal"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-100 rounded-lg text-sm font-bold border-2 border-transparent focus:border-olive-400" />
              </div>
              <div className="relative w-28">
                <select value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400 cursor-pointer">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n}x {n > 1 && form.totalAmount ? `R$ ${(parseFloat(form.totalAmount||'0')/n).toFixed(2)}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Categoria */}
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 bg-neutral-100 rounded-lg text-sm border-2 border-transparent focus:border-olive-400 cursor-pointer">
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {form.totalAmount && parseInt(form.installments) > 1 && (
              <div className="bg-olive-50 rounded-lg px-3 py-2">
                <p className="text-xs text-olive-700">
                  {form.installments}x de {formatCurrency(parseFloat(form.totalAmount || '0') / parseInt(form.installments))} · Total: {formatCurrency(parseFloat(form.totalAmount || '0'))}
                </p>
              </div>
            )}

            <button type="submit"
              className="w-full py-2.5 bg-olive-700 text-white rounded-lg font-bold text-sm">
              ✅ Adicionar ao cartão {form.card}
            </button>
          </form>
        </div>
      )}

      {/* Cards dos cartões */}
      <div className="space-y-3">
        {(['C6', 'Nubank'] as const).map(card => {
          const style = CARD_STYLES[card]
          const total = card === 'C6' ? totalC6 : totalNu
          const purchases = cardPurchases(card)
          const isExpanded = expandedCard === card

          return (
            <div key={card} className={`bg-gradient-to-br ${style.bg} rounded-2xl overflow-hidden border ${style.border}`}>
              {/* Card visual */}
              <div onClick={() => setExpandedCard(isExpanded ? null : card)}
                className="p-4 cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-xs font-bold ${style.badge} px-2 py-0.5 rounded-full`}>{card}</span>
                    <p className="text-white/50 text-xs mt-2">Vence {dueDate(card)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs mb-1">Fatura atual</p>
                    <p className={`text-xl font-bold ${total > 0 ? 'text-red-300' : 'text-green-300'}`}>
                      {hidden ? '••••' : formatCurrency(total)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/40 text-xs">{purchases.length} compra{purchases.length !== 1 ? 's' : ''}</p>
                  <p className="text-white/40 text-xs">{isExpanded ? '▲' : '▼'} detalhes</p>
                </div>
              </div>

              {/* Compras expandidas */}
              {isExpanded && purchases.length > 0 && (
                <div className="bg-black/20 border-t border-white/10">
                  {purchases.map(p => (
                    <div key={p.id} className="px-4 py-3 flex items-center justify-between border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-white truncate">{p.description}</p>
                        <p className="text-xs text-white/40">
                          {p.installments > 1 ? `${p.currentInstallment}/${p.installments}x ` : ''}{p.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-red-300">{fmt(p.monthlyAmount)}</p>
                        {confirmRemove === p.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => { removeCreditCardPurchase(p.id); setConfirmRemove(null) }}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">Sim</button>
                            <button onClick={() => setConfirmRemove(null)}
                              className="text-xs bg-white/20 text-white px-2 py-1 rounded-lg">Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmRemove(p.id)}
                            className="text-white/30 hover:text-white/60 text-lg leading-none">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && purchases.length === 0 && (
                <div className="bg-black/20 border-t border-white/10 px-4 py-4 text-center">
                  <p className="text-white/30 text-sm">Nenhuma compra registrada</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
