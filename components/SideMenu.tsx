import { useState, useMemo } from 'react'
import useFinanceStore, { Bill, CreditCardPurchase } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

interface SideMenuProps { open: boolean; onClose: () => void }

type Section = 'bills' | 'cards' | 'calc'

const INCOME_SOURCES = [
  { key:'Salário FGL Brasil', label:'Salário FGL', color:'#3B82F6', icon:'briefcase' },
  { key:'Contratos FGL',       label:'Contratos FGL', color:'#F59E0B', icon:'tool'      },
  { key:'TikTok Shop',          label:'TikTok Shop',   color:'#EC4899', icon:'tiktok'    },
  { key:'F7 Empresa',           label:'F7 Empresa',    color:'#8B5CF6', icon:'building'  },
]

const BILL_CATEGORIES = ['Internet','Assinatura','Combustível','Pessoal','Saúde','Moradia','Alimentação','Outros']
const CC_CATEGORIES   = ['Lazer','Alimentação','Compras','Saúde','Assinatura','Outros']

function monthLabel(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}

// Calcula quantas parcelas restam a partir de hoje
function installmentsLeft(p: CreditCardPurchase): number {
  return p.installments - p.currentInstallment + 1
}

// Verifica se uma parcela ainda está ativa no mês offset (0=atual, 1=próximo, etc.)
function isActiveInMonth(p: CreditCardPurchase, offset: number): boolean {
  if (p.installments <= 1) return true   // à vista: aparece sempre
  const left = installmentsLeft(p)
  return left > offset
}

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const transactions           = useFinanceStore(s => s.transactions)
  const bills                  = useFinanceStore(s => s.bills)
  const creditCardPurchases    = useFinanceStore(s => s.creditCardPurchases)
  const getCreditCardTotal     = useFinanceStore(s => s.getCreditCardTotal)
  const addBill                = useFinanceStore(s => s.addBill)
  const updateBill             = useFinanceStore(s => s.updateBill)
  const removeBill             = useFinanceStore(s => s.removeBill)
  const addCreditCardPurchase  = useFinanceStore(s => s.addCreditCardPurchase)
  const updateCreditCardPurchase = useFinanceStore(s => s.updateCreditCardPurchase)
  const removeCreditCardPurchase = useFinanceStore(s => s.removeCreditCardPurchase)

  const [section,      setSection]      = useState<Section>('bills')
  const [billMonth,    setBillMonth]    = useState(0)
  const [showAddBill,  setShowAddBill]  = useState(false)
  const [editBill,     setEditBill]     = useState<Bill|null>(null)
  const [newBill,      setNewBill]      = useState({ description:'', amount:'', dueDay:'', category:'Internet', recurring:true })

  // Card form
  const [showAddCC,    setShowAddCC]    = useState(false)
  const [editCC,       setEditCC]       = useState<CreditCardPurchase|null>(null)
  const [ccForm,       setCCForm]       = useState({ description:'', totalAmount:'', installments:'1', category:CC_CATEGORIES[0], card:'C6' as 'C6'|'Nubank' })

  // Calc
  const [calcSource,   setCalcSource]   = useState(INCOME_SOURCES[0].key)
  const [calcTotal,    setCalcTotal]    = useState('')
  const [calcInvest,   setCalcInvest]   = useState('')
  const [calcResult,   setCalcResult]   = useState<{remaining:number;invested:number;pct:number}|null>(null)

  if (!open) return null

  const fmt = formatCurrency

  // ── Bills ────────────────────────────────────────────────────────────────
  const activeBills = bills.filter(b => b.active)
  const billsForMonth = useMemo(()=>{
    const now = new Date()
    return activeBills
      .filter(b => b.recurring)
      .map(b => {
        const targetDate = new Date(now.getFullYear(), now.getMonth()+billMonth, b.dueDay)
        const isPast = billMonth===0 && targetDate < now
        return { ...b, targetDate, isPast }
      })
      .sort((a,b)=>a.dueDay-b.dueDay)
  },[activeBills, billMonth])

  const totalBills = billsForMonth.reduce((s,b)=>s+b.amount,0)

  const saveBill = () => {
    const val = parseFloat(newBill.amount.replace(',','.'))
    const day = parseInt(newBill.dueDay)
    if (!newBill.description.trim()||!val||!day) return
    addBill({ description:newBill.description.trim(), amount:val, dueDay:day, category:newBill.category, recurring:newBill.recurring, active:true })
    setNewBill({ description:'', amount:'', dueDay:'', category:'Internet', recurring:true })
    setShowAddBill(false)
  }

  const saveEditBill = () => {
    if (!editBill) return
    updateBill(editBill.id, { description:editBill.description, amount:editBill.amount, dueDay:editBill.dueDay, category:editBill.category })
    setEditBill(null)
  }

  // ── Cards ────────────────────────────────────────────────────────────────
  const totalC6 = getCreditCardTotal('C6')
  const totalNu = getCreditCardTotal('Nubank')
  const totalCC = totalC6 + totalNu

  const cardsByCard = (card: 'C6'|'Nubank', offset=0) =>
    creditCardPurchases.filter(p=>p.card===card && isActiveInMonth(p, offset))

  const saveCC = () => {
    const total = parseFloat(ccForm.totalAmount.replace(',','.'))
    const inst  = parseInt(ccForm.installments)
    if (!total||total<=0||!ccForm.description.trim()) return
    const now = new Date()
    addCreditCardPurchase({
      card:ccForm.card, description:ccForm.description.trim(),
      totalAmount:total, installments:inst, currentInstallment:1,
      monthlyAmount:parseFloat((total/inst).toFixed(2)),
      startDate:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,
      category:ccForm.category,
    })
    setCCForm({ description:'', totalAmount:'', installments:'1', category:CC_CATEGORIES[0], card:'C6' })
    setShowAddCC(false)
  }

  const saveEditCC = () => {
    if (!editCC) return
    updateCreditCardPurchase(editCC.id, {
      description:editCC.description,
      monthlyAmount:editCC.monthlyAmount,
      installments:editCC.installments,
      currentInstallment:editCC.currentInstallment,
      category:editCC.category,
    })
    setEditCC(null)
  }

  // ── Calc ──────────────────────────────────────────────────────────────────
  const startOfMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split('T')[0]
  const sourceIncome = (key:string) => transactions.filter(t=>t.type==='income'&&t.category===key&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)
  const selectedSrc  = INCOME_SOURCES.find(s=>s.key===calcSource)!
  const autoIncome   = sourceIncome(calcSource)

  const handleCalc = () => {
    const total  = parseFloat(calcTotal.replace(',','.'))
    const invest = parseFloat(calcInvest.replace(',','.'))
    if (!total||!invest||invest>total) return
    setCalcResult({ remaining:total-invest, invested:invest, pct:Math.round((invest/total)*100) })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }} onClick={onClose} />

      <div className="fixed top-0 right-0 h-full z-50 flex flex-col animate-slide-left"
        style={{ width:'92vw', maxWidth:'380px', background:'#fff', boxShadow:'-8px 0 48px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid #F0EFE9' }}>
          <div>
            <p className="font-display font-bold text-lg" style={{ color:'#292615' }}>Menu</p>
            <p className="text-xs" style={{ color:'#A8A79E' }}>Ferramentas financeiras</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center pressable" style={{ background:'#F0EFE9' }}>
            <Icon name="close" size={16} color="#6B6140" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3" style={{ borderBottom:'1px solid #F0EFE9' }}>
          {([
            { key:'bills' as Section, label:'Contas',  icon:'zap'        },
            { key:'cards' as Section, label:'Cartões', icon:'creditCard'  },
            { key:'calc'  as Section, label:'Investir',icon:'invest'      },
          ] as const).map(tab=>(
            <button key={tab.key} onClick={()=>setSection(tab.key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all pressable"
              style={section===tab.key ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F8F8F6', color:'#A8A79E' }}>
              <Icon name={tab.icon} size={14} color={section===tab.key?'#F0D98A':'#C8C5B8'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth:'none' }}>

          {/* ════ CONTAS A PAGAR ════ */}
          {section==='bills' && (<>

            {/* Month filter */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold capitalize" style={{ color:'#6B6140' }}>{monthLabel(billMonth)}</p>
              <div className="flex gap-1">
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setBillMonth(m)}
                    className="px-3 py-1 rounded-full text-xs font-semibold pressable"
                    style={billMonth===m ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F0EFE9', color:'#857A50' }}>
                    {m===0?'Atual':m===1?'+1':'+2'}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-2xl p-4" style={{ background:'#FCECEA', border:'1px solid #FCA5A5' }}>
              <p className="text-xs font-medium mb-1" style={{ color:'#C0392B' }}>Total a pagar</p>
              <p className="font-display font-bold text-2xl tabular" style={{ color:'#C0392B' }}>{fmt(totalBills)}</p>
              <p className="text-xs mt-1" style={{ color:'#FCA5A5' }}>{billsForMonth.length} conta{billsForMonth.length!==1?'s':''}</p>
            </div>

            {/* List */}
            <div className="space-y-2">
              {billsForMonth.map(b=>(
                <div key={b.id}>
                  {editBill?.id===b.id ? (
                    /* Edit mode */
                    <div className="rounded-2xl p-3 space-y-2" style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8' }}>
                      <p className="text-xs font-semibold" style={{ color:'#6B6140' }}>Editando</p>
                      <input value={editBill.description} onChange={e=>setEditBill({...editBill,description:e.target.value})}
                        className="w-full px-3 py-2 rounded-xl text-sm" style={{ background:'#fff', border:'1px solid #E5E3D8' }} />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$</span>
                          <input type="number" value={editBill.amount} onChange={e=>setEditBill({...editBill,amount:parseFloat(e.target.value)||0})}
                            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-semibold"
                            style={{ background:'#fff', border:'1px solid #E5E3D8' }} inputMode="decimal" />
                        </div>
                        <div className="relative w-24">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>Dia</span>
                          <input type="number" min="1" max="31" value={editBill.dueDay} onChange={e=>setEditBill({...editBill,dueDay:parseInt(e.target.value)||1})}
                            className="w-full pl-9 pr-2 py-2 rounded-xl text-sm font-semibold"
                            style={{ background:'#fff', border:'1px solid #E5E3D8' }} inputMode="numeric" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditBill(null)} className="flex-1 py-2 rounded-xl text-sm font-medium pressable" style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                        <button onClick={saveEditBill} className="flex-1 py-2 rounded-xl text-sm font-semibold pressable" style={{ background:'#3D3822', color:'#F0D98A' }}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    /* Normal mode */
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background:'#fff', border:'1px solid #F0EFE9', opacity:b.isPast?0.5:1 }}>
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background:b.isPast?'#F0F0F0':'#FEF9EE', border:`1px solid ${b.isPast?'#E5E3D8':'#FDE68A'}` }}>
                          <Icon name="zap" size={14} color={b.isPast?'#C8C5B8':'#F59E0B'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color:'#1A1A14' }}>{b.description}</p>
                          <p className="text-xs" style={{ color:'#A8A79E' }}>Dia {b.dueDay} · {b.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>{fmt(b.amount)}</p>
                        <button onClick={()=>setEditBill(b)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#F0EFE9' }}>
                          <Icon name="edit" size={12} color="#6B6140" />
                        </button>
                        <button onClick={()=>removeBill(b.id)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#FCECEA' }}>
                          <Icon name="close" size={12} color="#C0392B" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add bill form */}
            {showAddBill ? (
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8' }}>
                <p className="text-xs font-semibold" style={{ color:'#6B6140' }}>Nova conta fixa</p>
                <input placeholder="Descrição" value={newBill.description} onChange={e=>setNewBill(p=>({...p,description:e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$</span>
                    <input type="number" placeholder="0,00" value={newBill.amount} onChange={e=>setNewBill(p=>({...p,amount:e.target.value}))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} inputMode="decimal" />
                  </div>
                  <div className="relative w-24">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>Dia</span>
                    <input type="number" min="1" max="31" placeholder="--" value={newBill.dueDay} onChange={e=>setNewBill(p=>({...p,dueDay:e.target.value}))}
                      className="w-full pl-9 pr-2 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} inputMode="numeric" />
                  </div>
                </div>
                <select value={newBill.category} onChange={e=>setNewBill(p=>({...p,category:e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm cursor-pointer"
                  style={{ background:'#fff', border:'1.5px solid #E5E3D8' }}>
                  {BILL_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={()=>setShowAddBill(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium pressable" style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                  <button onClick={saveBill} className="flex-1 py-2.5 rounded-xl text-sm font-semibold pressable" style={{ background:'#3D3822', color:'#F0D98A' }}>Adicionar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAddBill(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 pressable"
                style={{ background:'#F0EFE9', color:'#6B6140', border:'1.5px dashed #D8D4B8' }}>
                <Icon name="plus" size={14} color="#6B6140" /> Adicionar conta fixa
              </button>
            )}
          </>)}

          {/* ════ CARTÕES ════ */}
          {section==='cards' && (<>

            {/* Month filter para cartões */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold capitalize" style={{ color:'#6B6140' }}>{monthLabel(billMonth)}</p>
              <div className="flex gap-1">
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setBillMonth(m)}
                    className="px-3 py-1 rounded-full text-xs font-semibold pressable"
                    style={billMonth===m ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F0EFE9', color:'#857A50' }}>
                    {m===0?'Atual':m===1?'+1':'+2'}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-2xl p-4" style={{ background:'#F8F8F6', border:'1px solid #F0EFE9' }}>
              <p className="text-xs font-medium mb-1" style={{ color:'#A8A79E' }}>Total em cartões</p>
              <p className="font-display font-bold text-2xl tabular" style={{ color:'#C0392B' }}>{fmt(totalCC)}</p>
              {totalCC>0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background:'#E5E3D8' }}>
                    <div className="h-1.5 rounded-full" style={{ width:`${Math.round((totalC6/totalCC)*100)}%`, background:'#1a1a1a' }} />
                  </div>
                  <p className="text-xs" style={{ color:'#A8A79E' }}>C6 {Math.round((totalC6/totalCC)*100)}% · Nu {Math.round((totalNu/totalCC)*100)}%</p>
                </div>
              )}
            </div>

            {/* C6 */}
            <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #F0EFE9' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background:'#1a1a1a' }}>
                <div>
                  <p className="text-xs font-bold" style={{ color:'#C9A84C' }}>C6 Black</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Vence dia 1</p>
                </div>
                <p className="font-display font-bold text-lg tabular" style={{ color:totalC6>0?'#F87171':'#4ADE80' }}>{fmt(totalC6)}</p>
              </div>
              {cardsByCard('C6', billMonth).length===0 ? (
                <p className="px-4 py-3 text-xs" style={{ color:'#C8C5B8' }}>Nenhuma compra para este mês</p>
              ) : cardsByCard('C6', billMonth).map(p=>(
                <div key={p.id}>
                  {editCC?.id===p.id ? (
                    <div className="px-4 py-3 space-y-2" style={{ borderTop:'1px solid #F0EFE9' }}>
                      <input value={editCC.description} onChange={e=>setEditCC({...editCC,description:e.target.value})}
                        className="w-full px-3 py-2 rounded-xl text-sm" style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }} />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$/mês</span>
                          <input type="number" value={editCC.monthlyAmount} onChange={e=>setEditCC({...editCC,monthlyAmount:parseFloat(e.target.value)||0})}
                            className="w-full pl-14 pr-3 py-2 rounded-xl text-sm font-semibold"
                            style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }} inputMode="decimal" />
                        </div>
                        <select value={editCC.category} onChange={e=>setEditCC({...editCC,category:e.target.value})}
                          className="w-28 px-2 py-2 rounded-xl text-xs cursor-pointer"
                          style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }}>
                          {CC_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditCC(null)} className="flex-1 py-1.5 rounded-lg text-xs font-medium pressable" style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                        <button onClick={saveEditCC} className="flex-1 py-1.5 rounded-lg text-xs font-semibold pressable" style={{ background:'#3D3822', color:'#F0D98A' }}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop:'1px solid #F0EFE9' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color:'#1A1A14' }}>{p.description}</p>
                        <p className="text-xs" style={{ color:'#A8A79E' }}>
                          {p.installments>1 ? `${p.currentInstallment}/${p.installments}× · ${installmentsLeft(p)} restante${installmentsLeft(p)!==1?'s':''} · ` : ''}{p.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <p className="text-sm font-bold tabular" style={{ color:'#F87171' }}>{fmt(p.monthlyAmount)}</p>
                        <button onClick={()=>setEditCC(p)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#F0EFE9' }}>
                          <Icon name="edit" size={11} color="#6B6140" />
                        </button>
                        <button onClick={()=>removeCreditCardPurchase(p.id)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#FCECEA' }}>
                          <Icon name="close" size={11} color="#C0392B" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Nubank */}
            <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #F0EFE9' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background:'#820AD1' }}>
                <div>
                  <p className="text-xs font-bold text-white">Nubank</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>Vence dia 10</p>
                </div>
                <p className="font-display font-bold text-lg tabular" style={{ color:totalNu>0?'#F87171':'#4ADE80' }}>{fmt(totalNu)}</p>
              </div>
              {cardsByCard('Nubank', billMonth).length===0 ? (
                <p className="px-4 py-3 text-xs" style={{ color:'#C8C5B8' }}>Nenhuma compra para este mês</p>
              ) : cardsByCard('Nubank', billMonth).map(p=>(
                <div key={p.id}>
                  {editCC?.id===p.id ? (
                    <div className="px-4 py-3 space-y-2" style={{ borderTop:'1px solid #F0EFE9' }}>
                      <input value={editCC.description} onChange={e=>setEditCC({...editCC,description:e.target.value})}
                        className="w-full px-3 py-2 rounded-xl text-sm" style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }} />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$/mês</span>
                          <input type="number" value={editCC.monthlyAmount} onChange={e=>setEditCC({...editCC,monthlyAmount:parseFloat(e.target.value)||0})}
                            className="w-full pl-14 pr-3 py-2 rounded-xl text-sm font-semibold"
                            style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }} inputMode="decimal" />
                        </div>
                        <select value={editCC.category} onChange={e=>setEditCC({...editCC,category:e.target.value})}
                          className="w-28 px-2 py-2 rounded-xl text-xs cursor-pointer"
                          style={{ background:'#F8F8F6', border:'1px solid #E5E3D8' }}>
                          {CC_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditCC(null)} className="flex-1 py-1.5 rounded-lg text-xs font-medium pressable" style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                        <button onClick={saveEditCC} className="flex-1 py-1.5 rounded-lg text-xs font-semibold pressable" style={{ background:'#820AD1', color:'#fff' }}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop:'1px solid #F0EFE9' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color:'#1A1A14' }}>{p.description}</p>
                        <p className="text-xs" style={{ color:'#A8A79E' }}>
                          {p.installments>1 ? `${p.currentInstallment}/${p.installments}× · ${installmentsLeft(p)} restante${installmentsLeft(p)!==1?'s':''} · ` : ''}{p.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <p className="text-sm font-bold tabular" style={{ color:'#F87171' }}>{fmt(p.monthlyAmount)}</p>
                        <button onClick={()=>setEditCC(p)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#F0EFE9' }}>
                          <Icon name="edit" size={11} color="#6B6140" />
                        </button>
                        <button onClick={()=>removeCreditCardPurchase(p.id)} className="w-7 h-7 flex items-center justify-center pressable rounded-lg" style={{ background:'#FCECEA' }}>
                          <Icon name="close" size={11} color="#C0392B" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add CC */}
            {showAddCC ? (
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8' }}>
                <p className="text-xs font-semibold" style={{ color:'#6B6140' }}>Nova compra parcelada</p>
                <div className="flex gap-2">
                  {(['C6','Nubank'] as const).map(c=>(
                    <button key={c} type="button" onClick={()=>setCCForm(f=>({...f,card:c}))}
                      className="flex-1 py-2 rounded-xl text-sm font-bold pressable"
                      style={ccForm.card===c ? { background:c==='C6'?'#0d0d0d':'#820AD1', color:c==='C6'?'#C9A84C':'#fff' } : { background:'#F0EFE9', color:'#857A50' }}>
                      {c==='C6'?'C6 Black':'Nubank'}
                    </button>
                  ))}
                </div>
                <input value={ccForm.description} onChange={e=>setCCForm(f=>({...f,description:e.target.value}))}
                  placeholder="Descrição"
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'#A8A79E' }}>R$</span>
                    <input type="number" step="0.01" value={ccForm.totalAmount} onChange={e=>setCCForm(f=>({...f,totalAmount:e.target.value}))}
                      placeholder="0,00" inputMode="decimal"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background:'#fff', border:'1.5px solid #E5E3D8' }} />
                  </div>
                  <select value={ccForm.installments} onChange={e=>setCCForm(f=>({...f,installments:e.target.value}))}
                    className="w-28 px-2 py-2.5 rounded-xl text-sm cursor-pointer"
                    style={{ background:'#fff', border:'1.5px solid #E5E3D8' }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>(
                      <option key={n} value={n}>{n}× {n>1&&ccForm.totalAmount?fmt(parseFloat(ccForm.totalAmount||'0')/n):''}</option>
                    ))}
                  </select>
                </div>
                {ccForm.totalAmount && parseInt(ccForm.installments)>1 && (
                  <div className="rounded-xl px-3 py-2" style={{ background:'#EDEBD8' }}>
                    <p className="text-xs font-medium" style={{ color:'#544C31' }}>
                      {ccForm.installments}× de {fmt(parseFloat(ccForm.totalAmount||'0')/parseInt(ccForm.installments))}
                      <span style={{ color:'#A09868' }}> · quitado em {ccForm.installments} {parseInt(ccForm.installments)===1?'mês':'meses'}</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={()=>setShowAddCC(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium pressable" style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                  <button onClick={saveCC} className="flex-1 py-2.5 rounded-xl text-sm font-semibold pressable" style={{ background:'#3D3822', color:'#F0D98A' }}>Confirmar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAddCC(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 pressable"
                style={{ background:'#F0EFE9', color:'#6B6140', border:'1.5px dashed #D8D4B8' }}>
                <Icon name="plus" size={14} color="#6B6140" /> Nova parcela
              </button>
            )}

            {/* Resumo */}
            <div className="rounded-2xl p-4 space-y-2" style={{ background:'#F8F8F6' }}>
              {[{label:'C6 Black',v:totalC6},{label:'Nubank',v:totalNu}].map(r=>(
                <div key={r.label} className="flex justify-between">
                  <p className="text-sm font-medium" style={{ color:'#6B6A60' }}>{r.label}</p>
                  <p className="text-sm font-bold tabular" style={{ color:'#1A1A14' }}>{fmt(r.v)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-2" style={{ borderTop:'1px solid #E5E3D8' }}>
                <p className="text-sm font-bold" style={{ color:'#292615' }}>Total</p>
                <p className="text-sm font-bold tabular" style={{ color:'#C0392B' }}>{fmt(totalCC)}</p>
              </div>
            </div>
          </>)}

          {/* ════ SIMULADOR ════ */}
          {section==='calc' && (<>

            <div className="rounded-2xl p-4" style={{ background:'#F0EFE9', border:'1px solid #D8D4B8' }}>
              <div className="flex items-start gap-2.5">
                <Icon name="invest" size={16} color="#6B6140" />
                <div>
                  <p className="text-xs font-semibold" style={{ color:'#3D3822' }}>Simulador de aporte</p>
                  <p className="text-xs mt-0.5" style={{ color:'#857A50' }}>Simule quanto investir de cada fonte sem comprometer o saldo.</p>
                </div>
              </div>
            </div>

            {/* Fontes */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color:'#6B6140' }}>Fonte de renda</p>
              <div className="grid grid-cols-2 gap-2">
                {INCOME_SOURCES.map(src=>{
                  const mi = sourceIncome(src.key)
                  const isSel = calcSource===src.key
                  return (
                    <button key={src.key} onClick={()=>{setCalcSource(src.key);setCalcResult(null)}}
                      className="p-3 rounded-xl text-left pressable"
                      style={isSel ? { background:`${src.color}18`, border:`1.5px solid ${src.color}` } : { background:'#fff', border:'1.5px solid #F0EFE9' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:`${src.color}20` }}>
                          <Icon name={src.icon} size={12} color={src.color} />
                        </div>
                        {isSel && <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ background:src.color }} />}
                      </div>
                      <p className="text-xs font-semibold" style={{ color:isSel?src.color:'#6B6A60' }}>{src.label}</p>
                      <p className="text-xs tabular mt-0.5" style={{ color:isSel?src.color:'#C8C5B8' }}>
                        {mi>0?fmt(mi):'Sem entrada este mês'}
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
                  Usar {fmt(autoIncome)} recebidos
                </button>
              )}
            </div>

            {/* Valor disponível */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color:'#6B6140' }}>Valor disponível</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color:'#A8A79E' }}>R$</span>
                <input type="number" step="0.01" min="0" value={calcTotal}
                  onChange={e=>{setCalcTotal(e.target.value);setCalcResult(null)}}
                  placeholder="0,00" inputMode="decimal"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-base font-bold tabular"
                  style={{ background:'#fff', border:'1.5px solid #E5E3D8', color:'#292615' }} />
              </div>
            </div>

            {/* Quero investir */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color:'#6B6140' }}>Quero investir</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color:'#A8A79E' }}>R$</span>
                <input type="number" step="0.01" min="0" value={calcInvest}
                  onChange={e=>{setCalcInvest(e.target.value);setCalcResult(null)}}
                  placeholder="0,00" inputMode="decimal"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-base font-bold tabular"
                  style={{ background:'#fff', border:'1.5px solid #E5E3D8', color:'#292615' }} />
              </div>
              {calcTotal && parseFloat(calcTotal)>0 && (
                <div className="flex gap-2 mt-2">
                  {[10,20,30,50].map(pct=>(
                    <button key={pct} onClick={()=>{setCalcInvest((parseFloat(calcTotal)*pct/100).toFixed(2));setCalcResult(null)}}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold pressable"
                      style={{ background:'#F0EFE9', color:'#6B6140' }}>{pct}%</button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleCalc}
              disabled={!calcTotal||!calcInvest||parseFloat(calcInvest)>parseFloat(calcTotal)}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm pressable"
              style={{
                background:(!calcTotal||!calcInvest||parseFloat(calcInvest)>parseFloat(calcTotal))?'#F0EFE9':'#3D3822',
                color:(!calcTotal||!calcInvest||parseFloat(calcInvest)>parseFloat(calcTotal))?'#C8C5B8':'#F0D98A'
              }}>
              Calcular
            </button>

            {calcResult && (
              <div className="rounded-2xl overflow-hidden animate-fade-in" style={{ border:`1.5px solid ${selectedSrc.color}30` }}>
                <div className="p-4" style={{ background:`${selectedSrc.color}10` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:`${selectedSrc.color}20` }}>
                      <Icon name={selectedSrc.icon} size={13} color={selectedSrc.color} />
                    </div>
                    <p className="text-xs font-semibold" style={{ color:selectedSrc.color }}>{selectedSrc.label}</p>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-xs" style={{ color:'#A8A79E' }}>Investido</p>
                    <p className="text-xs font-bold" style={{ color:selectedSrc.color }}>{calcResult.pct}%</p>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background:'rgba(0,0,0,0.06)' }}>
                    <div className="h-2.5 rounded-full transition-all" style={{ width:`${calcResult.pct}%`, background:selectedSrc.color }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x" style={{ borderTop:`1px solid ${selectedSrc.color}20` }}>
                  <div className="p-3 text-center">
                    <p className="text-xs mb-1" style={{ color:'#A8A79E' }}>Investido</p>
                    <p className="font-display font-bold text-base tabular" style={{ color:selectedSrc.color }}>{fmt(calcResult.invested)}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs mb-1" style={{ color:'#A8A79E' }}>Restante</p>
                    <p className="font-display font-bold text-base tabular" style={{ color:'#2D7A4F' }}>{fmt(calcResult.remaining)}</p>
                  </div>
                </div>
                <button onClick={()=>{setCalcTotal('');setCalcInvest('');setCalcResult(null)}}
                  className="w-full py-2.5 text-xs font-medium pressable"
                  style={{ background:'#F8F8F6', color:'#A8A79E', borderTop:'1px solid #F0EFE9' }}>
                  Limpar simulação
                </button>
              </div>
            )}
          </>)}
        </div>

        {/* Footer */}
        <div className="px-5 py-3" style={{ borderTop:'1px solid #F0EFE9' }}>
          <p className="text-xs text-center" style={{ color:'#C8C5B8' }}>niggan · ferramentas financeiras</p>
        </div>
      </div>
    </>
  )
}
