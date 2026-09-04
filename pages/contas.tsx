import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import useFinanceStore, { Bill } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'
import { CARD_DUE_DAY, CARD_LABEL, openPurchasesForMonth } from '@/lib/creditCards'

const PAY_ACCOUNTS = [
  { key:'Conta corrente',   label:'Conta corrente',   icon:'wallet',    color:'#292615' },
  { key:'C6 Investimentos', label:'C6 Investimentos', icon:'invest',    color:'#C9A84C' },
  { key:'Mercado Pago',     label:'Mercado Pago',      icon:'creditCard',color:'#00A650' },
  { key:'Outros',           label:'Outra conta',       icon:'bank',      color:'#6B6140' },
]
const BILL_CATS = ['Internet','Assinatura','Combustível','Pessoal','Saúde','Moradia','Alimentação','Outros']
const CAT_SHADES = ['#3D3822','#6B6140','#8A6D2E','#A09868','#BDB88F']

function mLabel(off: number) {
  const d = new Date(); d.setMonth(d.getMonth()+off)
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}

type Bucket = 'overdue'|'today'|'soon'|'later'
type Kind = 'bill'|'card'

// Um item pagável genérico — conta fixa OU fatura de cartão, unificados numa
// única lista/agenda. `card`/`purchaseCount` só existem em itens kind==='card';
// `paid` só é calculado pra kind==='bill' (fatura de cartão paga simplesmente
// some da lista, porque o valor em aberto vira 0 — ver cardItems).
interface PayableItem {
  id: string
  kind: Kind
  description: string
  amount: number
  dueDay: number
  category: string
  due: Date
  days: number
  bucket: Bucket
  card?: 'C6'|'Nubank'
  purchaseCount?: number
  paid?: boolean
}

function dueLabel(b: {dueDay:number; days:number}, mOff: number) {
  if (mOff !== 0) return `Dia ${b.dueDay}`
  if (b.days < 0) return `Venceu há ${-b.days} dia${-b.days!==1?'s':''}`
  if (b.days === 0) return 'Vence hoje'
  if (b.days === 1) return 'Vence amanhã'
  return `Vence em ${b.days} dias`
}

export default function Contas() {
  const rawBills  = useFinanceStore(s => s.bills)
  const addBill   = useFinanceStore(s => s.addBill)
  const updateBill= useFinanceStore(s => s.updateBill)
  const removeBill= useFinanceStore(s => s.removeBill)
  const payBillAction     = useFinanceStore(s => s.payBill)
  const payCreditCardBill = useFinanceStore(s => s.payCreditCardBill)
  const isBillPaidThisMonth = useFinanceStore(s => s.isBillPaidThisMonth)
  const getAccountBalance   = useFinanceStore(s => s.getAccountBalance)
  const rawCC     = useFinanceStore(s => s.creditCardPurchases)
  // Precisa estar inscrito em `transactions` pra re-renderizar assim que uma
  // conta/fatura é paga — senão o "já paga" só apareceria no próximo render
  // por outro motivo, e o usuário voltaria a ver o botão de pagar ativo.
  const transactions = useFinanceStore(s => s.transactions)

  const bills = rawBills ?? []
  const creditCardPurchases = rawCC ?? []
  const [mOff,         setMOff]         = useState(0)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [nb,           setNb]           = useState({desc:'',amount:0,day:'',cat:'Internet'})

  const [selected,      setSelected]      = useState<PayableItem|null>(null)
  const [sheetMode,     setSheetMode]     = useState<'actions'|'pay'|'edit'|null>(null)
  const [payAcct,       setPayAcct]       = useState(PAY_ACCOUNTS[0].key)
  const [payAmount,     setPayAmount]     = useState(0)
  const [paying,        setPaying]        = useState(false)
  const payingRef = useRef(false)
  const [editForm,      setEditForm]      = useState({description:'',amount:0,dueDay:1})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const now      = new Date()
  const todayMid = new Date(now.getFullYear(),now.getMonth(),now.getDate())

  function bucketOf(days: number): Bucket {
    return mOff!==0 ? 'later' : days<0 ? 'overdue' : days===0 ? 'today' : days<=7 ? 'soon' : 'later'
  }

  const billItems: PayableItem[] = useMemo(()=>
    bills.filter(b=>b.active&&b.recurring).map(b=>{
      const due   = new Date(now.getFullYear(),now.getMonth()+mOff,b.dueDay)
      const days  = Math.round((due.getTime()-todayMid.getTime())/86400000)
      const paid  = mOff===0 && isBillPaidThisMonth(b.id)
      return {
        id:b.id, kind:'bill', description:b.description, amount:b.amount, dueDay:b.dueDay,
        category:b.category, due, days, bucket:paid?'later':bucketOf(days), paid,
      } as PayableItem
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ,[bills,mOff,transactions])

  // Uma fatura por cartão, só aparece se tiver algo em aberto pra esse mês —
  // é exatamente o que payCreditCardBill vai cobrar. Pagar faz o valor em
  // aberto zerar e o item some da lista sozinho, sem precisar de outra trava.
  const cardItems: PayableItem[] = useMemo(()=>{
    const cards: ('C6'|'Nubank')[] = ['C6','Nubank']
    return cards.map(card=>{
      const open = openPurchasesForMonth(creditCardPurchases, card, mOff, now)
      const amount = open.reduce((s,p)=>s+p.monthlyAmount,0)
      if (amount<=0) return null
      const dueDay = CARD_DUE_DAY[card]
      const due   = new Date(now.getFullYear(),now.getMonth()+mOff,dueDay)
      const days  = Math.round((due.getTime()-todayMid.getTime())/86400000)
      return {
        id:`card-${card}`, kind:'card', description:`Fatura ${CARD_LABEL[card]}`, amount, dueDay,
        category:'Cartão de Crédito', due, days, bucket:bucketOf(days), card, purchaseCount:open.length,
      } as PayableItem
    }).filter(Boolean) as PayableItem[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[creditCardPurchases,mOff])

  const activeItems = useMemo(()=>
    [...billItems,...cardItems].sort((a,b)=>a.dueDay-b.dueDay)
  ,[billItems,cardItems])

  const unpaidItems = useMemo(()=>activeItems.filter(i=>!i.paid),[activeItems])
  const paidItems   = useMemo(()=>mOff===0?activeItems.filter(i=>i.paid):[],[activeItems,mOff])

  const total = unpaidItems.reduce((s,b)=>s+b.amount,0)
  const getBalance = (k:string) => getAccountBalance(k)

  const overdue = unpaidItems.filter(b=>b.bucket==='overdue').sort((a,b)=>a.days-b.days)
  const dueSoon = unpaidItems.filter(b=>b.bucket==='today'||b.bucket==='soon').sort((a,b)=>a.days-b.days)
  const later   = unpaidItems.filter(b=>b.bucket==='later')
  const nextUp  = mOff===0 ? dueSoon[0] ?? null : null

  const catBreakdown = useMemo(()=>{
    const map: Record<string,number> = {}
    unpaidItems.forEach(b=>{ map[b.category]=(map[b.category]||0)+b.amount })
    return Object.entries(map).sort((a,b)=>b[1]-a[1])
  },[unpaidItems])

  function openSheet(b: PayableItem) { setSelected(b); setSheetMode('actions'); setConfirmDelete(false) }
  function closeSheet() { setSelected(null); setSheetMode(null); setConfirmDelete(false) }
  function startPay() {
    if (!selected) return
    payingRef.current = false
    setPaying(false)
    setPayAcct(PAY_ACCOUNTS[0].key)
    setPayAmount(selected.amount)
    setSheetMode('pay')
  }
  function startEdit() {
    if (!selected || selected.kind!=='bill') return
    setEditForm({description:selected.description,amount:selected.amount,dueDay:selected.dueDay})
    setSheetMode('edit')
  }

  // Trava de clique duplo: o ref é síncrono, então dois cliques rápidos (ou
  // um clique "grudado") não disparam dois pagamentos reais — só é resetado
  // quando o sheet de pagamento é reaberto (startPay). Isso resolve o "cliquei
  // várias vezes e paguei duplicado": o segundo clique agora não faz nada.
  function confirmPay() {
    if (!selected) return
    if (payingRef.current) return
    payingRef.current = true
    setPaying(true)
    const acct = PAY_ACCOUNTS.find(a=>a.key===payAcct)!
    if (selected.kind==='card' && selected.card) {
      payCreditCardBill(selected.card, payAcct, acct.label)
    } else {
      payBillAction(selected.id, payAmount, payAcct, acct.label)
    }
    closeSheet()
  }

  function saveEdit() {
    if (!selected) return
    updateBill(selected.id, editForm)
    closeSheet()
  }

  function confirmRemove() {
    if (!selected) return
    removeBill(selected.id)
    closeSheet()
  }

  const S = {
    surface:'#fff', border:'1px solid #F0EFE9',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    red:'#C0392B', redBg:'#FEF0EE', green:'#2D7A4F', greenBg:'#EBF7F0',
    gold:'#8A6D2E', goldBg:'#FAF3E1',
    olive:'#3D3822', oliveL:'#F0D98A',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
  }

  // Sem vermelho de propósito — "vencida" usa o mesmo tom âmbar de "hoje"
  // em vez de escalar pra uma cor de alarme.
  const bucketStyle = (bucket: Bucket) => ({
    overdue: { bg:S.goldBg,  border:'#E9D9AE', color:S.gold },
    today:   { bg:S.goldBg,  border:'#E9D9AE', color:S.gold },
    soon:    { bg:'#F0EFE9', border:'#D8D4B8', color:S.olive },
    later:   { bg:'#F7F6F2', border:'#EDEBD8', color:S.muted },
  }[bucket])

  const DayBadge = ({b}:{b:PayableItem}) => {
    const st = bucketStyle(b.paid?'later':b.bucket)
    return (
      <div style={{width:44,height:44,borderRadius:13,flexShrink:0,
        background:st.bg,border:`1.5px solid ${st.border}`,
        display:'flex',alignItems:'center',justifyContent:'center'}}>
        {b.paid
          ? <Icon name="check" size={17} color={S.green}/>
          : <p style={{fontFamily:'Space Grotesk,sans-serif',fontSize:17,fontWeight:800,color:st.color,lineHeight:1,margin:0}}>
              {b.dueDay}
            </p>}
      </div>
    )
  }

  const BillRow = ({b}:{b:PayableItem}) => (
    <button onClick={()=>openSheet(b)} className="pressable"
      style={{width:'100%',display:'flex',alignItems:'center',gap:12,
        padding:'12px 14px',border:'none',cursor:'pointer',textAlign:'left',
        background:S.surface,borderRadius:16,opacity:b.paid?0.6:1,
        boxShadow:'0 1px 3px rgba(41,38,21,0.05)'}}>
      <DayBadge b={b}/>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {b.kind==='card' && <Icon name="creditCard" size={11} color={S.muted}/>} {b.description}
        </p>
        <p style={{fontSize:12,fontWeight:600,margin:'2px 0 0',
          color: b.paid?S.green : b.bucket==='overdue'||b.bucket==='today'?S.gold : S.muted}}>
          {b.paid ? 'Paga este mês'
            : b.kind==='card' ? `${dueLabel(b,mOff)} · ${b.purchaseCount} compra${b.purchaseCount!==1?'s':''}`
            : `${dueLabel(b,mOff)} · ${b.category}`}
        </p>
      </div>
      <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0,flexShrink:0}}>{formatCurrency(b.amount)}</p>
      <Icon name="arrowRight" size={14} color={S.faint}/>
    </button>
  )

  const Section = ({title,items,accent}:{title:string,items:PayableItem[],accent?:string}) => {
    if (items.length===0) return null
    const subtotal = items.reduce((s,b)=>s+b.amount,0)
    return (
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'0 2px 8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {accent && <div style={{width:6,height:6,borderRadius:3,background:accent}}/>}
            <p style={{fontSize:11,fontWeight:700,color:accent||S.muted,textTransform:'uppercase',
              letterSpacing:'0.06em',margin:0}}>{title} · {items.length}</p>
          </div>
          <p style={{fontSize:12,fontWeight:700,color:S.muted,margin:0}}>{formatCurrency(subtotal)}</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {items.map(b=><BillRow key={b.id} b={b}/>)}
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8F8F6',fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(255,255,255,0.9)',
        backdropFilter:'blur(12px)',borderBottom:'1px solid #E5E3D8'}}>
        <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
          <Link href="/" style={{width:34,height:34,borderRadius:10,background:'#F0EFE9',
            display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
            <Icon name="back" size={16} color="#6B6140"/>
          </Link>
          <div>
            <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
              color:'#1A1A14',margin:0}}>Contas a pagar</h1>
            <p style={{fontSize:11,color:'#A8A79E',margin:0,textTransform:'capitalize'}}>{mLabel(mOff)}</p>
          </div>
        </div>
      </header>

      <main style={{padding:'16px',display:'flex',flexDirection:'column',gap:20,paddingBottom:40}}>
        {/* Month tabs */}
        <div style={{display:'flex',gap:8}}>
          {[0,1,2].map(m=>(
            <button key={m} onClick={()=>setMOff(m)}
              style={{flex:1,padding:'10px 6px',borderRadius:12,border:'none',cursor:'pointer',
                fontWeight:700,fontSize:13,
                ...(mOff===m?{background:S.olive,color:S.oliveL,boxShadow:'0 2px 8px rgba(41,38,21,0.2)'}
                  :{background:'#F0EFE9',color:S.muted})}}>
              {m===0?'Este mês':m===1?'Próximo':'+2 meses'}
            </button>
          ))}
        </div>

        {/* Hero */}
        <div style={{background:'linear-gradient(135deg,#3D3822 0%,#292615 100%)',
          borderRadius:22,padding:'20px 20px 18px',position:'relative',overflow:'hidden',
          boxShadow:'0 8px 28px rgba(41,38,21,0.28)'}}>
          <div style={{position:'absolute',top:0,right:0,width:180,height:180,
            background:'radial-gradient(circle at top right,rgba(201,168,76,0.12),transparent)',pointerEvents:'none'}}/>
          <p style={{fontSize:11,fontWeight:600,color:'#A09868',margin:'0 0 4px',position:'relative'}}>
            Total a pagar em {mLabel(mOff)}
          </p>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:32,color:'#fff',
            margin:0,lineHeight:1,position:'relative'}}>{formatCurrency(total)}</p>
          <p style={{fontSize:12,color:'#857A50',margin:'6px 0 0',position:'relative'}}>
            {unpaidItems.length} conta{unpaidItems.length!==1?'s':''}
            {mOff===0 && overdue.length>0 &&
              <span style={{color:'#F0D98A'}}> · {overdue.length} vencida{overdue.length!==1?'s':''}</span>}
            {mOff===0 && paidItems.length>0 &&
              <span style={{color:'#7FD99A'}}> · {paidItems.length} paga{paidItems.length!==1?'s':''}</span>}
          </p>

          {catBreakdown.length>0 && (
            <div style={{marginTop:16,position:'relative'}}>
              <div style={{display:'flex',height:6,borderRadius:3,overflow:'hidden',background:'rgba(255,255,255,0.08)'}}>
                {catBreakdown.map(([cat,val],i)=>(
                  <div key={cat} style={{width:`${(val/total)*100}%`,background:CAT_SHADES[i%CAT_SHADES.length]}}/>
                ))}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px',marginTop:8}}>
                {catBreakdown.slice(0,4).map(([cat],i)=>(
                  <div key={cat} style={{display:'flex',alignItems:'center',gap:5}}>
                    <div style={{width:6,height:6,borderRadius:3,background:CAT_SHADES[i%CAT_SHADES.length]}}/>
                    <span style={{fontSize:10,color:'#A09868'}}>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next up highlight */}
        {nextUp && (
          <button onClick={()=>openSheet(nextUp)} className="pressable"
            style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',cursor:'pointer',
              border:'none',textAlign:'left',borderRadius:16,
              background:nextUp.bucket==='today'?S.goldBg:'#F0EFE9',
              boxShadow:`inset 0 0 0 1px ${nextUp.bucket==='today'?'#E9D9AE':'#D8D4B8'}`}}>
            <Icon name="zap" size={16} color={nextUp.bucket==='today'?S.gold:S.muted}/>
            <p style={{flex:1,fontSize:13,color:S.text,margin:0}}>
              <strong>Próxima: {nextUp.description}</strong><br/>
              <span style={{color:S.muted}}>{dueLabel(nextUp,mOff)}</span>
            </p>
            <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0,flexShrink:0}}>{formatCurrency(nextUp.amount)}</p>
          </button>
        )}

        {/* Bills grouped */}
        {mOff===0 ? (
          <>
            <Section title="Vencidas" items={overdue} accent={S.gold}/>
            <Section title="Essa semana" items={dueSoon} accent={S.gold}/>
            <Section title="Depois" items={later}/>
            <Section title="Pagas este mês" items={paidItems} accent={S.green}/>
          </>
        ) : (
          <Section title={`Contas de ${mLabel(mOff)}`} items={unpaidItems}/>
        )}

        {unpaidItems.length===0&&(
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{width:48,height:48,borderRadius:16,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
              <Icon name="check" size={22} color="#A8A79E"/>
            </div>
            <p style={{fontSize:14,color:'#A8A79E',margin:0}}>
              {paidItems.length>0 ? 'Tudo pago esse mês 🎉' : `Nenhuma conta para ${mLabel(mOff)}`}
            </p>
          </div>
        )}

        {/* Add trigger */}
        <button onClick={()=>setShowAddSheet(true)}
          style={{width:'100%',padding:'14px',borderRadius:16,border:'1.5px dashed #D8D4B8',
            background:'#F7F6F2',color:S.muted,fontSize:13,fontWeight:600,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Icon name="plus" size={15} color={S.muted}/> Adicionar conta fixa
        </button>
      </main>

      {/* Bill action sheet */}
      {selected && sheetMode && (
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'flex-end',
          background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}
          onClick={closeSheet}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:'100%',background:'#fff',borderRadius:'24px 24px 0 0',
              maxHeight:'88vh',overflowY:'auto',padding:'8px 20px 32px'}}>
            <div style={{width:40,height:4,borderRadius:2,background:'#E5E3D8',margin:'8px auto 20px'}}/>

            {sheetMode==='actions' && (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <DayBadge b={selected}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:16,fontWeight:700,color:S.text,margin:0}}>{selected.description}</p>
                    <p style={{fontSize:12,color: selected.bucket==='overdue'?S.gold:S.muted,margin:'2px 0 0'}}>
                      {dueLabel(selected,mOff)} · {selected.category}
                    </p>
                  </div>
                  <p style={{fontSize:18,fontWeight:700,color:S.text,margin:0}}>{formatCurrency(selected.amount)}</p>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {selected.paid ? (
                    <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,
                      background:S.greenBg}}>
                      <Icon name="check" size={17} color={S.green}/>
                      <span style={{fontSize:14,fontWeight:700,color:S.green}}>Já paga este mês</span>
                    </div>
                  ) : (
                    <button onClick={startPay}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,
                        border:'none',cursor:'pointer',background:S.green,color:'#fff'}}>
                      <Icon name="check" size={17} color="#fff"/>
                      <span style={{fontSize:14,fontWeight:700}}>Marcar como paga</span>
                    </button>
                  )}

                  {selected.kind==='card' ? (
                    <Link href="/cartoes" onClick={closeSheet}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,
                        textDecoration:'none',background:'#F0EFE9',color:S.text}}>
                      <Icon name="creditCard" size={16} color={S.muted}/>
                      <span style={{fontSize:14,fontWeight:600}}>Ver compras do cartão</span>
                    </Link>
                  ) : (
                    <>
                      <button onClick={startEdit}
                        style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,
                          border:'none',cursor:'pointer',background:'#F0EFE9',color:S.text}}>
                        <Icon name="edit" size={16} color={S.muted}/>
                        <span style={{fontSize:14,fontWeight:600}}>Editar</span>
                      </button>
                      {confirmDelete ? (
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>setConfirmDelete(false)}
                            style={{flex:1,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                              background:'#F0EFE9',color:S.muted,fontSize:13,fontWeight:600}}>Cancelar</button>
                          <button onClick={confirmRemove}
                            style={{flex:1,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                              background:S.red,color:'#fff',fontSize:13,fontWeight:700}}>Confirmar exclusão</button>
                        </div>
                      ) : (
                        <button onClick={()=>setConfirmDelete(true)}
                          style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,
                            border:'none',cursor:'pointer',background:S.redBg,color:S.red}}>
                          <Icon name="trash" size={16} color={S.red}/>
                          <span style={{fontSize:14,fontWeight:600}}>Excluir</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {sheetMode==='pay' && (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:38,height:38,borderRadius:12,background:'#F0EFE9',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="creditCard" size={17} color={S.olive}/>
                  </div>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>Pagar {selected.description}</p>
                    {selected.kind!=='bill' &&
                      <p style={{fontSize:13,fontWeight:700,color:S.text,margin:0}}>{formatCurrency(selected.amount)}</p>}
                  </div>
                </div>

                {selected.kind==='bill' && (
                  <div>
                    <p style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',
                      letterSpacing:'0.06em',margin:'0 0 8px'}}>Valor pago</p>
                    <MoneyInput value={payAmount} onChange={setPayAmount} style={{fontSize:18}}/>
                    {payAmount!==selected.amount &&
                      <p style={{fontSize:11,color:S.faint,margin:'6px 0 0'}}>
                        Valor de referência: {formatCurrency(selected.amount)} — só essa cobrança muda, a conta
                        fixa continua com o valor padrão.
                      </p>}
                  </div>
                )}

                <div>
                  <p style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',
                    letterSpacing:'0.06em',margin:'0 0 8px'}}>De qual conta?</p>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {PAY_ACCOUNTS.map(a=>{
                      const bal=getBalance(a.key); const sel=payAcct===a.key
                      return (
                        <button key={a.key} onClick={()=>setPayAcct(a.key)}
                          style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                            padding:'11px 14px',borderRadius:12,border:'none',cursor:'pointer',
                            ...(sel?{background:`${a.color}12`,outline:`1.5px solid ${a.color}`}
                              :{background:'#F7F6F2',outline:'none'})}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:32,height:32,borderRadius:10,background:`${a.color}18`,
                              display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <Icon name={a.icon} size={15} color={a.color}/>
                            </div>
                            <div style={{textAlign:'left'}}>
                              <p style={{fontSize:13,fontWeight:600,color:sel?a.color:S.text,margin:0}}>{a.label}</p>
                              {bal>0&&<p style={{fontSize:11,color:S.faint,margin:0}}>Saldo: {formatCurrency(bal)}</p>}
                            </div>
                          </div>
                          {sel&&<div style={{width:8,height:8,borderRadius:4,background:a.color}}/>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{background:'#F0EFE9',borderRadius:10,padding:'10px 14px'}}>
                  <p style={{fontSize:12,color:'#544C31',margin:0,lineHeight:1.5}}>
                    Será debitado <strong style={{color:S.text}}>
                      {formatCurrency(selected.kind==='bill'?payAmount:selected.amount)}</strong> da{' '}
                    <strong style={{color:S.text}}>{PAY_ACCOUNTS.find(a=>a.key===payAcct)?.label}</strong>
                    {getBalance(payAcct)>0&&<> · saldo: <strong>{formatCurrency(getBalance(payAcct))}</strong></>}
                  </p>
                </div>

                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setSheetMode('actions')} disabled={paying}
                    style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                      background:'#F0EFE9',color:S.muted,fontSize:13,fontWeight:600,opacity:paying?0.6:1}}>Voltar</button>
                  <button onClick={confirmPay} disabled={paying}
                    style={{flex:2,padding:'12px',borderRadius:12,border:'none',
                      cursor:paying?'default':'pointer',
                      background:S.green,color:'#fff',fontSize:13,fontWeight:700,
                      opacity:paying?0.7:1,
                      boxShadow:'0 3px 10px rgba(45,122,79,0.25)'}}>
                    {paying?'Pagando...':'Confirmar pagamento'}
                  </button>
                </div>
              </div>
            )}

            {sheetMode==='edit' && (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>Editando conta</p>
                <input value={editForm.description}
                  onChange={e=>setEditForm({...editForm,description:e.target.value})}
                  style={S.inp} placeholder="Descrição"/>
                <div style={{display:'flex',gap:8}}>
                  <MoneyInput value={editForm.amount} onChange={v=>setEditForm({...editForm,amount:v})}
                    style={{fontSize:16,flex:1}}/>
                  <div style={{position:'relative',width:80}}>
                    <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
                      fontSize:11,color:S.faint}}>Dia</span>
                    <input type="number" min="1" max="31" value={editForm.dueDay}
                      onChange={e=>setEditForm({...editForm,dueDay:parseInt(e.target.value)||1})}
                      style={{...S.inp,paddingLeft:34,width:80}} inputMode="numeric"/>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setSheetMode('actions')}
                    style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                      background:'#F0EFE9',color:S.muted,fontSize:13}}>Voltar</button>
                  <button onClick={saveEdit}
                    style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                      background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Salvar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add bill sheet */}
      {showAddSheet && (
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'flex-end',
          background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}
          onClick={()=>setShowAddSheet(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:'100%',background:'#fff',borderRadius:'24px 24px 0 0',padding:'8px 20px 32px'}}>
            <div style={{width:40,height:4,borderRadius:2,background:'#E5E3D8',margin:'8px auto 20px'}}/>
            <p style={{fontSize:16,fontWeight:700,color:S.text,margin:'0 0 16px'}}>Nova conta fixa</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <input placeholder="Ex: Internet VIVO" value={nb.desc}
                onChange={e=>setNb(p=>({...p,desc:e.target.value}))} style={S.inp}/>
              <div style={{display:'flex',gap:8}}>
                <MoneyInput value={nb.amount} onChange={v=>setNb(p=>({...p,amount:v}))}
                  style={{fontSize:16}}/>
                <div style={{position:'relative',width:90}}>
                  <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
                    fontSize:11,color:S.faint}}>Dia</span>
                  <input type="number" placeholder="--" min="1" max="31" value={nb.day}
                    onChange={e=>setNb(p=>({...p,day:e.target.value}))}
                    style={{...S.inp,paddingLeft:34,width:90}} inputMode="numeric"/>
                </div>
              </div>
              <select value={nb.cat} onChange={e=>setNb(p=>({...p,cat:e.target.value}))}
                style={{...S.inp,cursor:'pointer'}}>
                {BILL_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setShowAddSheet(false)}
                  style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                    background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
                <button onClick={()=>{
                  const day=parseInt(nb.day)
                  if(!nb.desc.trim()||!nb.amount||!day) return
                  addBill({description:nb.desc.trim(),amount:nb.amount,dueDay:day,
                    category:nb.cat,recurring:true,active:true})
                  setNb({desc:'',amount:0,day:'',cat:'Internet'}); setShowAddSheet(false)
                }} style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                  background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
