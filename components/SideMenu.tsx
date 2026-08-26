import { useState, useMemo } from 'react'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

// ─── CONTAS A PAGAR ──────────────────────────────────────────────
interface Bill {
  id: string
  description: string
  amount: number
  dueDay: number       // dia do mês
  category: string
  recurring: boolean
}

const INITIAL_BILLS: Bill[] = [
  { id:'b1', description:'Internet VIVO',   amount:65.33, dueDay:20, category:'Internet', recurring:true  },
  { id:'b2', description:'Spotify',          amount:23.90, dueDay:26, category:'Assinatura', recurring:true },
  { id:'b3', description:'Seguro Conta C6',  amount:10.00, dueDay:28, category:'Banco',    recurring:true  },
]

// ─── CALCULADORA DE INVESTIMENTO ─────────────────────────────────
const INCOME_SOURCES = [
  { key:'Salário FGL Brasil', label:'Salário FGL', color:'#3B82F6', icon:'briefcase' },
  { key:'Contratos FGL',      label:'Contratos FGL', color:'#F59E0B', icon:'tool' },
  { key:'TikTok Shop',         label:'TikTok Shop', color:'#EC4899', icon:'tiktok' },
  { key:'F7 Empresa',          label:'F7 Empresa',  color:'#8B5CF6', icon:'building' },
]

type Section = 'bills' | 'cards' | 'calc'

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const transactions        = useFinanceStore(s => s.transactions)
  const getCreditCardTotal  = useFinanceStore(s => s.getCreditCardTotal)
  const creditCardPurchases = useFinanceStore(s => s.creditCardPurchases)

  const [section,    setSection]    = useState<Section>('bills')
  const [bills,      setBills]      = useState<Bill[]>(INITIAL_BILLS)
  const [billMonth,  setBillMonth]  = useState(0) // 0 = mês atual, 1 = próximo, 2 = +2
  const [showAddBill,setShowAddBill]= useState(false)
  const [newBill,    setNewBill]    = useState({ description:'', amount:'', dueDay:'', category:'Outros' })

  // Calc state
  const [calcSource,   setCalcSource]   = useState(INCOME_SOURCES[0].key)
  const [calcTotal,    setCalcTotal]    = useState('')
  const [calcInvest,   setCalcInvest]   = useState('')
  const [calcResult,   setCalcResult]   = useState<null|{ remaining:number; invested:number; pct:number }>(null)

  // ── Contas a pagar ─────────────────────────────────────
  const now         = new Date()
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + billMonth, 1)
  const monthLabel  = targetMonth.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})

  const billsForMonth = useMemo(()=>{
    return bills
      .filter(b => b.recurring)
      .map(b => {
        const due = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), b.dueDay)
        const isPast = billMonth === 0 && due < now && due.getMonth() === now.getMonth()
        return { ...b, dueDate: due, isPast }
      })
      .sort((a,b)=>a.dueDay-b.dueDay)
  },[bills, billMonth])

  const totalBills = billsForMonth.reduce((s,b)=>s+b.amount,0)

  const addBill = () => {
    const val = parseFloat(newBill.amount.replace(',','.'))
    const day = parseInt(newBill.dueDay)
    if (!newBill.description.trim() || !val || !day) return
    setBills(prev=>[...prev,{
      id:`b-${Date.now()}`, description:newBill.description.trim(),
      amount:val, dueDay:day, category:newBill.category, recurring:true
    }])
    setNewBill({ description:'', amount:'', dueDay:'', category:'Outros' })
    setShowAddBill(false)
  }

  // ── Cartões ────────────────────────────────────────────
  const totalC6 = getCreditCardTotal('C6')
  const totalNu = getCreditCardTotal('Nubank')
  const totalCC = totalC6 + totalNu

  const c6Purchases = creditCardPurchases.filter(p=>p.card==='C6')
  const nuPurchases = creditCardPurchases.filter(p=>p.card==='Nubank')

  // ── Calculadora ────────────────────────────────────────
  const handleCalc = () => {
    const total   = parseFloat(calcTotal.replace(',','.'))
    const invest  = parseFloat(calcInvest.replace(',','.'))
    if (!total || !invest || invest > total) return
    const remaining = total - invest
    const pct       = Math.round((invest / total) * 100)
    setCalcResult({ remaining, invested: invest, pct })
  }

  const resetCalc = () => {
    setCalcTotal(''); setCalcInvest(''); setCalcResult(null)
  }

  // Source income this month
  const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  const sourceIncome = (key: string) => transactions
    .filter(t=>t.type==='income'&&t.category===key&&t.date>=startOfMonth)
    .reduce((s,t)=>s+t.amount,0)

  const selectedSource = INCOME_SOURCES.find(s=>s.key===calcSource)!
  const autoIncome     = sourceIncome(calcSource)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col animate-slide-left"
        style={{ width:'92vw', maxWidth:'380px', background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid #F0EFE9' }}>
          <div>
            <p className="font-display font-bold text-lg" style={{ color:'#292615' }}>Menu</p>
            <p className="text-xs" style={{ color:'#A8A79E' }}>Ferramentas financeiras</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center pressable"
            style={{ background:'#F0EFE9' }}>
            <Icon name="close" size={16} color="#6B6140" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-4 py-3" style={{ borderBottom:'1px solid #F0EFE9' }}>
          {[
            { key:'bills' as Section, label:'Contas', icon:'zap'       },
            { key:'cards' as Section, label:'Cartões', icon:'creditCard' },
            { key:'calc'  as Section, label:'Investir', icon:'invest'    },
          ].map(tab=>(
            <button key={tab.key} onClick={()=>setSection(tab.key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all pressable"
              style={section===tab.key
                ? { background:'#3D3822', color:'#F0D98A' }
                : { background:'#F8F8F6', color:'#A8A79E' }}>
              <Icon name={tab.icon} size={14} color={section===tab.key?'#F0D98A':'#C8C5B8'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth:'none' }}>

          {/* ── CONTAS A PAGAR ── */}
          {section==='bills' && (
            <div className="space-y-4">
              {/* Month selector */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold capitalize" style={{ color:'#6B6140' }}>{monthLabel}</p>
                <div className="flex gap-1">
                  {[0,1,2].map(m=>(
                    <button key={m} onClick={()=>setBillMonth(m)}
                      className="px-3 py-1 rounded-full text-xs font-semibold pressable"
                      style={billMonth===m
                        ? { background:'#3D3822', color:'#F0D98A' }
                        : { background:'#F0EFE9', color:'#857A50' }}>
                      {m===0?'Atual':m===1?'+1':'+2'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-2xl p-4" style={{ background:'#F8F8F6', border:'1px solid #F0EFE9' }}>
                <p className="text-xs font-medium mb-1" style={{ color:'#A8A79E' }}>Total a pagar</p>
                <p className="font-display font-bold text-2xl tabular" style={{ color:'#C0392B' }}>
                  {formatCurrency(totalBills)}
                </p>
                <p className="text-xs mt-1" style={{ color:'#C8C5B8' }}>{billsForMonth.length} conta{billsForMonth.length!==1?'s':''}</p>
              </div>

              {/* Bills list */}
              <div className="space-y-2">
                {billsForMonth.map(b=>(
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl pressable"
                    style={{ background:'#fff', border:'1px solid #F0EFE9', opacity:b.isPast?0.5:1 }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background:b.isPast?'#F0F0F0':'#FEF9EE', border:`1px solid ${b.isPast?'#E5E3D8':'#FDE68A'}` }}>
                        <Icon name="zap" size={14} color={b.isPast?'#C8C5B8':'#F59E0B'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color:'#1A1A14' }}>{b.description}</p>
                        <p className="text-xs" style={{ color:'#A8A79E' }}>
                          Dia {b.dueDay} · {b.category}
                          {b.isPast && <span style={{ color:'#86EFAC' }}> · Pago</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>
                        {formatCurrency(b.amount)}
                      </p>
                      <button onClick={()=>setBills(prev=>prev.filter(x=>x.id!==b.id))}
                        className="w-6 h-6 flex items-center justify-center pressable">
                        <Icon name="close" size={12} color="#C8C5B8" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add bill */}
              {showAddBill ? (
                <div className="rounded-2xl p-4 space-y-2.5" style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }}>
                  <p className="text-xs font-semibold" style={{ color:'#6B6140' }}>Nova conta</p>
                  <input placeholder="Descrição" value={newBill.description}
                    onChange={e=>setNewBill(p=>({...p,description:e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$</span>
                      <input type="number" placeholder="0,00" value={newBill.amount}
                        onChange={e=>setNewBill(p=>({...p,amount:e.target.value}))}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} inputMode="decimal" />
                    </div>
                    <div className="relative w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>Dia</span>
                      <input type="number" min="1" max="31" placeholder="--" value={newBill.dueDay}
                        onChange={e=>setNewBill(p=>({...p,dueDay:e.target.value}))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} inputMode="numeric" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowAddBill(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium pressable"
                      style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                    <button onClick={addBill}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold pressable"
                      style={{ background:'#3D3822', color:'#F0D98A' }}>Adicionar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setShowAddBill(true)}
                  className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 pressable"
                  style={{ background:'#F0EFE9', color:'#6B6140', border:'1.5px dashed #D8D4B8' }}>
                  <Icon name="plus" size={14} color="#6B6140" />
                  Adicionar conta
                </button>
              )}
            </div>
          )}

          {/* ── CARTÕES ── */}
          {section==='cards' && (
            <div className="space-y-4">
              {/* Total geral */}
              <div className="rounded-2xl p-4" style={{ background:'#F8F8F6', border:'1px solid #F0EFE9' }}>
                <p className="text-xs font-medium mb-1" style={{ color:'#A8A79E' }}>Total em cartões</p>
                <p className="font-display font-bold text-2xl tabular" style={{ color:'#C0392B' }}>
                  {formatCurrency(totalCC)}
                </p>
                <div className="flex gap-3 mt-2">
                  <div className="h-1.5 rounded-full flex-1" style={{ background:'#F0EFE9' }}>
                    <div className="h-1.5 rounded-full"
                      style={{ width:`${totalCC>0?Math.round((totalC6/totalCC)*100):0}%`, background:'#1a1a1a' }} />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs" style={{ color:'#A8A79E' }}>C6 {totalCC>0?Math.round((totalC6/totalCC)*100):0}%</p>
                  <p className="text-xs" style={{ color:'#A8A79E' }}>Nubank {totalCC>0?Math.round((totalNu/totalCC)*100):0}%</p>
                </div>
              </div>

              {/* C6 */}
              <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #F0EFE9' }}>
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background:'#1a1a1a' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color:'#C9A84C' }}>C6 Black</p>
                    <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Vence dia 1</p>
                  </div>
                  <p className="font-display font-bold text-lg tabular" style={{ color:totalC6>0?'#F87171':'#4ADE80' }}>
                    {formatCurrency(totalC6)}
                  </p>
                </div>
                {c6Purchases.length===0 ? (
                  <p className="px-4 py-3 text-xs" style={{ color:'#C8C5B8' }}>Nenhuma compra</p>
                ) : c6Purchases.map(p=>(
                  <div key={p.id} className="flex justify-between items-center px-4 py-2.5"
                    style={{ borderTop:'1px solid #F0EFE9' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color:'#1A1A14' }}>{p.description}</p>
                      <p className="text-xs" style={{ color:'#A8A79E' }}>
                        {p.installments>1?`${p.currentInstallment}/${p.installments}× · `:''}{p.category}
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>{formatCurrency(p.monthlyAmount)}</p>
                  </div>
                ))}
              </div>

              {/* Nubank */}
              <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #F0EFE9' }}>
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background:'#820AD1' }}>
                  <div>
                    <p className="text-xs font-semibold text-white">Nubank</p>
                    <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>Vence dia 10</p>
                  </div>
                  <p className="font-display font-bold text-lg tabular" style={{ color:totalNu>0?'#F87171':'#4ADE80' }}>
                    {formatCurrency(totalNu)}
                  </p>
                </div>
                {nuPurchases.length===0 ? (
                  <p className="px-4 py-3 text-xs" style={{ color:'#C8C5B8' }}>Nenhuma compra</p>
                ) : nuPurchases.map(p=>(
                  <div key={p.id} className="flex justify-between items-center px-4 py-2.5"
                    style={{ borderTop:'1px solid #F0EFE9' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color:'#1A1A14' }}>{p.description}</p>
                      <p className="text-xs" style={{ color:'#A8A79E' }}>
                        {p.installments>1?`${p.currentInstallment}/${p.installments}× · `:''}{p.category}
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>{formatCurrency(p.monthlyAmount)}</p>
                  </div>
                ))}
              </div>

              {/* Total breakdown */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background:'#F8F8F6' }}>
                <div className="flex justify-between">
                  <p className="text-sm font-medium" style={{ color:'#6B6A60' }}>C6 Black</p>
                  <p className="text-sm font-bold tabular" style={{ color:'#1A1A14' }}>{formatCurrency(totalC6)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium" style={{ color:'#6B6A60' }}>Nubank</p>
                  <p className="text-sm font-bold tabular" style={{ color:'#1A1A14' }}>{formatCurrency(totalNu)}</p>
                </div>
                <div className="pt-2 flex justify-between" style={{ borderTop:'1px solid #E5E3D8' }}>
                  <p className="text-sm font-bold" style={{ color:'#292615' }}>Total</p>
                  <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>{formatCurrency(totalCC)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── CALCULADORA DE INVESTIMENTO ── */}
          {section==='calc' && (
            <div className="space-y-4">
              {/* Info */}
              <div className="rounded-2xl p-4" style={{ background:'#F0EFE9', border:'1px solid #D8D4B8' }}>
                <div className="flex items-start gap-2.5">
                  <Icon name="invest" size={16} color="#6B6140" />
                  <div>
                    <p className="text-xs font-semibold" style={{ color:'#3D3822' }}>Simulador de aporte</p>
                    <p className="text-xs mt-0.5" style={{ color:'#857A50' }}>
                      Simule quanto investir de cada fonte de renda sem comprometer o saldo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fonte de renda */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'#6B6140' }}>Fonte de renda</p>
                <div className="grid grid-cols-2 gap-2">
                  {INCOME_SOURCES.map(src=>{
                    const monthIncome = sourceIncome(src.key)
                    const isSelected  = calcSource===src.key
                    return (
                      <button key={src.key} onClick={()=>{setCalcSource(src.key);resetCalc()}}
                        className="p-3 rounded-xl text-left transition-all pressable"
                        style={isSelected
                          ? { background:src.color+'18', border:`1.5px solid ${src.color}` }
                          : { background:'#fff', border:'1.5px solid #F0EFE9' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background:src.color+'20' }}>
                            <Icon name={src.icon} size={12} color={src.color} />
                          </div>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ background:src.color }} />}
                        </div>
                        <p className="text-xs font-semibold" style={{ color:isSelected?src.color:'#6B6A60' }}>{src.label}</p>
                        <p className="text-xs tabular mt-0.5" style={{ color:isSelected?src.color:'#C8C5B8' }}>
                          {monthIncome>0 ? formatCurrency(monthIncome) : 'Sem entrada'}
                        </p>
                      </button>
                    )
                  })}
                </div>
                {autoIncome>0 && (
                  <button onClick={()=>setCalcTotal(autoIncome.toFixed(2))}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-semibold pressable flex items-center justify-center gap-1.5"
                    style={{ background:'#F0EFE9', color:'#6B6140', border:'1px dashed #D8D4B8' }}>
                    <Icon name="arrowDown" size={12} color="#6B6140" />
                    Usar valor recebido este mês ({formatCurrency(autoIncome)})
                  </button>
                )}
              </div>

              {/* Inputs */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'#6B6140' }}>Valor disponível</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color:'#A8A79E' }}>R$</span>
                  <input type="number" step="0.01" min="0" value={calcTotal}
                    onChange={e=>{setCalcTotal(e.target.value);setCalcResult(null)}}
                    placeholder="0,00" inputMode="decimal"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-base font-bold tabular"
                    style={{ background:'#fff', border:'1.5px solid #E5E3D8', color:'#292615' }} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'#6B6140' }}>Quero investir</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color:'#A8A79E' }}>R$</span>
                  <input type="number" step="0.01" min="0" value={calcInvest}
                    onChange={e=>{setCalcInvest(e.target.value);setCalcResult(null)}}
                    placeholder="0,00" inputMode="decimal"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-base font-bold tabular"
                    style={{ background:'#fff', border:'1.5px solid #E5E3D8', color:'#292615' }} />
                </div>

                {/* % shortcuts */}
                {calcTotal && parseFloat(calcTotal)>0 && (
                  <div className="flex gap-2 mt-2">
                    {[10,20,30,50].map(pct=>(
                      <button key={pct} onClick={()=>{setCalcInvest((parseFloat(calcTotal)*pct/100).toFixed(2));setCalcResult(null)}}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold pressable"
                        style={{ background:'#F0EFE9', color:'#6B6140' }}>
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Calcular */}
              <button onClick={handleCalc}
                disabled={!calcTotal || !calcInvest || parseFloat(calcInvest)>parseFloat(calcTotal)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm pressable transition-all"
                style={{
                  background:(!calcTotal||!calcInvest||parseFloat(calcInvest)>parseFloat(calcTotal))?'#F0EFE9':'#3D3822',
                  color:(!calcTotal||!calcInvest||parseFloat(calcInvest)>parseFloat(calcTotal))?'#C8C5B8':'#F0D98A'
                }}>
                Calcular
              </button>

              {/* Resultado */}
              {calcResult && (
                <div className="rounded-2xl overflow-hidden animate-fade-in" style={{ border:`1.5px solid ${selectedSource.color}30` }}>
                  {/* Top */}
                  <div className="p-4" style={{ background:`${selectedSource.color}10` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background:`${selectedSource.color}20` }}>
                        <Icon name={selectedSource.icon} size={13} color={selectedSource.color} />
                      </div>
                      <p className="text-xs font-semibold" style={{ color:selectedSource.color }}>{selectedSource.label}</p>
                    </div>

                    {/* Barra visual */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        <p className="text-xs" style={{ color:'#A8A79E' }}>Investido</p>
                        <p className="text-xs font-bold tabular" style={{ color:selectedSource.color }}>{calcResult.pct}%</p>
                      </div>
                      <div className="h-2.5 rounded-full" style={{ background:'rgba(0,0,0,0.06)' }}>
                        <div className="h-2.5 rounded-full transition-all duration-700"
                          style={{ width:`${calcResult.pct}%`, background:selectedSource.color }} />
                      </div>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-2 divide-x" style={{ borderTop:`1px solid ${selectedSource.color}20` }}>
                    <div className="p-3 text-center">
                      <p className="text-xs mb-1" style={{ color:'#A8A79E' }}>Investido</p>
                      <p className="font-display font-bold text-base tabular" style={{ color:selectedSource.color }}>
                        {formatCurrency(calcResult.invested)}
                      </p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xs mb-1" style={{ color:'#A8A79E' }}>Restante</p>
                      <p className="font-display font-bold text-base tabular" style={{ color:'#2D7A4F' }}>
                        {formatCurrency(calcResult.remaining)}
                      </p>
                    </div>
                  </div>

                  <button onClick={resetCalc}
                    className="w-full py-2.5 text-xs font-medium pressable"
                    style={{ background:'#F8F8F6', color:'#A8A79E', borderTop:'1px solid #F0EFE9' }}>
                    Limpar simulação
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop:'1px solid #F0EFE9' }}>
          <p className="text-xs text-center" style={{ color:'#C8C5B8' }}>niggan · ferramentas financeiras</p>
        </div>
      </div>
    </>
  )
}
