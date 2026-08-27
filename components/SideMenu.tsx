import { useState } from 'react'
import useFinanceStore, { Bill, CreditCardPurchase } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

interface Props { open: boolean; onClose: () => void }
type Tab = 'bills' | 'cards' | 'calc'

const SOURCES = [
  { key: 'Salário FGL Brasil', label: 'Salário FGL',   color: '#3B82F6', icon: 'briefcase' },
  { key: 'Contratos FGL',      label: 'Contratos FGL',  color: '#F59E0B', icon: 'tool'      },
  { key: 'TikTok Shop',        label: 'TikTok Shop',    color: '#EC4899', icon: 'tiktok'    },
  { key: 'F7 Empresa',         label: 'F7 Empresa',     color: '#8B5CF6', icon: 'building'  },
  { key: 'Outras receitas',    label: 'Outras receitas', color: '#6B6140', icon: 'coins'    },
]

const BILL_CATS = ['Internet','Assinatura','Combustível','Pessoal','Saúde','Moradia','Alimentação','Outros']

function mLabel(off: number) {
  const d = new Date(); d.setMonth(d.getMonth() + off)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default function SideMenu({ open, onClose }: Props) {
  const rawBills   = useFinanceStore(s => s.bills)
  const rawCards   = useFinanceStore(s => s.creditCardPurchases)
  const rawTxs     = useFinanceStore(s => s.transactions)
  const addBill    = useFinanceStore(s => s.addBill)
  const updateBill = useFinanceStore(s => s.updateBill)
  const removeBill = useFinanceStore(s => s.removeBill)
  const addCC      = useFinanceStore(s => s.addCreditCardPurchase)
  const updateCC   = useFinanceStore(s => s.updateCreditCardPurchase)
  const removeCC   = useFinanceStore(s => s.removeCreditCardPurchase)
  const addTx      = useFinanceStore(s => s.addTransaction)

  // Safe arrays — nunca undefined
  const bills = rawBills   ?? []
  const cards = rawCards   ?? []
  const txs   = rawTxs     ?? []

  const [tab,         setTab]         = useState<Tab>('bills')
  const [mOff,        setMOff]        = useState(0)
  const [editBill,    setEditBill]    = useState<Bill | null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [nb,          setNb]          = useState({ desc: '', amount: '', day: '', cat: 'Internet' })
  const [editCC,      setEditCC]      = useState<CreditCardPurchase | null>(null)
  const [showAddCC,   setShowAddCC]   = useState(false)
  const [ccF,         setCCF]         = useState({ desc: '', total: '', inst: '1', card: 'C6' as 'C6'|'Nubank' })
  const [showPay,     setShowPay]     = useState(false)
  const [payCard,     setPayCard]     = useState<'C6'|'Nubank'>('C6')
  const [paySource,   setPaySource]   = useState(SOURCES[0].key)
  const [calcSrc,     setCalcSrc]     = useState(SOURCES[0].key)
  const [calcTotal,   setCalcTotal]   = useState('')
  const [calcInv,     setCalcInv]     = useState('')
  const [calcRes,     setCalcRes]     = useState<{r:number;i:number;p:number}|null>(null)

  if (!open) return null

  const fmt = formatCurrency
  const today   = new Date().toISOString().split('T')[0]
  const som     = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const srcInc  = (k: string) => txs.filter(t => t.type==='income' && t.category===k && t.date>=som).reduce((s,t)=>s+t.amount,0)

  // Bills for month
  const now = new Date()
  const activeBills = bills.filter(b => b.active && b.recurring).map(b => {
    const due  = new Date(now.getFullYear(), now.getMonth() + mOff, b.dueDay)
    const past = mOff === 0 && due < now
    return { ...b, due, past }
  }).sort((a,b) => a.dueDay - b.dueDay)
  const totalBills = activeBills.reduce((s,b) => s+b.amount, 0)

  // Cards
  const totalC6 = cards.filter(p=>p.card==='C6').reduce((s,p)=>s+p.monthlyAmount,0)
  const totalNu = cards.filter(p=>p.card==='Nubank').reduce((s,p)=>s+p.monthlyAmount,0)
  const totalCC = totalC6 + totalNu

  function instLeft(p: CreditCardPurchase) { return p.installments - p.currentInstallment + 1 }
  function activeInMonth(p: CreditCardPurchase) {
    if (p.installments <= 1) return true
    return instLeft(p) > mOff
  }
  const c6List = cards.filter(p => p.card==='C6'   && activeInMonth(p))
  const nuList = cards.filter(p => p.card==='Nubank'&& activeInMonth(p))

  // Styles
  const inp  = { background:'#fff', border:'1.5px solid #E5E3D8' }
  const inpS = { background:'#F8F8F6', border:'1px solid #E5E3D8' }
  const btn  = (active: boolean) => active ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F0EFE9', color:'#857A50' }

  function saveBill() {
    const v = parseFloat(nb.amount.replace(',','.')); const d = parseInt(nb.day)
    if (!nb.desc.trim()||!v||!d) return
    addBill({ description:nb.desc.trim(), amount:v, dueDay:d, category:nb.cat, recurring:true, active:true })
    setNb({ desc:'',amount:'',day:'',cat:'Internet' }); setShowAdd(false)
  }

  function saveCC() {
    const t = parseFloat(ccF.total.replace(',','.')); const i = parseInt(ccF.inst)
    if (!t||t<=0||!ccF.desc.trim()) return
    const n = new Date()
    addCC({ card:ccF.card, description:ccF.desc.trim(), totalAmount:t, installments:i,
      currentInstallment:1, monthlyAmount:parseFloat((t/i).toFixed(2)),
      startDate:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`, category:'Outros' })
    setCCF({ desc:'',total:'',inst:'1',card:'C6' }); setShowAddCC(false)
  }

  function payBill() {
    const amt = payCard==='C6' ? totalC6 : totalNu
    if (!amt) return
    const src = SOURCES.find(s=>s.key===paySource)
    addTx({ type:'expense', category:'Cartão de Crédito', amount:amt,
      description:`Pagamento fatura ${payCard} — de ${src?.label}`,
      date:today, fromCategory:paySource })
    setShowPay(false)
  }

  function calcular() {
    const t = parseFloat(calcTotal.replace(',','.')); const i = parseFloat(calcInv.replace(',','.'))
    if (!t||!i||i>t) return
    setCalcRes({ r:t-i, i, p:Math.round((i/t)*100) })
  }

  const selSrc = SOURCES.find(s=>s.key===calcSrc)!

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }} onClick={onClose} />

      <div className="fixed top-0 right-0 h-full z-50 animate-slide-left"
        style={{ width:'92vw', maxWidth:'380px', background:'#fff', boxShadow:'-8px 0 48px rgba(0,0,0,0.18)',
          display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F0EFE9', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:18, color:'#292615' }}>Menu</p>
            <p style={{ fontSize:11, color:'#A8A79E' }}>Ferramentas financeiras</p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:12, background:'#F0EFE9',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="close" size={16} color="#6B6140" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:'12px 16px', borderBottom:'1px solid #F0EFE9', flexShrink:0 }}>
          {([['bills','Contas','zap'],['cards','Cartões','creditCard'],['calc','Investir','invest']] as const).map(([k,l,ic])=>(
            <button key={k} onClick={()=>setTab(k as Tab)}
              style={{ flex:1, padding:'8px 4px', borderRadius:12, border:'none', cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                ...(tab===k ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F8F8F6', color:'#A8A79E' }) }}>
              <Icon name={ic} size={14} color={tab===k ? '#F0D98A' : '#C8C5B8'} />
              <span style={{ fontSize:11, fontWeight:600 }}>{l}</span>
            </button>
          ))}
        </div>

        {/* Scroll area */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>

          {/* ── CONTAS ── */}
          {tab==='bills' && <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#6B6140', textTransform:'uppercase' }}>{mLabel(mOff)}</span>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setMOff(m)}
                    style={{ padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                      ...(mOff===m ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F0EFE9', color:'#857A50' }) }}>
                    {m===0?'Atual':`+${m}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background:'#FCECEA', border:'1px solid #FCA5A5', borderRadius:16, padding:16 }}>
              <p style={{ fontSize:11, color:'#C0392B', marginBottom:4 }}>Total a pagar</p>
              <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:24, color:'#C0392B' }}>{fmt(totalBills)}</p>
            </div>

            {activeBills.map(b => (
              <div key={b.id}>
                {editBill?.id===b.id ? (
                  <div style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8', borderRadius:16, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                    <input value={editBill.description} onChange={e=>setEditBill({...editBill,description:e.target.value})}
                      style={{ ...inpS, borderRadius:10, padding:'8px 12px', fontSize:14, width:'100%', boxSizing:'border-box' }} />
                    <div style={{ display:'flex', gap:8 }}>
                      <input type="number" value={editBill.amount} onChange={e=>setEditBill({...editBill,amount:parseFloat(e.target.value)||0})}
                        placeholder="R$" style={{ ...inpS, borderRadius:10, padding:'8px 12px', fontSize:14, flex:1 }} inputMode="decimal" />
                      <input type="number" value={editBill.dueDay} onChange={e=>setEditBill({...editBill,dueDay:parseInt(e.target.value)||1})}
                        placeholder="Dia" style={{ ...inpS, borderRadius:10, padding:'8px 12px', fontSize:14, width:70 }} inputMode="numeric" />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>setEditBill(null)} style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#857A50', fontSize:13 }}>Cancelar</button>
                      <button onClick={()=>{ updateBill(editBill.id,{description:editBill.description,amount:editBill.amount,dueDay:editBill.dueDay}); setEditBill(null) }}
                        style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', background:'#3D3822', color:'#F0D98A', fontSize:13, fontWeight:600 }}>Salvar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'#fff', border:'1px solid #F0EFE9', borderRadius:14, padding:'10px 12px',
                    display:'flex', alignItems:'center', opacity:b.past?0.5:1 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:b.past?'#F0F0F0':'#FEF9EE',
                      border:`1px solid ${b.past?'#E5E3D8':'#FDE68A'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name="zap" size={14} color={b.past?'#C8C5B8':'#F59E0B'} />
                    </div>
                    <div style={{ flex:1, minWidth:0, marginLeft:10 }}>
                      <p style={{ fontSize:14, fontWeight:500, color:'#1A1A14', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.description}</p>
                      <p style={{ fontSize:11, color:'#A8A79E' }}>Dia {b.dueDay} · {b.category}</p>
                    </div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#C0392B', marginLeft:8, flexShrink:0 }}>{fmt(b.amount)}</p>
                    <button onClick={()=>setEditBill(b)} style={{ width:28, height:28, marginLeft:6, borderRadius:8, border:'none', cursor:'pointer', background:'#F0EFE9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="edit" size={12} color="#6B6140" />
                    </button>
                    <button onClick={()=>removeBill(b.id)} style={{ width:28, height:28, marginLeft:4, borderRadius:8, border:'none', cursor:'pointer', background:'#FCECEA', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="close" size={12} color="#C0392B" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {showAdd ? (
              <div style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8', borderRadius:16, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#6B6140' }}>Nova conta fixa</p>
                <input placeholder="Descrição" value={nb.desc} onChange={e=>setNb(p=>({...p,desc:e.target.value}))}
                  style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:14, width:'100%', boxSizing:'border-box' }} />
                <div style={{ display:'flex', gap:8 }}>
                  <input type="number" placeholder="R$" value={nb.amount} onChange={e=>setNb(p=>({...p,amount:e.target.value}))}
                    style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:14, flex:1 }} inputMode="decimal" />
                  <input type="number" placeholder="Dia" min="1" max="31" value={nb.day} onChange={e=>setNb(p=>({...p,day:e.target.value}))}
                    style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:14, width:70 }} inputMode="numeric" />
                </div>
                <select value={nb.cat} onChange={e=>setNb(p=>({...p,cat:e.target.value}))}
                  style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:14, width:'100%', cursor:'pointer' }}>
                  {BILL_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setShowAdd(false)} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#857A50', fontSize:13 }}>Cancelar</button>
                  <button onClick={saveBill} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#3D3822', color:'#F0D98A', fontSize:13, fontWeight:600 }}>Adicionar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAdd(true)}
                style={{ width:'100%', padding:'12px', borderRadius:16, border:'1.5px dashed #D8D4B8', background:'#F0EFE9',
                  color:'#6B6140', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Icon name="plus" size={14} color="#6B6140" /> Adicionar conta fixa
              </button>
            )}
          </>}

          {/* ── CARTÕES ── */}
          {tab==='cards' && <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#6B6140', textTransform:'uppercase' }}>{mLabel(mOff)}</span>
              <div style={{ display:'flex', gap:4 }}>
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setMOff(m)}
                    style={{ padding:'4px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                      ...(mOff===m ? { background:'#3D3822', color:'#F0D98A' } : { background:'#F0EFE9', color:'#857A50' }) }}>
                    {m===0?'Atual':`+${m}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Total + pagar */}
            <div style={{ background:'#F8F8F6', border:'1px solid #F0EFE9', borderRadius:16, padding:16 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:11, color:'#A8A79E', marginBottom:2 }}>Total em cartões</p>
                  <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:24, color:'#C0392B' }}>{fmt(totalCC)}</p>
                </div>
                <button onClick={()=>setShowPay(!showPay)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:12, border:'none',
                    cursor:'pointer', fontSize:12, fontWeight:600,
                    ...(showPay ? { background:'#F0EFE9', color:'#857A50' } : { background:'#3D3822', color:'#F0D98A' }) }}>
                  <Icon name="creditCard" size={12} color={showPay?'#857A50':'#F0D98A'} />
                  Pagar fatura
                </button>
              </div>
            </div>

            {/* Pagar fatura */}
            {showPay && (
              <div style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#292615' }}>Pagar fatura</p>

                <div>
                  <p style={{ fontSize:11, color:'#A8A79E', marginBottom:6 }}>Cartão</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {(['C6','Nubank'] as const).map(c=>(
                      <button key={c} onClick={()=>setPayCard(c)}
                        style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
                          ...(payCard===c
                            ? { background:c==='C6'?'#0d0d0d':'#820AD1', color:c==='C6'?'#C9A84C':'#fff' }
                            : { background:'#F0EFE9', color:'#857A50' }) }}>
                        {c==='C6'?'C6 Black':'Nubank'}
                        <span style={{ display:'block', fontSize:11, fontWeight:400, marginTop:2, opacity:0.7 }}>
                          {fmt(c==='C6'?totalC6:totalNu)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize:11, color:'#A8A79E', marginBottom:6 }}>Pagar com dinheiro de qual cofre?</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {SOURCES.map(s=>(
                      <button key={s.key} onClick={()=>setPaySource(s.key)}
                        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px',
                          borderRadius:12, border:'none', cursor:'pointer',
                          ...(paySource===s.key
                            ? { background:`${s.color}15`, outline:`1.5px solid ${s.color}` }
                            : { background:'#fff', outline:'1px solid #F0EFE9' }) }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:28, height:28, borderRadius:8, background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Icon name={s.icon} size={13} color={s.color} />
                          </div>
                          <span style={{ fontSize:13, fontWeight:500, color:paySource===s.key?s.color:'#1A1A14' }}>{s.label}</span>
                        </div>
                        {srcInc(s.key)>0 && <span style={{ fontSize:11, color:'#A8A79E' }}>{fmt(srcInc(s.key))}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background:'#fff', border:'1px solid #F0EFE9', borderRadius:12, padding:'10px 12px' }}>
                  <p style={{ fontSize:12, color:'#A8A79E' }}>
                    Saída de <strong style={{ color:'#C0392B' }}>{fmt(payCard==='C6'?totalC6:totalNu)}</strong> do cofre{' '}
                    <strong style={{ color:'#292615' }}>{SOURCES.find(s=>s.key===paySource)?.label}</strong>
                  </p>
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setShowPay(false)} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#857A50', fontSize:13 }}>Cancelar</button>
                  <button onClick={payBill} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#3D3822', color:'#F0D98A', fontSize:13, fontWeight:600 }}>Confirmar</button>
                </div>
              </div>
            )}

            {/* C6 */}
            <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid #F0EFE9' }}>
              <div style={{ background:'#1a1a1a', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#C9A84C' }}>C6 Black</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Vence dia 1</p>
                </div>
                <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:18, color:totalC6>0?'#F87171':'#4ADE80' }}>{fmt(totalC6)}</p>
              </div>
              {c6List.length===0
                ? <p style={{ padding:'12px 16px', fontSize:12, color:'#C8C5B8' }}>Nenhuma compra ativa</p>
                : c6List.map(p=>(
                  <div key={p.id}>
                    {editCC?.id===p.id ? (
                      <div style={{ padding:'12px 16px', borderTop:'1px solid #F0EFE9', display:'flex', flexDirection:'column', gap:8 }}>
                        <input value={editCC.description} onChange={e=>setEditCC({...editCC,description:e.target.value})}
                          style={{ ...inpS, borderRadius:10, padding:'8px 12px', fontSize:13, width:'100%', boxSizing:'border-box' }} />
                        <input type="number" value={editCC.monthlyAmount} onChange={e=>setEditCC({...editCC,monthlyAmount:parseFloat(e.target.value)||0})}
                          placeholder="R$/mês" style={{ ...inpS, borderRadius:10, padding:'8px 12px', fontSize:13 }} inputMode="decimal" />
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={()=>setEditCC(null)} style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#857A50', fontSize:12 }}>Cancelar</button>
                          <button onClick={()=>{ updateCC(editCC.id,{description:editCC.description,monthlyAmount:editCC.monthlyAmount}); setEditCC(null) }}
                            style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', background:'#3D3822', color:'#F0D98A', fontSize:12, fontWeight:600 }}>Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding:'10px 16px', borderTop:'1px solid #F0EFE9', display:'flex', alignItems:'center' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:500, color:'#1A1A14', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</p>
                          <p style={{ fontSize:11, color:'#A8A79E' }}>{p.installments>1?`${p.currentInstallment}/${p.installments}× · `:''}{p.category}</p>
                        </div>
                        <p style={{ fontSize:13, fontWeight:700, color:'#F87171', marginLeft:8, flexShrink:0 }}>{fmt(p.monthlyAmount)}</p>
                        <button onClick={()=>setEditCC(p)} style={{ width:28, height:28, marginLeft:6, borderRadius:8, border:'none', cursor:'pointer', background:'#F0EFE9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Icon name="edit" size={11} color="#6B6140" />
                        </button>
                        <button onClick={()=>removeCC(p.id)} style={{ width:28, height:28, marginLeft:4, borderRadius:8, border:'none', cursor:'pointer', background:'#FCECEA', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Icon name="close" size={11} color="#C0392B" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Nubank */}
            <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid #F0EFE9' }}>
              <div style={{ background:'#820AD1', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Nubank</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Vence dia 10</p>
                </div>
                <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:18, color:totalNu>0?'#F87171':'#4ADE80' }}>{fmt(totalNu)}</p>
              </div>
              {nuList.length===0
                ? <p style={{ padding:'12px 16px', fontSize:12, color:'#C8C5B8' }}>Nenhuma compra ativa</p>
                : nuList.map(p=>(
                  <div key={p.id} style={{ padding:'10px 16px', borderTop:'1px solid #F0EFE9', display:'flex', alignItems:'center' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:500, color:'#1A1A14', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</p>
                      <p style={{ fontSize:11, color:'#A8A79E' }}>{p.installments>1?`${p.currentInstallment}/${p.installments}× · `:''}{p.category}</p>
                    </div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#F87171', marginLeft:8, flexShrink:0 }}>{fmt(p.monthlyAmount)}</p>
                    <button onClick={()=>removeCC(p.id)} style={{ width:28, height:28, marginLeft:6, borderRadius:8, border:'none', cursor:'pointer', background:'#FCECEA', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name="close" size={11} color="#C0392B" />
                    </button>
                  </div>
                ))
              }
            </div>

            {/* Add CC */}
            {showAddCC ? (
              <div style={{ background:'#F8F8F6', border:'1.5px solid #D8D4B8', borderRadius:16, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', gap:8 }}>
                  {(['C6','Nubank'] as const).map(c=>(
                    <button key={c} onClick={()=>setCCF(f=>({...f,card:c}))}
                      style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
                        ...(ccF.card===c ? { background:c==='C6'?'#0d0d0d':'#820AD1', color:c==='C6'?'#C9A84C':'#fff' } : { background:'#F0EFE9', color:'#857A50' }) }}>
                      {c==='C6'?'C6':'Nubank'}
                    </button>
                  ))}
                </div>
                <input placeholder="Descrição" value={ccF.desc} onChange={e=>setCCF(f=>({...f,desc:e.target.value}))}
                  style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:13, width:'100%', boxSizing:'border-box' }} />
                <div style={{ display:'flex', gap:8 }}>
                  <input type="number" placeholder="Total R$" value={ccF.total} onChange={e=>setCCF(f=>({...f,total:e.target.value}))}
                    style={{ ...inp, borderRadius:12, padding:'10px 14px', fontSize:13, flex:1 }} inputMode="decimal" />
                  <select value={ccF.inst} onChange={e=>setCCF(f=>({...f,inst:e.target.value}))}
                    style={{ ...inp, borderRadius:12, padding:'10px 8px', fontSize:13, width:80, cursor:'pointer' }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n=><option key={n} value={n}>{n}×</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setShowAddCC(false)} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#857A50', fontSize:13 }}>Cancelar</button>
                  <button onClick={saveCC} style={{ flex:1, padding:'10px', borderRadius:12, border:'none', cursor:'pointer', background:'#3D3822', color:'#F0D98A', fontSize:13, fontWeight:600 }}>Confirmar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAddCC(true)}
                style={{ width:'100%', padding:'12px', borderRadius:16, border:'1.5px dashed #D8D4B8', background:'#F0EFE9',
                  color:'#6B6140', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Icon name="plus" size={14} color="#6B6140" /> Nova parcela
              </button>
            )}

            {/* Resumo */}
            <div style={{ background:'#F8F8F6', borderRadius:16, padding:16 }}>
              {[{l:'C6 Black',v:totalC6},{l:'Nubank',v:totalNu}].map(r=>(
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, color:'#6B6A60' }}>{r.l}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#1A1A14' }}>{fmt(r.v)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid #E5E3D8' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#292615' }}>Total</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#C0392B' }}>{fmt(totalCC)}</span>
              </div>
            </div>
          </>}

          {/* ── SIMULADOR ── */}
          {tab==='calc' && <>
            <div style={{ background:'#F0EFE9', border:'1px solid #D8D4B8', borderRadius:16, padding:14, display:'flex', gap:10 }}>
              <Icon name="invest" size={16} color="#6B6140" />
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'#3D3822' }}>Simulador de aporte</p>
                <p style={{ fontSize:11, color:'#857A50', marginTop:2 }}>Simule quanto investir de cada fonte.</p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {SOURCES.map(s=>{
                const mi = srcInc(s.key); const sel = calcSrc===s.key
                return (
                  <button key={s.key} onClick={()=>{ setCalcSrc(s.key); setCalcRes(null) }}
                    style={{ padding:12, borderRadius:14, border:'none', cursor:'pointer', textAlign:'left',
                      ...(sel ? { background:`${s.color}18`, outline:`1.5px solid ${s.color}` } : { background:'#fff', outline:'1px solid #F0EFE9' }) }}>
                    <div style={{ width:24, height:24, borderRadius:8, background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6 }}>
                      <Icon name={s.icon} size={12} color={s.color} />
                    </div>
                    <p style={{ fontSize:11, fontWeight:600, color:sel?s.color:'#6B6A60' }}>{s.label}</p>
                    <p style={{ fontSize:11, color:sel?s.color:'#C8C5B8', marginTop:2 }}>{mi>0?fmt(mi):'–'}</p>
                  </button>
                )
              })}
            </div>

            {srcInc(calcSrc)>0 && (
              <button onClick={()=>setCalcTotal(srcInc(calcSrc).toFixed(2))}
                style={{ width:'100%', padding:'8px', borderRadius:12, border:'1px dashed #D8D4B8', background:'#F0EFE9', color:'#6B6140', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                Usar {fmt(srcInc(calcSrc))} recebidos
              </button>
            )}

            {['Valor disponível','Quero investir'].map((lbl,i)=>(
              <div key={lbl}>
                <p style={{ fontSize:11, fontWeight:600, color:'#6B6140', marginBottom:6 }}>{lbl}</p>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#A8A79E' }}>R$</span>
                  <input type="number" step="0.01" min="0"
                    value={i===0?calcTotal:calcInv}
                    onChange={e=>{ i===0?setCalcTotal(e.target.value):setCalcInv(e.target.value); setCalcRes(null) }}
                    placeholder="0,00" inputMode="decimal"
                    style={{ ...inp, borderRadius:16, padding:'14px 14px 14px 36px', fontSize:16, fontWeight:700, width:'100%', boxSizing:'border-box' }} />
                </div>
                {i===1 && calcTotal && parseFloat(calcTotal)>0 && (
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    {[10,20,30,50].map(p=>(
                      <button key={p} onClick={()=>{ setCalcInv((parseFloat(calcTotal)*p/100).toFixed(2)); setCalcRes(null) }}
                        style={{ flex:1, padding:'6px', borderRadius:10, border:'none', cursor:'pointer', background:'#F0EFE9', color:'#6B6140', fontSize:12, fontWeight:600 }}>
                        {p}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button onClick={calcular}
              disabled={!calcTotal||!calcInv||parseFloat(calcInv)>parseFloat(calcTotal)}
              style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
                ...(!calcTotal||!calcInv||parseFloat(calcInv)>parseFloat(calcTotal)
                  ? { background:'#F0EFE9', color:'#C8C5B8' }
                  : { background:'#3D3822', color:'#F0D98A' }) }}>
              Calcular
            </button>

            {calcRes && (
              <div style={{ borderRadius:16, overflow:'hidden', outline:`1.5px solid ${selSrc.color}30` }}>
                <div style={{ background:`${selSrc.color}10`, padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:24, height:24, borderRadius:8, background:`${selSrc.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name={selSrc.icon} size={12} color={selSrc.color} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:selSrc.color }}>{selSrc.label}</span>
                    <span style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color:selSrc.color }}>{calcRes.p}%</span>
                  </div>
                  <div style={{ height:10, borderRadius:8, background:'rgba(0,0,0,0.06)' }}>
                    <div style={{ height:10, borderRadius:8, background:selSrc.color, width:`${calcRes.p}%` }} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${selSrc.color}20` }}>
                  <div style={{ padding:12, textAlign:'center', borderRight:`1px solid ${selSrc.color}20` }}>
                    <p style={{ fontSize:11, color:'#A8A79E', marginBottom:4 }}>Investido</p>
                    <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:16, color:selSrc.color }}>{fmt(calcRes.i)}</p>
                  </div>
                  <div style={{ padding:12, textAlign:'center' }}>
                    <p style={{ fontSize:11, color:'#A8A79E', marginBottom:4 }}>Restante</p>
                    <p style={{ fontFamily:'Space Grotesk,sans-serif', fontWeight:700, fontSize:16, color:'#2D7A4F' }}>{fmt(calcRes.r)}</p>
                  </div>
                </div>
                <button onClick={()=>{ setCalcTotal(''); setCalcInv(''); setCalcRes(null) }}
                  style={{ width:'100%', padding:'10px', border:'none', cursor:'pointer', background:'#F8F8F6', color:'#A8A79E', fontSize:12, borderTop:'1px solid #F0EFE9' }}>
                  Limpar
                </button>
              </div>
            )}
          </>}

        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid #F0EFE9', flexShrink:0, textAlign:'center' }}>
          <p style={{ fontSize:11, color:'#C8C5B8' }}>niggan · ferramentas financeiras</p>
        </div>
      </div>
    </>
  )
}
