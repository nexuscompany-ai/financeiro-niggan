import { useState } from 'react'
import useFinanceStore, { CreditCardPurchase } from '@/lib/store'
import { formatCurrency, EXPENSE_CATEGORIES } from '@/lib/utils'

export default function CreditCard({ hidden = false }: { hidden?: boolean }) {
  const creditCardPurchases = useFinanceStore(s => s.creditCardPurchases)
  const addCreditCardPurchase = useFinanceStore(s => s.addCreditCardPurchase)
  const removeCreditCardPurchase = useFinanceStore(s => s.removeCreditCardPurchase)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)

  const [showForm, setShowForm] = useState(false)
  const [expandedCard, setExpandedCard] = useState<'C6' | 'Nubank' | null>(null)
  const [form, setForm] = useState({ description: '', totalAmount: '', installments: '1', category: EXPENSE_CATEGORIES[0], card: 'C6' as 'C6' | 'Nubank' })
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const fmt = (v: number) => hidden ? '•••••' : formatCurrency(v)
  const totalC6 = getCreditCardTotal('C6')
  const totalNu = getCreditCardTotal('Nubank')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(form.totalAmount.replace(',', '.'))
    const inst = parseInt(form.installments)
    if (!total || total <= 0 || !form.description.trim()) return
    addCreditCardPurchase({
      card: form.card, description: form.description.trim(),
      totalAmount: total, installments: inst, currentInstallment: 1,
      monthlyAmount: parseFloat((total / inst).toFixed(2)),
      startDate: new Date().toISOString().split('T')[0], category: form.category,
    })
    setForm({ description: '', totalAmount: '', installments: '1', category: EXPENSE_CATEGORIES[0], card: 'C6' })
    setShowForm(false)
  }

  const dueDate = (card: 'C6' | 'Nubank') => {
    const now = new Date()
    const day = card === 'C6' ? 1 : 10
    return new Date(now.getFullYear(), now.getMonth() + 1, day)
      .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  const cardPurchases = (card: 'C6' | 'Nubank') => creditCardPurchases.filter(p => p.card === card)

  return (
    <div className="px-4 mb-3">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(135deg, #544C31, #3D3822)' }} />
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B6140' }}>Cartões</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all pressable"
          style={{ background: showForm ? '#F0EFE9' : '#3D3822', color: showForm ? '#544C31' : '#F0D98A' }}>
          {showForm ? '✕ Fechar' : '+ Nova parcela'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-card animate-slide-up border border-surface-2">
          <p className="font-display font-semibold text-sm mb-3" style={{ color: '#292615' }}>Nova compra parcelada</p>
          <form onSubmit={handleAdd} className="space-y-2.5">
            {/* Card selector */}
            <div className="flex gap-2">
              {(['C6', 'Nubank'] as const).map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, card: c }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all pressable"
                  style={form.card === c
                    ? { background: c === 'C6' ? '#0d0d0d' : '#820AD1', color: c === 'C6' ? '#C9A84C' : '#fff' }
                    : { background: '#F0EFE9', color: '#857A50' }}>
                  {c === 'C6' ? '⬛ C6 Black' : '🟣 Nubank'}
                </button>
              ))}
            </div>

            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição da compra"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#F8F8F6', border: '1.5px solid #E5E3D8' }} />

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#A8A79E' }}>R$</span>
                <input type="number" step="0.01" min="0" value={form.totalAmount}
                  onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
                  placeholder="0,00" inputMode="decimal"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none"
                  style={{ background: '#F8F8F6', border: '1.5px solid #E5E3D8' }} />
              </div>
              <select value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))}
                className="w-28 px-3 py-3 rounded-xl text-sm outline-none cursor-pointer"
                style={{ background: '#F8F8F6', border: '1.5px solid #E5E3D8' }}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <option key={n} value={n}>{n}x {n > 1 && form.totalAmount ? `${formatCurrency(parseFloat(form.totalAmount||'0')/n)}` : ''}</option>
                ))}
              </select>
            </div>

            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: '#F8F8F6', border: '1.5px solid #E5E3D8' }}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {form.totalAmount && parseInt(form.installments) > 1 && (
              <div className="rounded-xl px-4 py-2.5" style={{ background: '#EDEBD8' }}>
                <p className="text-xs font-medium" style={{ color: '#544C31' }}>
                  {form.installments}× de {formatCurrency(parseFloat(form.totalAmount||'0')/parseInt(form.installments))}
                  <span style={{ color: '#A09868' }}> · Total {formatCurrency(parseFloat(form.totalAmount||'0'))}</span>
                </p>
              </div>
            )}

            <button type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all pressable"
              style={{ background: '#3D3822', color: '#F0D98A' }}>
              Confirmar
            </button>
          </form>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {[
          { card: 'C6' as const, total: totalC6, cls: 'card-c6', nameColor: '#C9A84C', totalColor: '#F87171', nameFull: 'C6 Bank · Black' },
          { card: 'Nubank' as const, total: totalNu, cls: 'card-nubank', nameColor: '#E9B8FF', totalColor: '#F87171', nameFull: 'Nubank · Roxo' },
        ].map(({ card, total, cls, nameColor, totalColor, nameFull }) => {
          const purchases = cardPurchases(card)
          const isExpanded = expandedCard === card

          return (
            <div key={card} className={`${cls} rounded-2xl overflow-hidden`} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <div onClick={() => setExpandedCard(isExpanded ? null : card)} className="p-5 cursor-pointer pressable">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {/* Card chip simulation */}
                    <div className="w-8 h-6 rounded-sm mb-3 opacity-80"
                      style={{ background: card === 'C6' ? 'linear-gradient(135deg, #C9A84C, #F0D98A)' : 'rgba(255,255,255,0.3)' }} />
                    <p className="font-display font-semibold text-sm" style={{ color: nameColor }}>{nameFull}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Vence {dueDate(card)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Fatura</p>
                    <p className="font-display font-bold text-xl tabular" style={{ color: total > 0 ? totalColor : '#4ADE80' }}>
                      {fmt(total)}
                    </p>
                  </div>
                </div>

                {/* Fake card number */}
                <div className="flex justify-between items-end">
                  <p className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>•••• •••• •••• ••••</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{purchases.length} compra{purchases.length !== 1 ? 's' : ''}</p>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>

              {/* Purchases */}
              {isExpanded && (
                <div style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {purchases.length === 0 ? (
                    <p className="text-center py-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhuma compra</p>
                  ) : purchases.map(p => (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-white truncate">{p.description}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {p.installments > 1 ? `${p.currentInstallment}/${p.installments}× · ` : ''}{p.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold tabular text-sm" style={{ color: '#F87171' }}>{fmt(p.monthlyAmount)}</p>
                        {confirmRemove === p.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => { removeCreditCardPurchase(p.id); setConfirmRemove(null) }}
                              className="text-xs px-2 py-1 rounded-lg font-semibold pressable"
                              style={{ background: '#C0392B', color: '#fff' }}>Sim</button>
                            <button onClick={() => setConfirmRemove(null)}
                              className="text-xs px-2 py-1 rounded-lg pressable"
                              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmRemove(p.id)}
                            className="text-lg leading-none pressable"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>×</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
