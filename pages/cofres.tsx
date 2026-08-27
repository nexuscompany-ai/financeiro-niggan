import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon, { CATEGORY_ICON } from '@/components/Icon'

type Period = 'month'|'7d'|'90d'|'all'
const PERIOD_LABELS: Record<Period,string> = {month:'Este mês','7d':'7 dias','90d':'90 dias',all:'Histórico'}

const COFRES = [
  {key:'Salário FGL Brasil',icon:'briefcase',accent:'#3B82F6',bg:'#EFF6FF',border:'#BFDBFE',textAccent:'#1D4ED8'},
  {key:'Contratos FGL',     icon:'tool',      accent:'#F59E0B',bg:'#FFFBEB',border:'#FDE68A',textAccent:'#92400E'},
  {key:'TikTok Shop',       icon:'tiktok',    accent:'#EC4899',bg:'#FDF2F8',border:'#FBCFE8',textAccent:'#9D174D'},
  {key:'F7 Empresa',        icon:'building',  accent:'#8B5CF6',bg:'#F5F3FF',border:'#DDD6FE',textAccent:'#5B21B6'},
]

const TRANSFER_DESTINATIONS = [
  {key:'Conta corrente',   label:'Conta corrente',    icon:'wallet',    color:'#292615'},
  {key:'C6 Investimentos', label:'C6 Investimentos',  icon:'invest',    color:'#C9A84C'},
  {key:'Mercado Pago',     label:'Mercado Pago',       icon:'creditCard',color:'#00A650'},
  {key:'Outros',           label:'Outra conta',        icon:'bank',      color:'#6B6140'},
]

function getStartDate(p: Period): string {
  const now = new Date()
  if (p==='month') return new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  if (p==='7d')  { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] }
  if (p==='90d') { const d=new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0] }
  return '2000-01-01'
}

interface TransferModalProps {
  txId: string
  amount: number
  description: string
  onClose: () => void
}

function TransferModal({ txId, amount, description, onClose }: TransferModalProps) {
  const patrimony  = useFinanceStore(s => s.patrimony)
  const updatePat  = useFinanceStore(s => s.updatePatrimony)
  const addTx      = useFinanceStore(s => s.addTransaction)
  const [dest,     setDest]    = useState(TRANSFER_DESTINATIONS[0].key)
  const [transferType, setTransferType] = useState<'account'|'investment'>('account')

  const getBalance = (acct: string) => (patrimony??[]).find(p=>p.account===acct)?.balance??0
  const today = new Date().toISOString().split('T')[0]

  function confirm() {
    if (transferType === 'account') {
      // Adiciona ao saldo da conta destino
      const cur = getBalance(dest)
      updatePat(dest, cur + amount)
      addTx({
        type:'income',
        category:'Outras receitas',
        amount,
        description:`Transferido de cofre: ${description} → ${dest}`,
        date:today,
      })
    } else {
      // Registra como investimento
      addTx({
        type:'investment',
        category:'CDB / Reserva',
        amount,
        description:`Investimento de ${description}`,
        date:today,
        fromCategory:'Outras receitas',
      })
    }
    onClose()
  }

  const destInfo = TRANSFER_DESTINATIONS.find(d=>d.key===dest)!
  const bal = getBalance(dest)

  return (
    <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'flex-end',
      background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)'}}>
      <div style={{width:'100%',background:'#fff',borderRadius:'24px 24px 0 0',padding:'0 0 32px',
        animation:'slideUp 0.3s cubic-bezier(.16,1,.3,1)'}}>
        <div style={{width:40,height:4,borderRadius:2,background:'#E5E3D8',margin:'12px auto 20px'}}/>

        <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:18}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="arrowRight" size={20} color="#6B6140"/>
            </div>
            <div>
              <p style={{fontSize:16,fontWeight:700,color:'#1A1A14',fontFamily:'Space Grotesk,sans-serif'}}>
                Transferir valor
              </p>
              <p style={{fontSize:12,color:'#857A50',marginTop:2}}>{description}</p>
            </div>
            <p style={{marginLeft:'auto',fontSize:18,fontWeight:700,color:'#2D7A4F',
              fontFamily:'Space Grotesk,sans-serif'}}>+{formatCurrency(amount)}</p>
          </div>

          {/* Tipo */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#857A50',textTransform:'uppercase',
              letterSpacing:'0.06em',marginBottom:8}}>Para onde vai esse dinheiro?</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setTransferType('account')}
                style={{flex:1,padding:'10px 8px',borderRadius:12,border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:13,
                  ...(transferType==='account'
                    ?{background:'#3D3822',color:'#F0D98A',boxShadow:'0 2px 8px rgba(41,38,21,0.2)'}
                    :{background:'#F0EFE9',color:'#857A50'})}}>
                Conta bancária
              </button>
              <button onClick={()=>setTransferType('investment')}
                style={{flex:1,padding:'10px 8px',borderRadius:12,border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:13,
                  ...(transferType==='investment'
                    ?{background:'#2563EB',color:'#fff',boxShadow:'0 2px 8px rgba(37,99,235,0.2)'}
                    :{background:'#F0EFE9',color:'#857A50'})}}>
                Investimento
              </button>
            </div>
          </div>

          {/* Conta destino (só se for account) */}
          {transferType==='account' && (
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'#857A50',textTransform:'uppercase',
                letterSpacing:'0.06em',marginBottom:8}}>Conta destino</p>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {TRANSFER_DESTINATIONS.map(d=>(
                  <button key={d.key} onClick={()=>setDest(d.key)}
                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'11px 14px',borderRadius:12,border:'none',cursor:'pointer',
                      transition:'all 0.1s',
                      ...(dest===d.key
                        ?{background:`${d.color}12`,outline:`1.5px solid ${d.color}`}
                        :{background:'#F8F8F6',outline:'none'})}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:10,background:`${d.color}18`,
                        display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Icon name={d.icon} size={15} color={d.color}/>
                      </div>
                      <div style={{textAlign:'left'}}>
                        <p style={{fontSize:13,fontWeight:600,color:dest===d.key?d.color:'#1A1A14'}}>{d.label}</p>
                        {getBalance(d.key)>0&&(
                          <p style={{fontSize:11,color:'#A8A79E',marginTop:1}}>
                            Saldo atual: {formatCurrency(getBalance(d.key))}
                          </p>
                        )}
                      </div>
                    </div>
                    {dest===d.key&&<div style={{width:8,height:8,borderRadius:4,background:d.color}}/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resumo */}
          <div style={{background:'#F0EFE9',borderRadius:12,padding:'12px 14px'}}>
            <p style={{fontSize:12,color:'#544C31',lineHeight:1.5}}>
              {transferType==='account'
                ? <>Será adicionado <strong style={{color:'#2D7A4F'}}>{formatCurrency(amount)}</strong> à{' '}
                    <strong style={{color:'#1A1A14'}}>{destInfo.label}</strong>
                    {bal>0&&<> (saldo vai para <strong>{formatCurrency(bal+amount)}</strong>)</>}</>
                : <>Será registrado um investimento de <strong style={{color:'#2563EB'}}>{formatCurrency(amount)}</strong></>
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
            <button onClick={confirm}
              style={{flex:2,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                fontSize:14,fontWeight:700,
                background:transferType==='investment'?'#2563EB':'#2D7A4F',color:'#fff',
                boxShadow:`0 4px 14px ${transferType==='investment'?'rgba(37,99,235,0.25)':'rgba(45,122,79,0.25)'}`}}>
              Confirmar transferência
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
  const [transfer, setTransfer] = useState<{txId:string;amount:number;description:string}|null>(null)

  const getPeriod = (k:string):Period => periods[k]||'month'
  const setPeriod = (k:string,p:Period) => setPeriods(prev=>({...prev,[k]:p}))
  const fmt = (v:number) => hidden ? '•••••' : formatCurrency(v)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  const totalGeralMes = transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)
  const totalInvestMes = transactions.filter(t=>t.type==='investment'&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)
  const dizimo = totalGeralMes*0.10

  const cofresData = useMemo(()=>COFRES.map(c=>{
    const period=getPeriod(c.key)
    const start=getStartDate(period)
    const incomes=transactions.filter(t=>t.type==='income'&&t.date>=start&&t.category===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const investments=transactions.filter(t=>t.type==='investment'&&t.date>=start&&t.fromCategory===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const totalIncome=incomes.reduce((s,t)=>s+t.amount,0)
    const totalInvest=investments.reduce((s,t)=>s+t.amount,0)
    const incomeMonth=transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth&&t.category===c.key).reduce((s,t)=>s+t.amount,0)
    const pct=totalGeralMes>0?Math.min(100,Math.round((incomeMonth/totalGeralMes)*100)):0
    return {...c,incomes,investments,totalIncome,totalInvest,pct,period}
  }),[transactions,periods])

  const monthName = now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})

  return (
    <div style={{minHeight:'100vh',background:'#F8F8F6',fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(255,255,255,0.85)',
        backdropFilter:'blur(12px)',borderBottom:'1px solid #E5E3D8'}}>
        <div style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Link href="/" style={{width:32,height:32,borderRadius:10,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>
              <Icon name="back" size={16} color="#6B6140"/>
            </Link>
            <div>
              <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,color:'#292615',margin:0}}>Cofres</h1>
              <p style={{fontSize:11,color:'#A8A79E',margin:0,textTransform:'capitalize'}}>{monthName}</p>
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
            borderRadius:24,padding:24,position:'relative',overflow:'hidden',
            boxShadow:'0 8px 32px rgba(41,38,21,0.3)'}}>
            <div style={{position:'absolute',top:0,right:0,width:200,height:200,
              background:'radial-gradient(circle at top right,rgba(201,168,76,0.12),transparent)',
              pointerEvents:'none'}}/>

            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{width:24,height:24,borderRadius:8,background:'rgba(201,168,76,0.2)',
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="safe" size={13} color="#C9A84C"/>
                  </div>
                  <p style={{fontSize:11,fontWeight:700,color:'#857A50',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                    Total em cofres
                  </p>
                </div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:32,
                  color:'#fff',lineHeight:1,margin:0}}>
                  {hidden?'••••••':formatCurrency(totalGeralMes)}
                </p>
                <p style={{fontSize:11,color:'#6B6140',marginTop:6}}>
                  {transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth).length} entradas em {now.toLocaleDateString('pt-BR',{month:'long'})}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:11,color:'#6B6140',marginBottom:4}}>Investido</p>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,color:'#F0D98A',margin:0}}>
                  {hidden?'•••••':formatCurrency(totalInvestMes)}
                </p>
              </div>
            </div>

            {/* Dízimo */}
            <div style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:14,padding:'12px 14px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:24,height:24,borderRadius:8,background:'rgba(201,168,76,0.15)',
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="heart" size={12} color="#C9A84C"/>
                  </div>
                  <div>
                    <p style={{fontSize:12,fontWeight:700,color:'#C9A84C',margin:0}}>Dízimo sugerido</p>
                    <p style={{fontSize:10,color:'#6B6140',margin:0}}>10% do total recebido</p>
                  </div>
                </div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:17,color:'#C9A84C',margin:0}}>
                  {hidden?'•••••':formatCurrency(dizimo)}
                </p>
              </div>
            </div>

            {/* Mini bars */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {cofresData.map(c=>(
                <div key={c.key} style={{display:'flex',alignItems:'center',gap:10}}>
                  <p style={{fontSize:11,color:'#6B6140',width:80,flexShrink:0,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.key.split(' ')[0]}</p>
                  <div style={{flex:1,height:5,borderRadius:3,background:'rgba(255,255,255,0.06)'}}>
                    <div style={{height:5,borderRadius:3,background:c.accent,
                      width:`${c.pct}%`,transition:'width 0.6s'}}/>
                  </div>
                  <p style={{fontSize:11,color:'#857A50',width:28,textAlign:'right',flexShrink:0}}>{c.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cofres */}
        <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:12}}>
          {cofresData.map(({key,icon,accent,bg,border,textAccent,incomes,investments,totalIncome,totalInvest,pct,period})=>{
            const isOpen=expanded===key
            return (
              <div key={key} style={{background:'#fff',border:'1px solid #F0EFE9',borderRadius:20,overflow:'hidden',
                boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                {/* Header */}
                <div onClick={()=>setExpanded(isOpen?null:key)}
                  style={{padding:16,cursor:'pointer'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:42,height:42,borderRadius:13,background:bg,
                        border:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Icon name={icon} size={19} color={accent}/>
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:'#1A1A14',margin:0}}>{key}</p>
                        <p style={{fontSize:11,color:'#A8A79E',marginTop:2}}>
                          {incomes.length} entrada{incomes.length!==1?'s':''} · {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:17,color:'#1A1A14',margin:0}}>
                        {fmt(totalIncome)}
                      </p>
                      {totalInvest>0&&(
                        <p style={{fontSize:11,fontWeight:600,color:'#2563EB',marginTop:2}}>
                          {fmt(totalInvest)} invest.
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,height:5,borderRadius:3,background:'#F0EFE9'}}>
                      <div style={{height:5,borderRadius:3,background:accent,width:`${pct}%`,transition:'width 0.5s'}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <p style={{fontSize:11,color:'#A8A79E'}}>{pct}%</p>
                      <Icon name={isOpen?'chevronUp':'chevronDown'} size={13} color="#C8C5B8"/>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen&&(
                  <div style={{borderTop:'1px solid #F0EFE9'}}>
                    {/* Period filters */}
                    <div style={{padding:'10px 16px 8px',display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none'}}>
                      {(Object.entries(PERIOD_LABELS) as [Period,string][]).map(([p,l])=>(
                        <button key={p}
                          onClick={e=>{e.stopPropagation();setPeriod(key,p)}}
                          style={{flexShrink:0,padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',
                            fontSize:12,fontWeight:600,transition:'all 0.15s',
                            ...(period===p?{background:accent,color:'#fff'}:{background:'#F0EFE9',color:'#857A50'})}}>
                          {l}
                        </button>
                      ))}
                    </div>

                    <div style={{padding:'0 16px 16px',display:'flex',flexDirection:'column',gap:8}}>
                      {/* Incomes */}
                      {incomes.length>0&&(<>
                        <p style={{fontSize:11,fontWeight:700,color:'#A8A79E',textTransform:'uppercase',
                          letterSpacing:'0.06em',marginBottom:4}}>Entradas</p>
                        {incomes.map(tx=>(
                          <div key={tx.id}
                            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                              padding:'10px 12px',borderRadius:12,background:bg,border:`1px solid ${border}`}}>
                            <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:0}}>
                              <div style={{width:28,height:28,borderRadius:9,background:'rgba(255,255,255,0.7)',
                                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                <Icon name={CATEGORY_ICON[tx.category]||'coins'} size={13} color={accent}/>
                              </div>
                              <div style={{minWidth:0}}>
                                <p style={{fontSize:13,fontWeight:500,color:'#1A1A14',
                                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:0}}>
                                  {tx.description}
                                </p>
                                <p style={{fontSize:11,color:'#A8A79E',margin:0}}>
                                  {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                                </p>
                              </div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:8}}>
                              <p style={{fontSize:13,fontWeight:700,color:textAccent}}>+{fmt(tx.amount)}</p>
                              {/* Botão de transferir */}
                              <button
                                onClick={e=>{e.stopPropagation();setTransfer({txId:tx.id,amount:tx.amount,description:tx.description})}}
                                style={{padding:'5px 8px',borderRadius:8,border:'none',cursor:'pointer',
                                  background:`${accent}20`,color:accent,fontSize:11,fontWeight:700,
                                  display:'flex',alignItems:'center',gap:4}}>
                                <Icon name="arrowRight" size={11} color={accent}/>
                                Transferir
                              </button>
                            </div>
                          </div>
                        ))}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 4px 0',
                          borderTop:'1px solid #F0EFE9',marginTop:2}}>
                          <p style={{fontSize:11,fontWeight:700,color:'#A8A79E'}}>Subtotal</p>
                          <p style={{fontSize:13,fontWeight:700,color:textAccent}}>{fmt(totalIncome)}</p>
                        </div>
                      </>)}

                      {/* Investments */}
                      {investments.length>0&&(<>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,marginBottom:4}}>
                          <Icon name="invest" size={12} color="#2563EB"/>
                          <p style={{fontSize:11,fontWeight:700,color:'#2563EB',
                            textTransform:'uppercase',letterSpacing:'0.06em'}}>Investimentos</p>
                        </div>
                        {investments.map(tx=>(
                          <div key={tx.id}
                            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                              padding:'10px 12px',borderRadius:12,
                              background:'#EFF6FF',border:'1px solid #BFDBFE'}}>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:500,color:'#1D4ED8',
                                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:0}}>
                                {tx.description}
                              </p>
                              <p style={{fontSize:11,color:'#93C5FD',margin:0}}>
                                {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                              </p>
                            </div>
                            <p style={{fontSize:13,fontWeight:700,color:'#2563EB',marginLeft:12,flexShrink:0}}>
                              {fmt(tx.amount)}
                            </p>
                          </div>
                        ))}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 4px 0',
                          borderTop:'1px solid #BFDBFE',marginTop:2}}>
                          <p style={{fontSize:11,fontWeight:700,color:'#93C5FD'}}>Total investido</p>
                          <p style={{fontSize:13,fontWeight:700,color:'#2563EB'}}>{fmt(totalInvest)}</p>
                        </div>
                      </>)}

                      {incomes.length===0&&investments.length===0&&(
                        <div style={{padding:'24px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                          <div style={{width:40,height:40,borderRadius:12,background:'#F0EFE9',
                            display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Icon name="inbox" size={18} color="#C8C5B8"/>
                          </div>
                          <p style={{fontSize:12,color:'#A8A79E'}}>
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

      {/* Transfer Modal */}
      {transfer&&(
        <TransferModal
          txId={transfer.txId}
          amount={transfer.amount}
          description={transfer.description}
          onClose={()=>setTransfer(null)}
        />
      )}
    </div>
  )
}
