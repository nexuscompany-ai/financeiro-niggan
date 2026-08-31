import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon, { CATEGORY_ICON } from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'

type Period = 'month'|'7d'|'90d'|'all'
const PERIOD_LABELS: Record<Period,string> = {month:'Este mês','7d':'7 dias','90d':'90 dias',all:'Histórico'}

const COFRE_ACCENT = '#6B6140'
const COFRE_BG = '#F7F6F2'
const COFRE_BORDER = '#E5E3D8'
const COFRE_TEXT_ACCENT = '#292615'

const COFRES = [
  {key:'Salário FGL Brasil',icon:'briefcase',accent:COFRE_ACCENT,bg:COFRE_BG,border:COFRE_BORDER,textAccent:COFRE_TEXT_ACCENT},
  {key:'Contratos FGL',     icon:'tool',      accent:COFRE_ACCENT,bg:COFRE_BG,border:COFRE_BORDER,textAccent:COFRE_TEXT_ACCENT},
  {key:'TikTok Shop',       icon:'tiktok',    accent:COFRE_ACCENT,bg:COFRE_BG,border:COFRE_BORDER,textAccent:COFRE_TEXT_ACCENT},
  {key:'F7 Empresa',        icon:'building',  accent:COFRE_ACCENT,bg:COFRE_BG,border:COFRE_BORDER,textAccent:COFRE_TEXT_ACCENT},
]

const TRANSFER_DESTINATIONS = [
  {key:'Conta corrente',   label:'Conta corrente',   icon:'wallet',    color:'#292615'},
  {key:'C6 Investimentos', label:'C6 Investimentos', icon:'invest',    color:'#C9A84C'},
  {key:'Mercado Pago',     label:'Mercado Pago',      icon:'creditCard',color:'#00A650'},
  {key:'Outros',           label:'Outra conta',       icon:'bank',      color:'#6B6140'},
]

function getStartDate(p: Period): string {
  const now = new Date()
  if (p==='month') return new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  if (p==='7d')  { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] }
  if (p==='90d') { const d=new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0] }
  return '2000-01-01'
}

interface TransferModalProps {
  maxAmount: number
  description: string
  fromCategory: string
  onClose: () => void
}

function TransferModal({ maxAmount, description, fromCategory, onClose }: TransferModalProps) {
  const addTx = useFinanceStore(s => s.addTransaction)
  const getAccountBalance = useFinanceStore(s => s.getAccountBalance)

  const [type,   setType]   = useState<'account'|'investment'>('account')
  const [dest,   setDest]   = useState(TRANSFER_DESTINATIONS[0].key)
  const [amount, setAmount] = useState(maxAmount)

  const getBalance = (acct: string) => getAccountBalance(acct)
  const today = new Date().toISOString().split('T')[0]
  const destInfo = TRANSFER_DESTINATIONS.find(d=>d.key===dest)!
  const bal = getBalance(dest)
  const valid = amount > 0 && amount <= maxAmount

  function confirm() {
    if (!valid) return
    if (type === 'account') {
      // A entrada já soma na conta corrente assim que é lançada — "transferir"
      // aqui é só realocar esse valor da conta corrente para outra conta.
      // Não é uma nova entrada (isso contaria o dinheiro 2x): é uma transação
      // do tipo "transfer", que não entra nas estatísticas de Entrou/Saiu.
      if (dest !== 'Conta corrente') {
        addTx({ type:'transfer', category:'Transferência', amount,
          description:`Transferido: ${description} → ${dest}`, date:today,
          account:'Conta corrente', toAccount:dest })
      }
    } else {
      addTx({ type:'investment', category:'CDB / Reserva', amount,
        description:`Investimento de ${description}`, date:today, fromCategory,
        account:'Conta corrente', toAccount:'C6 Investimentos' })
    }
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'flex-end',
      background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}>
      <div style={{width:'100%',background:'#fff',borderRadius:'24px 24px 0 0',
        maxHeight:'92vh',overflowY:'auto',overscrollBehavior:'contain'}}>
        <div style={{width:40,height:4,borderRadius:2,background:'#E5E3D8',margin:'12px auto 0'}}/>

        <div style={{padding:'16px 20px 40px',display:'flex',flexDirection:'column',gap:20}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
                color:'#1A1A14',margin:0}}>Transferir valor</p>
              <p style={{fontSize:12,color:'#A8A79E',marginTop:2}}>{description}</p>
            </div>
            <button onClick={onClose}
              style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',
                background:'#F0EFE9',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="close" size={15} color="#857A50"/>
            </button>
          </div>

          {/* Valor a transferir */}
          <div>
            <MoneyInput
              value={amount}
              onChange={setAmount}
              label="Valor a transferir"
            />
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <button onClick={()=>setAmount(maxAmount)}
                style={{flex:1,padding:'7px 0',borderRadius:10,border:'1px dashed #D8D4B8',
                  background:'#F7F6F2',color:'#6B6140',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                Total ({formatCurrency(maxAmount)})
              </button>
              {[25,50,75].map(pct=>(
                <button key={pct} onClick={()=>setAmount(Math.round(maxAmount*pct/100*100)/100)}
                  style={{flex:1,padding:'7px 0',borderRadius:10,border:'1px solid #F0EFE9',
                    background:'#F7F6F2',color:'#6B6140',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  {pct}%
                </button>
              ))}
            </div>
            {amount > maxAmount && (
              <p style={{fontSize:12,color:'#C0392B',marginTop:6}}>
                Valor maior que o disponível ({formatCurrency(maxAmount)})
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#857A50',textTransform:'uppercase',
              letterSpacing:'0.06em',marginBottom:8}}>Para onde vai?</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setType('account')}
                style={{flex:1,padding:'11px 8px',borderRadius:12,border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:13,transition:'all 0.15s',
                  ...(type==='account'
                    ?{background:'#3D3822',color:'#F0D98A',boxShadow:'0 2px 8px rgba(41,38,21,0.2)'}
                    :{background:'#F0EFE9',color:'#857A50'})}}>
                Conta bancária
              </button>
              <button onClick={()=>setType('investment')}
                style={{flex:1,padding:'11px 8px',borderRadius:12,border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:13,transition:'all 0.15s',
                  ...(type==='investment'
                    ?{background:'#8A6D2E',color:'#fff',boxShadow:'0 2px 8px rgba(138,109,46,0.25)'}
                    :{background:'#F0EFE9',color:'#857A50'})}}>
                Investimento
              </button>
            </div>
          </div>

          {/* Conta destino */}
          {type==='account' && (
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'#857A50',textTransform:'uppercase',
                letterSpacing:'0.06em',marginBottom:8}}>Conta destino</p>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {TRANSFER_DESTINATIONS.map(d=>{
                  const b = getBalance(d.key)
                  const sel = dest===d.key
                  return (
                    <button key={d.key} onClick={()=>setDest(d.key)}
                      style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                        padding:'11px 14px',borderRadius:12,border:'none',cursor:'pointer',
                        transition:'all 0.1s',
                        ...(sel?{background:`${d.color}12`,outline:`1.5px solid ${d.color}`}
                          :{background:'#F8F8F6',outline:'none'})}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:10,background:`${d.color}18`,
                          display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Icon name={d.icon} size={15} color={d.color}/>
                        </div>
                        <div style={{textAlign:'left'}}>
                          <p style={{fontSize:13,fontWeight:600,color:sel?d.color:'#1A1A14',margin:0}}>{d.label}</p>
                          {b>0&&<p style={{fontSize:11,color:'#A8A79E',margin:0}}>Saldo: {formatCurrency(b)}</p>}
                        </div>
                      </div>
                      {sel&&<div style={{width:8,height:8,borderRadius:4,background:d.color}}/>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Resumo */}
          <div style={{background:'#F0EFE9',borderRadius:12,padding:'12px 14px'}}>
            <p style={{fontSize:13,color:'#544C31',lineHeight:1.5,margin:0}}>
              {type==='account'
                ? <>{formatCurrency(amount)} → <strong style={{color:'#1A1A14'}}>{destInfo.label}</strong>
                    {bal>=0 && <> · saldo vai para <strong style={{color:'#2D7A4F'}}>{formatCurrency(bal+amount)}</strong></>}</>
                : <>Registrar investimento de <strong style={{color:'#8A6D2E'}}>{formatCurrency(amount)}</strong></>
              }
            </p>
          </div>

          {/* Botões */}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose}
              style={{flex:1,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                background:'#F0EFE9',color:'#857A50',fontSize:14,fontWeight:600}}>
              Cancelar
            </button>
            <button onClick={confirm} disabled={!valid}
              style={{flex:2,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                fontSize:14,fontWeight:700,transition:'all 0.15s',
                ...(valid
                  ?{background:type==='investment'?'#8A6D2E':'#2D7A4F',color:'#fff',
                    boxShadow:`0 4px 14px ${type==='investment'?'rgba(138,109,46,0.25)':'rgba(45,122,79,0.25)'}`}
                  :{background:'#F0EFE9',color:'#C8C5B8'})}}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cofres() {
  const transactions = useFinanceStore(s => s.transactions)
  const [hidden,   setHidden]   = useState(false)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [periods,  setPeriods]  = useState<Record<string,Period>>({})
  const [transfer, setTransfer] = useState<{amount:number;description:string;fromCategory:string}|null>(null)

  const getPeriod = (k:string):Period => periods[k]||'month'
  const setPeriod = (k:string,p:Period) => setPeriods(prev=>({...prev,[k]:p}))
  const fmt = (v:number) => hidden ? '•••••' : formatCurrency(v)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  const cofreKeys = COFRES.map(c=>c.key)
  const incomesMes = transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth&&cofreKeys.includes(t.category))
  const totalGeralMes = incomesMes.reduce((s,t)=>s+t.amount,0)
  const totalInvestMes = transactions.filter(t=>t.type==='investment'&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)
  const dizimo = totalGeralMes*0.10

  const cofresData = useMemo(()=>COFRES.map(c=>{
    const period=getPeriod(c.key); const start=getStartDate(period)
    const incomes=transactions.filter(t=>t.type==='income'&&t.date>=start&&t.category===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const investments=transactions.filter(t=>t.type==='investment'&&t.date>=start&&t.fromCategory===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const totalIncome=incomes.reduce((s,t)=>s+t.amount,0)
    const totalInvest=investments.reduce((s,t)=>s+t.amount,0)
    const incomeMonth=transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth&&t.category===c.key).reduce((s,t)=>s+t.amount,0)
    const pct=totalGeralMes>0?Math.min(100,Math.round((incomeMonth/totalGeralMes)*100)):0
    return {...c,incomes,investments,totalIncome,totalInvest,pct,period}
  }),[transactions,periods])

  return (
    <div style={{minHeight:'100vh',background:'#F8F8F6',fontFamily:'Inter,system-ui,sans-serif'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(255,255,255,0.85)',
        backdropFilter:'blur(12px)',borderBottom:'1px solid #E5E3D8'}}>
        <div style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Link href="/" style={{width:32,height:32,borderRadius:10,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>
              <Icon name="back" size={16} color="#6B6140"/>
            </Link>
            <div>
              <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
                color:'#292615',margin:0}}>Cofres</h1>
              <p style={{fontSize:11,color:'#A8A79E',margin:0,textTransform:'capitalize'}}>
                {now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}
              </p>
            </div>
          </div>
          <button onClick={()=>setHidden(h=>!h)}
            style={{width:36,height:36,borderRadius:11,border:'none',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              background:hidden?'#3D3822':'#F0EFE9'}}>
            <Icon name={hidden?'eye':'eyeOff'} size={16} color={hidden?'#F0D98A':'#857A50'}/>
          </button>
        </div>
      </header>

      <main style={{paddingBottom:48}}>
        {/* Hero */}
        <div style={{padding:'16px 16px 12px'}}>
          <div style={{background:'linear-gradient(135deg,#3D3822 0%,#292615 60%,#1A150A 100%)',
            borderRadius:24,padding:22,position:'relative',overflow:'hidden',
            boxShadow:'0 8px 32px rgba(41,38,21,0.3)'}}>
            <div style={{position:'absolute',top:0,right:0,width:200,height:200,
              background:'radial-gradient(circle at top right,rgba(201,168,76,0.12),transparent)',
              pointerEvents:'none'}}/>

            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <div style={{width:22,height:22,borderRadius:7,background:'rgba(201,168,76,0.2)',
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="safe" size={12} color="#C9A84C"/>
                  </div>
                  <p style={{fontSize:10,fontWeight:700,color:'#857A50',textTransform:'uppercase',
                    letterSpacing:'0.07em',margin:0}}>Total em cofres</p>
                </div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:30,
                  color:'#fff',lineHeight:1,margin:0}}>
                  {hidden?'••••••':formatCurrency(totalGeralMes)}
                </p>
                <p style={{fontSize:11,color:'#6B6140',marginTop:5,margin:0}}>
                  {incomesMes.length} entrada{incomesMes.length!==1?'s':''}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:10,color:'#6B6140',marginBottom:3,margin:0}}>Investido</p>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:17,
                  color:'#F0D98A',margin:0}}>
                  {hidden?'•••••':formatCurrency(totalInvestMes)}
                </p>
              </div>
            </div>

            {/* Dízimo */}
            <div style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:12,padding:'10px 12px',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <Icon name="heart" size={13} color="#C9A84C"/>
                  <div>
                    <p style={{fontSize:11,fontWeight:700,color:'#C9A84C',margin:0}}>Dízimo sugerido</p>
                    <p style={{fontSize:10,color:'#6B6140',margin:0}}>10% do total</p>
                  </div>
                </div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:16,
                  color:'#C9A84C',margin:0}}>
                  {hidden?'•••••':formatCurrency(dizimo)}
                </p>
              </div>
            </div>

            {/* Mini bars */}
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {cofresData.map(c=>(
                <div key={c.key} style={{display:'flex',alignItems:'center',gap:10}}>
                  <p style={{fontSize:10,color:'#6B6140',width:72,flexShrink:0,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:0}}>
                    {c.key.split(' ')[0]}
                  </p>
                  <div style={{flex:1,height:4,borderRadius:2,background:'rgba(255,255,255,0.06)'}}>
                    <div style={{height:4,borderRadius:2,background:c.accent,
                      width:`${c.pct}%`,transition:'width 0.6s'}}/>
                  </div>
                  <p style={{fontSize:10,color:'#857A50',width:26,textAlign:'right',flexShrink:0,margin:0}}>
                    {c.pct}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cofres list */}
        <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:12}}>
          {cofresData.map(({key,icon,accent,bg,border,textAccent,incomes,investments,totalIncome,totalInvest,pct,period})=>{
            const isOpen=expanded===key
            return (
              <div key={key} style={{background:'#fff',border:'1px solid #F0EFE9',borderRadius:20,
                overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                <div onClick={()=>setExpanded(isOpen?null:key)} style={{padding:16,cursor:'pointer'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:42,height:42,borderRadius:13,background:bg,
                        border:`1px solid ${border}`,display:'flex',alignItems:'center',
                        justifyContent:'center',flexShrink:0}}>
                        <Icon name={icon} size={19} color={accent}/>
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:'#1A1A14',margin:0}}>{key}</p>
                        <p style={{fontSize:11,color:'#A8A79E',marginTop:2,margin:0}}>
                          {incomes.length} entrada{incomes.length!==1?'s':''} · {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:17,
                        color:'#1A1A14',margin:0}}>{fmt(totalIncome)}</p>
                      {totalInvest>0&&(
                        <p style={{fontSize:11,fontWeight:600,color:'#8A6D2E',marginTop:2,margin:0}}>
                          {fmt(totalInvest)} invest.
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,height:5,borderRadius:3,background:'#F0EFE9'}}>
                      <div style={{height:5,borderRadius:3,background:accent,
                        width:`${pct}%`,transition:'width 0.5s'}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <p style={{fontSize:11,color:'#A8A79E',margin:0}}>{pct}%</p>
                      <Icon name={isOpen?'chevronUp':'chevronDown'} size={13} color="#C8C5B8"/>
                    </div>
                  </div>
                </div>

                {isOpen&&(
                  <div style={{borderTop:'1px solid #F0EFE9'}}>
                    <div style={{padding:'10px 16px 8px',display:'flex',gap:6,
                      overflowX:'auto',scrollbarWidth:'none'}}>
                      {(Object.entries(PERIOD_LABELS) as [Period,string][]).map(([p,l])=>(
                        <button key={p} onClick={e=>{e.stopPropagation();setPeriod(key,p)}}
                          style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:'none',
                            cursor:'pointer',fontSize:12,fontWeight:600,transition:'all 0.15s',
                            ...(period===p?{background:accent,color:'#fff'}:{background:'#F0EFE9',color:'#857A50'})}}>
                          {l}
                        </button>
                      ))}
                    </div>

                    <div style={{padding:'0 16px 16px',display:'flex',flexDirection:'column',gap:8}}>
                      {incomes.length>0&&(<>
                        <p style={{fontSize:10,fontWeight:700,color:'#A8A79E',textTransform:'uppercase',
                          letterSpacing:'0.06em',marginBottom:2,margin:0}}>Entradas</p>
                        {incomes.map(tx=>(
                          <div key={tx.id} style={{display:'flex',alignItems:'center',
                            padding:'10px 12px',borderRadius:12,background:bg,border:`1px solid ${border}`,gap:10}}>
                            <div style={{width:28,height:28,borderRadius:9,background:'rgba(255,255,255,0.7)',
                              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <Icon name={CATEGORY_ICON[tx.category]||'coins'} size={13} color={accent}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:500,color:'#1A1A14',margin:0,
                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.description}</p>
                              <p style={{fontSize:10,color:'#A8A79E',margin:0}}>
                                {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                              </p>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                              <p style={{fontSize:13,fontWeight:700,color:textAccent,margin:0}}>
                                +{fmt(tx.amount)}
                              </p>
                              <button
                                onClick={e=>{e.stopPropagation();setTransfer({amount:tx.amount,description:tx.description,fromCategory:tx.category})}}
                                style={{padding:'5px 10px',borderRadius:8,border:'none',cursor:'pointer',
                                  background:`${accent}20`,color:accent,fontSize:11,fontWeight:700,
                                  display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                                <Icon name="arrowRight" size={10} color={accent}/>
                                Transferir
                              </button>
                            </div>
                          </div>
                        ))}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 4px 0',
                          borderTop:'1px solid #F0EFE9'}}>
                          <p style={{fontSize:11,fontWeight:700,color:'#A8A79E',margin:0}}>Subtotal</p>
                          <p style={{fontSize:13,fontWeight:700,color:textAccent,margin:0}}>{fmt(totalIncome)}</p>
                        </div>
                      </>)}

                      {investments.length>0&&(<>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,marginBottom:4}}>
                          <Icon name="invest" size={12} color="#8A6D2E"/>
                          <p style={{fontSize:10,fontWeight:700,color:'#8A6D2E',textTransform:'uppercase',
                            letterSpacing:'0.06em',margin:0}}>Investimentos</p>
                        </div>
                        {investments.map(tx=>(
                          <div key={tx.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                            padding:'10px 12px',borderRadius:12,background:'#FAF3E1',border:'1px solid #E9D9AE'}}>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:500,color:'#6B5423',margin:0,
                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.description}</p>
                              <p style={{fontSize:10,color:'#B9A876',margin:0}}>
                                {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                              </p>
                            </div>
                            <p style={{fontSize:13,fontWeight:700,color:'#8A6D2E',marginLeft:12,flexShrink:0,margin:0}}>
                              {fmt(tx.amount)}
                            </p>
                          </div>
                        ))}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 4px 0',
                          borderTop:'1px solid #E9D9AE'}}>
                          <p style={{fontSize:11,fontWeight:700,color:'#B9A876',margin:0}}>Total investido</p>
                          <p style={{fontSize:13,fontWeight:700,color:'#8A6D2E',margin:0}}>{fmt(totalInvest)}</p>
                        </div>
                      </>)}

                      {incomes.length===0&&investments.length===0&&(
                        <div style={{padding:'24px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                          <div style={{width:38,height:38,borderRadius:12,background:'#F0EFE9',
                            display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Icon name="inbox" size={17} color="#C8C5B8"/>
                          </div>
                          <p style={{fontSize:12,color:'#A8A79E',margin:0}}>
                            Nenhuma movimentação {PERIOD_LABELS[period].toLowerCase()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {transfer&&(
        <TransferModal
          maxAmount={transfer.amount}
          description={transfer.description}
          fromCategory={transfer.fromCategory}
          onClose={()=>setTransfer(null)}
        />
      )}
    </div>
  )
}
