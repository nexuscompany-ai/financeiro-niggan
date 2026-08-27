import { useState } from 'react'
import useFinanceStore, { Bill, CreditCardPurchase } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

interface Props { open: boolean; onClose: () => void }
type Tab = 'bills' | 'cards' | 'calc'

const SOURCES = [
  { key:'Salário FGL Brasil', label:'Salário FGL',   color:'#3B82F6', icon:'briefcase' },
  { key:'Contratos FGL',      label:'Contratos FGL',  color:'#F59E0B', icon:'tool'      },
  { key:'TikTok Shop',        label:'TikTok Shop',    color:'#EC4899', icon:'tiktok'    },
  { key:'F7 Empresa',         label:'F7 Empresa',     color:'#8B5CF6', icon:'building'  },
  { key:'Outras receitas',    label:'Outras receitas',color:'#6B6140', icon:'coins'     },
]

// Contas de pagamento (contas bancárias reais)
const PAY_ACCOUNTS = [
  { key:'Conta corrente',   label:'Conta corrente',   icon:'wallet',    color:'#292615' },
  { key:'Mercado Pago',     label:'Mercado Pago',      icon:'creditCard',color:'#00A650' },
  { key:'C6 Investimentos', label:'C6 Investimentos',  icon:'invest',    color:'#C9A84C' },
  { key:'Outros',           label:'Outra conta',       icon:'bank',      color:'#6B6140' },
]

const BILL_CATS = ['Internet','Assinatura','Combustível','Pessoal','Saúde','Moradia','Alimentação','Outros']

function mLabel(off: number) {
  const d = new Date(); d.setMonth(d.getMonth()+off)
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}

const S = {
  // palette
  bg:       '#F8F8F6',
  surface:  '#FFFFFF',
  border:   '#F0EFE9',
  border2:  '#E5E3D8',
  olive:    '#3D3822',
  oliveL:   '#F0D98A',
  text:     '#1A1A14',
  text2:    '#544C31',
  muted:    '#857A50',
  faint:    '#B0AC98',
  red:      '#C0392B',
  redBg:    '#FEF0EE',
  green:    '#2D7A4F',
  greenBg:  '#EBF7F0',
  blue:     '#2563EB',
  // font
  display:  'Space Grotesk, system-ui, sans-serif',
  body:     'Inter, system-ui, sans-serif',
}

export default function SideMenu({ open, onClose }: Props) {
  const rawBills   = useFinanceStore(s => s.bills)
  const rawCards   = useFinanceStore(s => s.creditCardPurchases)
  const rawTxs     = useFinanceStore(s => s.transactions)
  const patrimony  = useFinanceStore(s => s.patrimony)
  const addBill    = useFinanceStore(s => s.addBill)
  const updateBill = useFinanceStore(s => s.updateBill)
  const removeBill = useFinanceStore(s => s.removeBill)
  const addCC      = useFinanceStore(s => s.addCreditCardPurchase)
  const updateCC   = useFinanceStore(s => s.updateCreditCardPurchase)
  const removeCC   = useFinanceStore(s => s.removeCreditCardPurchase)
  const addTx      = useFinanceStore(s => s.addTransaction)
  const updatePat  = useFinanceStore(s => s.updatePatrimony)

  const bills = rawBills ?? []
  const cards = rawCards ?? []
  const txs   = rawTxs   ?? []

  const [tab,       setTab]       = useState<Tab>('bills')
  const [mOff,      setMOff]      = useState(0)
  const [editBill,  setEditBill]  = useState<Bill|null>(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const [nb,        setNb]        = useState({desc:'',amount:'',day:'',cat:'Internet'})
  const [editCC,    setEditCC]    = useState<CreditCardPurchase|null>(null)
  const [showAddCC, setShowAddCC] = useState(false)
  const [ccF,       setCCF]       = useState({desc:'',total:'',inst:'1',card:'C6' as 'C6'|'Nubank'})
  // Pagar conta fixa
  const [payBillId,    setPayBillId]    = useState<string|null>(null)
  const [payBillAcct,  setPayBillAcct]  = useState(PAY_ACCOUNTS[0].key)
  // Pagar fatura cartão
  const [showPayCC,    setShowPayCC]    = useState(false)
  const [payCard,      setPayCard]      = useState<'C6'|'Nubank'>('C6')
  const [payCardAcct,  setPayCardAcct]  = useState(PAY_ACCOUNTS[0].key)
  // Calc
  const [calcSrc,  setCalcSrc]  = useState(SOURCES[0].key)
  const [calcT,    setCalcT]    = useState('')
  const [calcI,    setCalcI]    = useState('')
  const [calcR,    setCalcR]    = useState<{r:number;i:number;p:number}|null>(null)

  if (!open) return null

  const fmt = formatCurrency
  const today = new Date().toISOString().split('T')[0]
  const som   = new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split('T')[0]
  const srcInc = (k:string) => txs.filter(t=>t.type==='income'&&t.category===k&&t.date>=som).reduce((s,t)=>s+t.amount,0)
  const getBalance = (acct:string) => (patrimony??[]).find(p=>p.account===acct)?.balance??0

  // Bills
  const now = new Date()
  const activeBills = bills.filter(b=>b.active&&b.recurring).map(b=>{
    const due  = new Date(now.getFullYear(),now.getMonth()+mOff,b.dueDay)
    const past = mOff===0 && due<now
    return {...b,due,past}
  }).sort((a,b)=>a.dueDay-b.dueDay)
  const totalBills = activeBills.reduce((s,b)=>s+b.amount,0)

  // Cards
  const totalC6 = cards.filter(p=>p.card==='C6').reduce((s,p)=>s+p.monthlyAmount,0)
  const totalNu = cards.filter(p=>p.card==='Nubank').reduce((s,p)=>s+p.monthlyAmount,0)
  const totalCC = totalC6+totalNu
  const instLeft = (p:CreditCardPurchase) => p.installments-p.currentInstallment+1
  const activeInM = (p:CreditCardPurchase) => p.installments<=1||instLeft(p)>mOff
  const c6List = cards.filter(p=>p.card==='C6'&&activeInM(p))
  const nuList = cards.filter(p=>p.card==='Nubank'&&activeInM(p))

  function saveBill() {
    const v=parseFloat(nb.amount.replace(',','.')); const d=parseInt(nb.day)
    if(!nb.desc.trim()||!v||!d) return
    addBill({description:nb.desc.trim(),amount:v,dueDay:d,category:nb.cat,recurring:true,active:true})
    setNb({desc:'',amount:'',day:'',cat:'Internet'}); setShowAdd(false)
  }

  function saveCC() {
    const t=parseFloat(ccF.total.replace(',','.')); const i=parseInt(ccF.inst)
    if(!t||t<=0||!ccF.desc.trim()) return
    const n=new Date()
    addCC({card:ccF.card,description:ccF.desc.trim(),totalAmount:t,installments:i,currentInstallment:1,
      monthlyAmount:parseFloat((t/i).toFixed(2)),
      startDate:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`,category:'Outros'})
    setCCF({desc:'',total:'',inst:'1',card:'C6'}); setShowAddCC(false)
  }

  // Pagar conta fixa — desconta da conta bancária selecionada
  function confirmPayBill(bill: typeof activeBills[0]) {
    const acct = PAY_ACCOUNTS.find(a=>a.key===payBillAcct)!
    const bal  = getBalance(payBillAcct)
    // Registra transação de saída
    addTx({type:'expense',category:bill.category||'Outras despesas',amount:bill.amount,
      description:`${bill.description} — pago via ${acct.label}`,date:today})
    // Desconta da conta bancária
    if(bal>0) updatePat(payBillAcct, Math.max(0, bal-bill.amount))
    setPayBillId(null)
  }

  // Pagar fatura cartão — desconta da conta bancária selecionada
  function confirmPayCard() {
    const amt  = payCard==='C6'?totalC6:totalNu
    const acct = PAY_ACCOUNTS.find(a=>a.key===payCardAcct)!
    const bal  = getBalance(payCardAcct)
    addTx({type:'expense',category:'Cartão de Crédito',amount:amt,
      description:`Fatura ${payCard} — pago via ${acct.label}`,date:today})
    if(bal>0) updatePat(payCardAcct, Math.max(0, bal-amt))
    setShowPayCC(false)
  }

  function calcular() {
    const t=parseFloat(calcT.replace(',','.')); const i=parseFloat(calcI.replace(',','.'))
    if(!t||!i||i>t) return
    setCalcR({r:t-i,i,p:Math.round((i/t)*100)})
  }

  const selSrc = SOURCES.find(s=>s.key===calcSrc)!

  // ── Shared style helpers ──────────────────────────────────────────────────
  const card = (extra?: object) => ({
    background:S.surface, border:`1px solid ${S.border}`,
    borderRadius:16, overflow:'hidden' as const, ...extra
  })
  const row = (extra?: object) => ({
    display:'flex' as const, alignItems:'center' as const, ...extra
  })
  const pill = (active: boolean, color='#3D3822', lightColor='#F0EFE9', textLight='#857A50') => ({
    padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer' as const,
    fontSize:12, fontWeight:600,
    ...(active ? {background:color, color:'#F0D98A'} : {background:lightColor, color:textLight})
  })
  const btnPrimary = {padding:'11px 0',borderRadius:12,border:'none',cursor:'pointer' as const,
    background:S.olive, color:S.oliveL, fontSize:13, fontWeight:700, flex:1}
  const btnSecondary = {padding:'11px 0',borderRadius:12,border:'none',cursor:'pointer' as const,
    background:'#F0EFE9', color:'#544C31', fontSize:13, fontWeight:600, flex:1}
  const inputStyle = {background:'#F7F6F2', border:`1.5px solid ${S.border2}`,
    borderRadius:12, padding:'11px 14px', fontSize:14, color:S.text,
    width:'100%', boxSizing:'border-box' as const, outline:'none' as const}
  const sectionTitle = {fontSize:11, fontWeight:700, color:S.muted,
    textTransform:'uppercase' as const, letterSpacing:'0.06em'}
  const label = (txt: string) => (
    <p style={{fontSize:11,fontWeight:600,color:S.muted,marginBottom:6}}>{txt}</p>
  )

  // Account picker helper
  const AccountPicker = ({value, onChange}: {value:string, onChange:(k:string)=>void}) => (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {PAY_ACCOUNTS.map(a=>{
        const bal = getBalance(a.key)
        const sel = value===a.key
        return (
          <button key={a.key} onClick={()=>onChange(a.key)}
            style={{...row(), justifyContent:'space-between', padding:'10px 14px',
              borderRadius:12, border:'none', cursor:'pointer',
              background: sel?`${a.color}12`:'#F7F6F2',
              outline: sel?`1.5px solid ${a.color}`:'none'}}>
            <div style={row({gap:10})}>
              <div style={{width:30,height:30,borderRadius:9,background:`${a.color}18`,
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name={a.icon} size={14} color={a.color} />
              </div>
              <div style={{textAlign:'left' as const}}>
                <p style={{fontSize:13,fontWeight:600,color:sel?a.color:S.text}}>{a.label}</p>
                {bal>0 && <p style={{fontSize:11,color:S.faint}}>Saldo: {fmt(bal)}</p>}
              </div>
            </div>
            {sel && <div style={{width:8,height:8,borderRadius:4,background:a.color}}/>}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{position:'fixed',inset:0,zIndex:50,
          background:'rgba(20,18,10,0.55)',backdropFilter:'blur(6px)',
          WebkitBackdropFilter:'blur(6px)'}} />

      {/* Drawer */}
      <div style={{position:'fixed',top:0,right:0,height:'100%',zIndex:51,
        width:'92vw',maxWidth:390,background:S.surface,
        boxShadow:'-12px 0 56px rgba(0,0,0,0.22)',
        display:'flex',flexDirection:'column',overflowY:'hidden'}}>

        {/* Header */}
        <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
          <div style={row({justifyContent:'space-between'})}>
            <div>
              <p style={{fontFamily:S.display,fontWeight:700,fontSize:19,color:S.text,lineHeight:1.2}}>Ferramentas</p>
              <p style={{fontSize:12,color:S.faint,marginTop:2}}>Controle financeiro</p>
            </div>
            <button onClick={onClose}
              style={{width:36,height:36,borderRadius:11,background:'#F0EFE9',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="close" size={15} color={S.muted} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:6,padding:'12px 16px',
          borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
          {([
            {k:'bills',l:'Contas a pagar',ic:'zap'},
            {k:'cards',l:'Cartões',ic:'creditCard'},
            {k:'calc',l:'Investir',ic:'invest'},
          ] as {k:Tab,l:string,ic:string}[]).map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{flex:1,padding:'9px 4px',borderRadius:12,border:'none',cursor:'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',gap:5,
                transition:'all 0.15s',
                ...(tab===t.k
                  ? {background:S.olive,boxShadow:'0 2px 8px rgba(41,38,21,0.25)'}
                  : {background:'#F0EFE9'})}}>
              <Icon name={t.ic} size={15} color={tab===t.k?S.oliveL:S.muted} />
              <span style={{fontSize:11,fontWeight:700,
                color:tab===t.k?S.oliveL:S.muted,lineHeight:1}}>{t.l}</span>
            </button>
          ))}
        </div>

        {/* ── Scroll content ── overscroll-behavior: contain para não arrastar a página */}
        <div style={{flex:1,overflowY:'auto',overscrollBehavior:'contain',
          WebkitOverflowScrolling:'touch' as any,
          padding:'16px',display:'flex',flexDirection:'column',gap:14}}>

          {/* ════ ABA CONTAS ════ */}
          {tab==='bills' && (<>

            {/* Month filter */}
            <div style={row({justifyContent:'space-between'})}>
              <p style={{...sectionTitle}}>{mLabel(mOff)}</p>
              <div style={row({gap:4})}>
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setMOff(m)} style={pill(mOff===m)}>
                    {m===0?'Este mês':`+${m}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{background:S.redBg,border:`1px solid #FECACA`,borderRadius:16,padding:'14px 16px'}}>
              <p style={{fontSize:11,fontWeight:600,color:S.red,marginBottom:4}}>Total a pagar</p>
              <p style={{fontFamily:S.display,fontWeight:700,fontSize:26,color:S.red,lineHeight:1}}>{fmt(totalBills)}</p>
              <p style={{fontSize:11,color:'#FCA5A5',marginTop:4}}>{activeBills.length} conta{activeBills.length!==1?'s':''}</p>
            </div>

            {/* Bill list */}
            {activeBills.map(b=>(
              <div key={b.id}>
                {/* Edit mode */}
                {editBill?.id===b.id ? (
                  <div style={{...card(),padding:14,display:'flex',flexDirection:'column',gap:10,
                    border:`1.5px solid ${S.border2}`}}>
                    <p style={{fontSize:12,fontWeight:700,color:S.text2}}>Editando conta</p>
                    <input value={editBill.description}
                      onChange={e=>setEditBill({...editBill,description:e.target.value})}
                      style={inputStyle} placeholder="Descrição" />
                    <div style={row({gap:8})}>
                      <input type="number" value={editBill.amount}
                        onChange={e=>setEditBill({...editBill,amount:parseFloat(e.target.value)||0})}
                        style={{...inputStyle,width:undefined,flex:1}} placeholder="R$" inputMode="decimal" />
                      <input type="number" min="1" max="31" value={editBill.dueDay}
                        onChange={e=>setEditBill({...editBill,dueDay:parseInt(e.target.value)||1})}
                        style={{...inputStyle,width:70}} placeholder="Dia" inputMode="numeric" />
                    </div>
                    <div style={row({gap:8})}>
                      <button onClick={()=>setEditBill(null)} style={btnSecondary}>Cancelar</button>
                      <button onClick={()=>{updateBill(editBill.id,{
                        description:editBill.description,amount:editBill.amount,dueDay:editBill.dueDay
                      });setEditBill(null)}} style={btnPrimary}>Salvar</button>
                    </div>
                  </div>
                ) : payBillId===b.id ? (
                  /* Pay mode */
                  <div style={{...card(),padding:14,display:'flex',flexDirection:'column',gap:12,
                    border:`1.5px solid #D8D4B8`}}>
                    <div style={row({gap:8})}>
                      <div style={{width:32,height:32,borderRadius:10,background:'#F0EFE9',
                        display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Icon name="creditCard" size={14} color={S.muted} />
                      </div>
                      <div>
                        <p style={{fontSize:13,fontWeight:700,color:S.text}}>Pagar {b.description}</p>
                        <p style={{fontSize:12,color:S.red,fontWeight:600}}>{fmt(b.amount)}</p>
                      </div>
                    </div>
                    <div>
                      {label('De qual conta sai o dinheiro?')}
                      <AccountPicker value={payBillAcct} onChange={setPayBillAcct} />
                    </div>
                    <div style={{background:'#F0EFE9',borderRadius:10,padding:'10px 12px'}}>
                      <p style={{fontSize:12,color:S.text2}}>
                        Será debitado <strong style={{color:S.red}}>{fmt(b.amount)}</strong> da{' '}
                        <strong style={{color:S.text}}>{PAY_ACCOUNTS.find(a=>a.key===payBillAcct)?.label}</strong>
                        {' '}(saldo atual: {fmt(getBalance(payBillAcct))})
                      </p>
                    </div>
                    <div style={row({gap:8})}>
                      <button onClick={()=>setPayBillId(null)} style={btnSecondary}>Cancelar</button>
                      <button onClick={()=>confirmPayBill(b)} style={{...btnPrimary,background:'#2D7A4F'}}>
                        Confirmar pagamento
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div style={{...row(),padding:'12px 14px',background:S.surface,
                    border:`1px solid ${S.border}`,borderRadius:14,
                    opacity:b.past?0.5:1}}>
                    <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                      background:b.past?'#F0F0F0':'#FEF9EE',
                      border:`1px solid ${b.past?S.border2:'#FDE68A'}`,
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Icon name="zap" size={15} color={b.past?S.faint:'#F59E0B'} />
                    </div>
                    <div style={{flex:1,minWidth:0,marginLeft:10}}>
                      <p style={{fontSize:14,fontWeight:600,color:S.text,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.description}</p>
                      <p style={{fontSize:11,color:S.faint,marginTop:2}}>Dia {b.dueDay} · {b.category}</p>
                    </div>
                    <p style={{fontSize:14,fontWeight:700,color:S.red,marginLeft:10,flexShrink:0}}>{fmt(b.amount)}</p>
                    <button onClick={()=>{setPayBillId(b.id);setPayBillAcct(PAY_ACCOUNTS[0].key)}}
                      style={{width:30,height:30,marginLeft:6,borderRadius:9,border:'none',cursor:'pointer',
                        background:S.greenBg,display:'flex',alignItems:'center',justifyContent:'center'}}
                      title="Pagar">
                      <Icon name="check" size={13} color={S.green} />
                    </button>
                    <button onClick={()=>setEditBill(b)}
                      style={{width:30,height:30,marginLeft:4,borderRadius:9,border:'none',cursor:'pointer',
                        background:'#F0EFE9',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Icon name="edit" size={13} color={S.muted} />
                    </button>
                    <button onClick={()=>removeBill(b.id)}
                      style={{width:30,height:30,marginLeft:4,borderRadius:9,border:'none',cursor:'pointer',
                        background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Icon name="trash" size={13} color={S.red} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add bill */}
            {showAdd ? (
              <div style={{...card({border:`1.5px solid ${S.border2}`}),padding:14,
                display:'flex',flexDirection:'column',gap:10}}>
                <p style={{fontSize:13,fontWeight:700,color:S.text2}}>Nova conta fixa</p>
                <input placeholder="Ex: Internet VIVO" value={nb.desc}
                  onChange={e=>setNb(p=>({...p,desc:e.target.value}))} style={inputStyle} />
                <div style={row({gap:8})}>
                  <input type="number" placeholder="Valor R$" value={nb.amount}
                    onChange={e=>setNb(p=>({...p,amount:e.target.value}))}
                    style={{...inputStyle,width:undefined,flex:1}} inputMode="decimal" />
                  <input type="number" placeholder="Dia" min="1" max="31" value={nb.day}
                    onChange={e=>setNb(p=>({...p,day:e.target.value}))}
                    style={{...inputStyle,width:70}} inputMode="numeric" />
                </div>
                <select value={nb.cat} onChange={e=>setNb(p=>({...p,cat:e.target.value}))}
                  style={{...inputStyle,cursor:'pointer'}}>
                  {BILL_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={row({gap:8})}>
                  <button onClick={()=>setShowAdd(false)} style={btnSecondary}>Cancelar</button>
                  <button onClick={saveBill} style={btnPrimary}>Adicionar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAdd(true)}
                style={{width:'100%',padding:'13px',borderRadius:14,
                  border:`1.5px dashed ${S.border2}`,background:'#F7F6F2',
                  color:S.muted,fontSize:13,fontWeight:600,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <Icon name="plus" size={14} color={S.muted} /> Adicionar conta fixa
              </button>
            )}
          </>)}

          {/* ════ ABA CARTÕES ════ */}
          {tab==='cards' && (<>

            {/* Month filter */}
            <div style={row({justifyContent:'space-between'})}>
              <p style={sectionTitle}>{mLabel(mOff)}</p>
              <div style={row({gap:4})}>
                {[0,1,2].map(m=>(
                  <button key={m} onClick={()=>setMOff(m)} style={pill(mOff===m)}>
                    {m===0?'Este mês':`+${m}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Total + pagar fatura */}
            <div style={{...card(),padding:'14px 16px'}}>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div>
                  <p style={{fontSize:11,fontWeight:600,color:S.faint,marginBottom:4}}>Total em cartões</p>
                  <p style={{fontFamily:S.display,fontWeight:700,fontSize:26,color:S.red,lineHeight:1}}>{fmt(totalCC)}</p>
                </div>
                <button onClick={()=>setShowPayCC(!showPayCC)}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'9px 14px',
                    borderRadius:12,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                    ...(showPayCC?{background:'#F0EFE9',color:S.muted}:{background:S.olive,color:S.oliveL})}}>
                  <Icon name="creditCard" size={13} color={showPayCC?S.muted:S.oliveL}/>
                  Pagar fatura
                </button>
              </div>
            </div>

            {/* Pay card modal */}
            {showPayCC && (
              <div style={{...card({border:`1.5px solid ${S.border2}`}),padding:16,
                display:'flex',flexDirection:'column',gap:14}}>
                <p style={{fontSize:14,fontWeight:700,color:S.text}}>Pagar fatura</p>

                <div>
                  {label('Cartão')}
                  <div style={row({gap:8})}>
                    {(['C6','Nubank'] as const).map(c=>(
                      <button key={c} onClick={()=>setPayCard(c)}
                        style={{flex:1,padding:'10px 6px',borderRadius:12,border:'none',cursor:'pointer',
                          fontWeight:700,fontSize:13,
                          ...(payCard===c
                            ?{background:c==='C6'?'#111':'#820AD1',color:c==='C6'?'#C9A84C':'#fff'}
                            :{background:'#F0EFE9',color:S.muted})}}>
                        {c==='C6'?'C6 Black':'Nubank'}
                        <span style={{display:'block',fontSize:11,fontWeight:400,marginTop:2,
                          opacity:0.75}}>{fmt(c==='C6'?totalC6:totalNu)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {label('De qual conta sai o dinheiro?')}
                  <AccountPicker value={payCardAcct} onChange={setPayCardAcct} />
                </div>

                <div style={{background:'#F0EFE9',borderRadius:10,padding:'10px 12px'}}>
                  <p style={{fontSize:12,color:S.text2,lineHeight:1.5}}>
                    Saída de <strong style={{color:S.red}}>{fmt(payCard==='C6'?totalC6:totalNu)}</strong>{' '}
                    da <strong style={{color:S.text}}>
                      {PAY_ACCOUNTS.find(a=>a.key===payCardAcct)?.label}
                    </strong>
                    {' '}(saldo: {fmt(getBalance(payCardAcct))})
                  </p>
                </div>

                <div style={row({gap:8})}>
                  <button onClick={()=>setShowPayCC(false)} style={btnSecondary}>Cancelar</button>
                  <button onClick={confirmPayCard} style={{...btnPrimary,background:'#2D7A4F'}}>
                    Confirmar
                  </button>
                </div>
              </div>
            )}

            {/* C6 */}
            <div style={card()}>
              <div style={{background:'#111',padding:'12px 16px',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:'#C9A84C'}}>C6 Black</p>
                  <p style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:2}}>Vence dia 1</p>
                </div>
                <p style={{fontFamily:S.display,fontWeight:700,fontSize:18,
                  color:totalC6>0?'#F87171':'#4ADE80'}}>{fmt(totalC6)}</p>
              </div>
              {c6List.length===0
                ? <p style={{padding:'12px 16px',fontSize:12,color:S.faint}}>Nenhuma compra ativa este mês</p>
                : c6List.map(p=>(
                  <div key={p.id}>
                    {editCC?.id===p.id ? (
                      <div style={{padding:'12px 16px',borderTop:`1px solid ${S.border}`,
                        display:'flex',flexDirection:'column',gap:8}}>
                        <input value={editCC.description}
                          onChange={e=>setEditCC({...editCC,description:e.target.value})}
                          style={inputStyle} />
                        <input type="number" value={editCC.monthlyAmount}
                          onChange={e=>setEditCC({...editCC,monthlyAmount:parseFloat(e.target.value)||0})}
                          placeholder="R$/mês" style={inputStyle} inputMode="decimal" />
                        <div style={row({gap:8})}>
                          <button onClick={()=>setEditCC(null)} style={btnSecondary}>Cancelar</button>
                          <button onClick={()=>{updateCC(editCC.id,{
                            description:editCC.description,monthlyAmount:editCC.monthlyAmount
                          });setEditCC(null)}} style={btnPrimary}>Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{...row(),padding:'10px 16px',borderTop:`1px solid ${S.border}`}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:600,color:S.text,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description}</p>
                          <p style={{fontSize:11,color:S.faint,marginTop:2}}>
                            {p.installments>1?`${p.currentInstallment}/${p.installments}× · ${instLeft(p)} restante${instLeft(p)!==1?'s':''} · `:''}
                            {p.category}
                          </p>
                        </div>
                        <p style={{fontSize:13,fontWeight:700,color:'#F87171',marginLeft:10,flexShrink:0}}>{fmt(p.monthlyAmount)}</p>
                        <button onClick={()=>setEditCC(p)}
                          style={{width:30,height:30,marginLeft:6,borderRadius:9,border:'none',cursor:'pointer',
                            background:'#F0EFE9',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Icon name="edit" size={12} color={S.muted} />
                        </button>
                        <button onClick={()=>removeCC(p.id)}
                          style={{width:30,height:30,marginLeft:4,borderRadius:9,border:'none',cursor:'pointer',
                            background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Icon name="close" size={12} color={S.red} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Nubank */}
            <div style={card()}>
              <div style={{background:'#820AD1',padding:'12px 16px',
                display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:'#fff'}}>Nubank</p>
                  <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>Vence dia 10</p>
                </div>
                <p style={{fontFamily:S.display,fontWeight:700,fontSize:18,
                  color:totalNu>0?'#F87171':'#4ADE80'}}>{fmt(totalNu)}</p>
              </div>
              {nuList.length===0
                ? <p style={{padding:'12px 16px',fontSize:12,color:S.faint}}>Nenhuma compra ativa este mês</p>
                : nuList.map(p=>(
                  <div key={p.id} style={{...row(),padding:'10px 16px',borderTop:`1px solid ${S.border}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:S.text,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description}</p>
                      <p style={{fontSize:11,color:S.faint,marginTop:2}}>
                        {p.installments>1?`${p.currentInstallment}/${p.installments}× · ${instLeft(p)} restante${instLeft(p)!==1?'s':''} · `:''}
                        {p.category}
                      </p>
                    </div>
                    <p style={{fontSize:13,fontWeight:700,color:'#F87171',marginLeft:10,flexShrink:0}}>{fmt(p.monthlyAmount)}</p>
                    <button onClick={()=>removeCC(p.id)}
                      style={{width:30,height:30,marginLeft:6,borderRadius:9,border:'none',cursor:'pointer',
                        background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Icon name="close" size={12} color={S.red} />
                    </button>
                  </div>
                ))
              }
            </div>

            {/* Add CC */}
            {showAddCC ? (
              <div style={{...card({border:`1.5px solid ${S.border2}`}),padding:14,
                display:'flex',flexDirection:'column',gap:10}}>
                <div style={row({gap:8})}>
                  {(['C6','Nubank'] as const).map(c=>(
                    <button key={c} onClick={()=>setCCF(f=>({...f,card:c}))}
                      style={{flex:1,padding:'9px',borderRadius:12,border:'none',cursor:'pointer',
                        fontWeight:700,fontSize:13,
                        ...(ccF.card===c?{background:c==='C6'?'#111':'#820AD1',color:c==='C6'?'#C9A84C':'#fff'}:{background:'#F0EFE9',color:S.muted})}}>
                      {c}
                    </button>
                  ))}
                </div>
                <input placeholder="Descrição" value={ccF.desc}
                  onChange={e=>setCCF(f=>({...f,desc:e.target.value}))} style={inputStyle} />
                <div style={row({gap:8})}>
                  <input type="number" placeholder="Total R$" value={ccF.total}
                    onChange={e=>setCCF(f=>({...f,total:e.target.value}))}
                    style={{...inputStyle,width:undefined,flex:1}} inputMode="decimal" />
                  <select value={ccF.inst} onChange={e=>setCCF(f=>({...f,inst:e.target.value}))}
                    style={{...inputStyle,width:80,cursor:'pointer'}}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n=><option key={n} value={n}>{n}×</option>)}
                  </select>
                </div>
                {ccF.total&&parseInt(ccF.inst)>1&&(
                  <div style={{background:'#F0EFE9',borderRadius:10,padding:'8px 12px'}}>
                    <p style={{fontSize:12,color:S.text2}}>
                      {ccF.inst}× de {fmt(parseFloat(ccF.total||'0')/parseInt(ccF.inst))}
                      <span style={{color:S.faint}}> · quitado em {ccF.inst} meses</span>
                    </p>
                  </div>
                )}
                <div style={row({gap:8})}>
                  <button onClick={()=>setShowAddCC(false)} style={btnSecondary}>Cancelar</button>
                  <button onClick={saveCC} style={btnPrimary}>Confirmar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setShowAddCC(true)}
                style={{width:'100%',padding:'13px',borderRadius:14,
                  border:`1.5px dashed ${S.border2}`,background:'#F7F6F2',
                  color:S.muted,fontSize:13,fontWeight:600,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <Icon name="plus" size={14} color={S.muted}/> Nova parcela
              </button>
            )}

            {/* Resumo */}
            <div style={{...card(),padding:'14px 16px'}}>
              {[{l:'C6 Black',v:totalC6},{l:'Nubank',v:totalNu}].map(r=>(
                <div key={r.l} style={row({justifyContent:'space-between',marginBottom:8})}>
                  <span style={{fontSize:13,color:S.muted}}>{r.l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:S.text}}>{fmt(r.v)}</span>
                </div>
              ))}
              <div style={row({justifyContent:'space-between',paddingTop:10,borderTop:`1px solid ${S.border2}`})}>
                <span style={{fontSize:14,fontWeight:700,color:S.text}}>Total</span>
                <span style={{fontSize:14,fontWeight:700,color:S.red}}>{fmt(totalCC)}</span>
              </div>
            </div>
          </>)}

          {/* ════ ABA SIMULADOR ════ */}
          {tab==='calc' && (<>

            <div style={{background:'#F0EFE9',border:`1px solid ${S.border2}`,borderRadius:14,
              padding:'12px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
              <Icon name="invest" size={16} color={S.muted} />
              <div>
                <p style={{fontSize:12,fontWeight:700,color:S.text2}}>Simulador de aporte</p>
                <p style={{fontSize:11,color:S.muted,marginTop:3,lineHeight:1.4}}>
                  Simule quanto investir de cada fonte sem comprometer o saldo.
                </p>
              </div>
            </div>

            {/* Sources */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {SOURCES.map(s=>{
                const mi=srcInc(s.key); const sel=calcSrc===s.key
                return (
                  <button key={s.key} onClick={()=>{setCalcSrc(s.key);setCalcR(null)}}
                    style={{padding:'12px 10px',borderRadius:14,border:'none',cursor:'pointer',textAlign:'left',
                      transition:'all 0.15s',
                      ...(sel?{background:`${s.color}14`,outline:`1.5px solid ${s.color}`}
                        :{background:S.surface,outline:`1px solid ${S.border}`})}}>
                    <div style={{width:26,height:26,borderRadius:8,background:`${s.color}20`,
                      display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
                      <Icon name={s.icon} size={13} color={s.color}/>
                    </div>
                    <p style={{fontSize:12,fontWeight:700,color:sel?s.color:S.text2,lineHeight:1.2}}>{s.label}</p>
                    <p style={{fontSize:11,color:sel?s.color:S.faint,marginTop:3}}>
                      {mi>0?fmt(mi):'Sem entrada'}
                    </p>
                  </button>
                )
              })}
            </div>

            {srcInc(calcSrc)>0&&(
              <button onClick={()=>setCalcT(srcInc(calcSrc).toFixed(2))}
                style={{width:'100%',padding:'9px',borderRadius:12,
                  border:`1px dashed ${S.border2}`,background:'#F0EFE9',
                  color:S.muted,fontSize:12,fontWeight:600,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                <Icon name="arrowDown" size={12} color={S.muted}/>
                Usar {fmt(srcInc(calcSrc))} recebidos
              </button>
            )}

            {[{lbl:'Valor disponível',val:calcT,set:setCalcT},{lbl:'Quero investir',val:calcI,set:setCalcI}].map((f,i)=>(
              <div key={f.lbl}>
                {label(f.lbl)}
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',
                    fontSize:13,color:S.faint}}>R$</span>
                  <input type="number" step="0.01" min="0" value={f.val}
                    onChange={e=>{f.set(e.target.value);setCalcR(null)}}
                    placeholder="0,00" inputMode="decimal"
                    style={{...inputStyle,paddingLeft:36,fontSize:17,fontWeight:700}} />
                </div>
                {i===1&&calcT&&parseFloat(calcT)>0&&(
                  <div style={row({gap:6,marginTop:8})}>
                    {[10,20,30,50].map(p=>(
                      <button key={p} onClick={()=>{setCalcI((parseFloat(calcT)*p/100).toFixed(2));setCalcR(null)}}
                        style={{flex:1,padding:'7px 0',borderRadius:10,border:'none',cursor:'pointer',
                          background:'#F0EFE9',color:S.muted,fontSize:12,fontWeight:700}}>
                        {p}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button onClick={calcular}
              disabled={!calcT||!calcI||parseFloat(calcI)>parseFloat(calcT)}
              style={{width:'100%',padding:'14px',borderRadius:16,border:'none',cursor:'pointer',
                fontSize:14,fontWeight:700,transition:'all 0.15s',
                ...(!calcT||!calcI||parseFloat(calcI)>parseFloat(calcT)
                  ?{background:'#F0EFE9',color:S.faint}
                  :{background:S.olive,color:S.oliveL,boxShadow:'0 4px 14px rgba(41,38,21,0.25)'})}}>
              Calcular
            </button>

            {calcR&&(
              <div style={{borderRadius:16,overflow:'hidden',outline:`1.5px solid ${selSrc.color}30`}}>
                <div style={{background:`${selSrc.color}10`,padding:16}}>
                  <div style={row({justifyContent:'space-between',marginBottom:10})}>
                    <div style={row({gap:8})}>
                      <div style={{width:26,height:26,borderRadius:8,background:`${selSrc.color}20`,
                        display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Icon name={selSrc.icon} size={12} color={selSrc.color}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:selSrc.color}}>{selSrc.label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:selSrc.color}}>{calcR.p}%</span>
                  </div>
                  <div style={{height:10,borderRadius:6,background:'rgba(0,0,0,0.07)'}}>
                    <div style={{height:10,borderRadius:6,background:selSrc.color,
                      width:`${calcR.p}%`,transition:'width 0.5s'}}/>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',
                  borderTop:`1px solid ${selSrc.color}20`}}>
                  {[{l:'Investido',v:calcR.i,c:selSrc.color},{l:'Restante',v:calcR.r,c:S.green}].map(x=>(
                    <div key={x.l} style={{padding:'14px 12px',textAlign:'center',
                      borderRight:x.l==='Investido'?`1px solid ${selSrc.color}20`:'none'}}>
                      <p style={{fontSize:11,color:S.faint,marginBottom:4}}>{x.l}</p>
                      <p style={{fontFamily:S.display,fontWeight:700,fontSize:17,color:x.c}}>{fmt(x.v)}</p>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{setCalcT('');setCalcI('');setCalcR(null)}}
                  style={{width:'100%',padding:'10px',border:'none',cursor:'pointer',
                    background:'#F8F8F6',color:S.faint,fontSize:12,
                    borderTop:`1px solid ${S.border}`}}>
                  Limpar simulação
                </button>
              </div>
            )}
          </>)}

        </div>{/* end scroll */}

        {/* Footer */}
        <div style={{padding:'10px 20px',borderTop:`1px solid ${S.border}`,flexShrink:0,textAlign:'center'}}>
          <p style={{fontSize:11,color:S.faint}}>niggan · ferramentas financeiras</p>
        </div>
      </div>
    </>
  )
}
