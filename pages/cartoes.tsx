import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import useFinanceStore, { CreditCardPurchase } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'
import { installmentsLeft as instLeft, isBilledInMonth, isPaidForMonth, openPurchasesForMonth } from '@/lib/creditCards'

const PAY_ACCOUNTS = [
  { key:'Conta corrente',   label:'Conta corrente',   icon:'wallet',    color:'#292615' },
  { key:'C6 Investimentos', label:'C6 Investimentos', icon:'invest',    color:'#C9A84C' },
  { key:'Mercado Pago',     label:'Mercado Pago',      icon:'creditCard',color:'#00A650' },
  { key:'Outros',           label:'Outra conta',       icon:'bank',      color:'#6B6140' },
]

function mLabel(off: number) {
  const d = new Date(); d.setMonth(d.getMonth()+off)
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}

export default function Cartoes() {
  const rawCards  = useFinanceStore(s => s.creditCardPurchases)
  const addCC     = useFinanceStore(s => s.addCreditCardPurchase)
  const updateCC  = useFinanceStore(s => s.updateCreditCardPurchase)
  const removeCC  = useFinanceStore(s => s.removeCreditCardPurchase)
  const payCreditCardBill = useFinanceStore(s => s.payCreditCardBill)
  const getAccountBalance = useFinanceStore(s => s.getAccountBalance)

  const cards = rawCards ?? []
  const [mOff,    setMOff]    = useState(0)
  const [editCC,  setEditCC]  = useState<CreditCardPurchase|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [ccF,     setCCF]     = useState({desc:'',total:0,inst:'1',card:'C6' as 'C6'|'Nubank'})
  const [showPay, setShowPay] = useState(false)
  const [payCard, setPayCard] = useState<'C6'|'Nubank'>('C6')
  const [payAcct, setPayAcct] = useState(PAY_ACCOUNTS[0].key)
  const [paying,  setPaying]  = useState(false)
  const payingRef = useRef(false)

  // Lista de exibição: tudo faturado nesse mês (calendário), pago ou não.
  const c6List = useMemo(()=>cards.filter(p=>p.card==='C6'&&isBilledInMonth(p,mOff)),[cards,mOff])
  const nuList = useMemo(()=>cards.filter(p=>p.card==='Nubank'&&isBilledInMonth(p,mOff)),[cards,mOff])

  // Valor a pagar: só o que está faturado E ainda não foi pago — é o mesmo
  // cálculo que payCreditCardBill usa, então o botão nunca cobra de novo o
  // que já foi quitado.
  const totalC6 = useMemo(()=>openPurchasesForMonth(cards,'C6',mOff).reduce((s,p)=>s+p.monthlyAmount,0),[cards,mOff])
  const totalNu = useMemo(()=>openPurchasesForMonth(cards,'Nubank',mOff).reduce((s,p)=>s+p.monthlyAmount,0),[cards,mOff])
  const totalCC = totalC6+totalNu

  const getBalance = (k:string) => getAccountBalance(k)

  function openPay() {
    payingRef.current = false
    setPaying(false)
    setPayCard(totalC6>0?'C6':'Nubank')
    setShowPay(true)
  }

  // Trava contra clique duplo: o ref é síncrono (não depende de re-render),
  // então mesmo dois toques bem rápidos (ou o clique "grudando") não disparam
  // o pagamento duas vezes. Só é resetado quando o modal é reaberto.
  function confirmPay() {
    if (payingRef.current) return
    payingRef.current = true
    setPaying(true)
    const acct = PAY_ACCOUNTS.find(a=>a.key===payAcct)!
    payCreditCardBill(payCard, payAcct, acct.label)
    setShowPay(false)
  }

  const S = {
    surface:'#fff', border:'1px solid #F0EFE9',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    red:'#C0392B', redBg:'#FEF0EE', green:'#2D7A4F',
    olive:'#3D3822', oliveL:'#F0D98A',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
  }

  const CardRow = ({p}:{p:CreditCardPurchase}) => {
    const paid = isPaidForMonth(p, mOff)
    return (
    <div>
      {editCC?.id===p.id ? (
        <div style={{padding:'12px 16px',borderTop:S.border,display:'flex',flexDirection:'column',gap:10}}>
          <input value={editCC.description}
            onChange={e=>setEditCC({...editCC,description:e.target.value})} style={S.inp}/>
          <MoneyInput value={editCC.monthlyAmount}
            onChange={v=>setEditCC({...editCC,monthlyAmount:v})} label="Valor mensal (R$/mês)"/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setEditCC(null)}
              style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
            <button onClick={()=>{updateCC(editCC.id,{
              description:editCC.description,monthlyAmount:editCC.monthlyAmount
            });setEditCC(null)}}
              style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Salvar</button>
          </div>
        </div>
      ) : (
        <div style={{display:'flex',alignItems:'center',padding:'12px 16px',
          borderTop:S.border,gap:10,opacity:paid?0.55:1}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:14,fontWeight:600,color:S.text,margin:0,
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description}</p>
            <p style={{fontSize:11,color:S.faint,margin:'3px 0 0'}}>
              {p.installments>1
                ?`${p.currentInstallment}/${p.installments}× · ${instLeft(p)} restante${instLeft(p)!==1?'s':''}`
                :'À vista'}{' · '}{p.category}{paid?' · paga':''}
            </p>
          </div>
          <p style={{fontSize:14,fontWeight:700,color:paid?S.green:S.red,flexShrink:0}}>{formatCurrency(p.monthlyAmount)}</p>
          <div style={{display:'flex',gap:5,flexShrink:0}}>
            <button onClick={()=>setEditCC(p)}
              style={{width:30,height:30,borderRadius:9,border:'none',cursor:'pointer',
                background:'#F0EFE9',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="edit" size={13} color={S.muted}/>
            </button>
            <button onClick={()=>removeCC(p.id)}
              style={{width:30,height:30,borderRadius:9,border:'none',cursor:'pointer',
                background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="close" size={13} color={S.red}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )}

  return (
    <div style={{minHeight:'100vh',background:'#F8F8F6',fontFamily:'Inter,system-ui,sans-serif'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(255,255,255,0.9)',
        backdropFilter:'blur(12px)',borderBottom:'1px solid #E5E3D8'}}>
        <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
          <Link href="/" style={{width:34,height:34,borderRadius:10,background:'#F0EFE9',
            display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
            <Icon name="back" size={16} color="#6B6140"/>
          </Link>
          <div>
            <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
              color:'#1A1A14',margin:0}}>Cartões de crédito</h1>
            <p style={{fontSize:11,color:'#A8A79E',margin:0,textTransform:'capitalize'}}>{mLabel(mOff)}</p>
          </div>
        </div>
      </header>

      <main style={{padding:'16px',display:'flex',flexDirection:'column',gap:14,paddingBottom:40}}>
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

        {/* Total + pagar */}
        <div style={{background:S.surface,borderRadius:18,padding:'16px 18px',border:S.border}}>
          <p style={{fontSize:11,fontWeight:600,color:S.faint,margin:'0 0 4px'}}>Total em cartões — {mLabel(mOff)}</p>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:28,
            color:S.red,margin:'0 0 12px',lineHeight:1}}>{formatCurrency(totalCC)}</p>
          {mOff!==0 ? (
            <p style={{fontSize:12,color:S.faint,textAlign:'center',margin:0}}>
              Só dá pra pagar a fatura do mês atual
            </p>
          ) : totalCC<=0 ? (
            <p style={{fontSize:12,color:S.green,textAlign:'center',margin:0,fontWeight:600}}>
              Fatura deste mês já está paga ✓
            </p>
          ) : (
            <button onClick={()=>showPay?setShowPay(false):openPay()}
              style={{width:'100%',padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                ...(showPay?{background:'#F0EFE9',color:S.muted}:{background:S.olive,color:S.oliveL,
                  boxShadow:'0 4px 12px rgba(41,38,21,0.25)'})}}>
              <Icon name="creditCard" size={16} color={showPay?S.muted:S.oliveL}/>
              Pagar fatura
            </button>
          )}
        </div>

        {/* Pay card */}
        {showPay&&(
          <div style={{background:S.surface,borderRadius:18,padding:16,border:'1.5px solid #D8D4B8',
            display:'flex',flexDirection:'column',gap:16}}>
            <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0}}>Pagar fatura</p>

            <div>
              <p style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',
                letterSpacing:'0.06em',margin:'0 0 8px'}}>Cartão</p>
              <div style={{display:'flex',gap:8}}>
                {(['C6','Nubank'] as const).map(c=>{
                  const cTotal = c==='C6'?totalC6:totalNu
                  const zero = cTotal<=0
                  return (
                  <button key={c} onClick={()=>!zero&&setPayCard(c)} disabled={zero}
                    style={{flex:1,padding:'12px 8px',borderRadius:12,border:'none',
                      cursor:zero?'default':'pointer',
                      fontWeight:700,fontSize:13,opacity:zero?0.45:1,
                      ...(payCard===c
                        ?{background:c==='C6'?'#111':'#820AD1',color:c==='C6'?'#C9A84C':'#fff'}
                        :{background:'#F0EFE9',color:S.muted})}}>
                    {c==='C6'?'C6 Black':'Nubank'}
                    <span style={{display:'block',fontWeight:400,fontSize:12,marginTop:3,opacity:0.8}}>
                      {zero?'Já paga':formatCurrency(cTotal)}
                    </span>
                  </button>
                )})}
              </div>
            </div>

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
                Saída de <strong style={{color:S.red}}>{formatCurrency(payCard==='C6'?totalC6:totalNu)}</strong>{' '}
                da <strong style={{color:S.text}}>{PAY_ACCOUNTS.find(a=>a.key===payAcct)?.label}</strong>
              </p>
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowPay(false)} disabled={paying}
                style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                  background:'#F0EFE9',color:S.muted,fontSize:13,opacity:paying?0.6:1}}>Cancelar</button>
              <button onClick={confirmPay} disabled={paying||(payCard==='C6'?totalC6:totalNu)<=0}
                style={{flex:2,padding:'12px',borderRadius:12,border:'none',
                  cursor:paying?'default':'pointer',
                  background:S.green,color:'#fff',fontSize:13,fontWeight:700,
                  opacity:paying||(payCard==='C6'?totalC6:totalNu)<=0?0.5:1,
                  boxShadow:'0 3px 10px rgba(45,122,79,0.25)'}}>
                {paying?'Pagando...':'Confirmar'}
              </button>
            </div>
          </div>
        )}

        {/* C6 */}
        <div style={{background:S.surface,borderRadius:18,overflow:'hidden',border:S.border}}>
          <div style={{background:'#111',padding:'14px 16px',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:'#C9A84C',margin:0}}>C6 Black</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.35)',margin:'2px 0 0'}}>
                Vence dia 1 · {c6List.length} compra{c6List.length!==1?'s':''}
              </p>
            </div>
            <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:20,
              color:totalC6>0?'#F87171':'#4ADE80',margin:0}}>{formatCurrency(totalC6)}</p>
          </div>
          {c6List.length===0
            ?<p style={{padding:'14px 16px',fontSize:13,color:S.faint}}>Nenhuma parcela ativa em {mLabel(mOff)}</p>
            :c6List.map(p=><CardRow key={p.id} p={p}/>)
          }
        </div>

        {/* Nubank */}
        <div style={{background:S.surface,borderRadius:18,overflow:'hidden',border:S.border}}>
          <div style={{background:'#820AD1',padding:'14px 16px',
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontSize:14,fontWeight:700,color:'#fff',margin:0}}>Nubank</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',margin:'2px 0 0'}}>
                Vence dia 10 · {nuList.length} compra{nuList.length!==1?'s':''}
              </p>
            </div>
            <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:20,
              color:totalNu>0?'#F87171':'#4ADE80',margin:0}}>{formatCurrency(totalNu)}</p>
          </div>
          {nuList.length===0
            ?<p style={{padding:'14px 16px',fontSize:13,color:S.faint}}>Nenhuma parcela ativa em {mLabel(mOff)}</p>
            :nuList.map(p=><CardRow key={p.id} p={p}/>)
          }
        </div>

        {/* Add parcela */}
        {showAdd?(
          <div style={{background:S.surface,borderRadius:18,border:'1px solid #E5E3D8',
            padding:16,display:'flex',flexDirection:'column',gap:12}}>
            <p style={{fontSize:14,fontWeight:700,color:'#544C31',margin:0}}>Nova compra parcelada</p>
            <div style={{display:'flex',gap:8}}>
              {(['C6','Nubank'] as const).map(c=>(
                <button key={c} onClick={()=>setCCF(f=>({...f,card:c}))}
                  style={{flex:1,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',
                    fontWeight:700,fontSize:13,
                    ...(ccF.card===c?{background:c==='C6'?'#111':'#820AD1',color:c==='C6'?'#C9A84C':'#fff'}
                      :{background:'#F0EFE9',color:S.muted})}}>
                  {c==='C6'?'C6 Black':'Nubank'}
                </button>
              ))}
            </div>
            <input placeholder="Descrição" value={ccF.desc}
              onChange={e=>setCCF(f=>({...f,desc:e.target.value}))} style={S.inp}/>
            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <div style={{flex:1}}>
                <MoneyInput value={ccF.total} onChange={v=>setCCF(f=>({...f,total:v}))} label="Valor total"/>
              </div>
              <div style={{width:90}}>
                <p style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:6,margin:'0 0 6px',
                  textTransform:'uppercase',letterSpacing:'0.05em'}}>Parcelas</p>
                <select value={ccF.inst} onChange={e=>setCCF(f=>({...f,inst:e.target.value}))}
                  style={{...S.inp,width:90,cursor:'pointer',padding:'11px 8px'}}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n=><option key={n} value={n}>{n}×</option>)}
                </select>
              </div>
            </div>
            {ccF.total>0&&parseInt(ccF.inst)>1&&(
              <div style={{background:'#F0EFE9',borderRadius:10,padding:'8px 12px'}}>
                <p style={{fontSize:12,color:'#544C31',margin:0}}>
                  {ccF.inst}× de {formatCurrency(ccF.total/parseInt(ccF.inst))} ·{' '}
                  <span style={{color:S.muted}}>quitado em {ccF.inst} meses</span>
                </p>
              </div>
            )}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowAdd(false)}
                style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                  background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
              <button onClick={()=>{
                if(!ccF.total||!ccF.desc.trim()) return
                const inst=parseInt(ccF.inst); const n=new Date()
                addCC({card:ccF.card,description:ccF.desc.trim(),totalAmount:ccF.total,
                  installments:inst,currentInstallment:1,
                  monthlyAmount:parseFloat((ccF.total/inst).toFixed(2)),
                  startDate:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`,
                  category:'Outros'})
                setCCF({desc:'',total:0,inst:'1',card:'C6'}); setShowAdd(false)
              }} style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Confirmar</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setShowAdd(true)}
            style={{width:'100%',padding:'14px',borderRadius:16,border:'1.5px dashed #D8D4B8',
              background:'#F7F6F2',color:S.muted,fontSize:13,fontWeight:600,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Icon name="plus" size={15} color={S.muted}/> Nova parcela
          </button>
        )}

        {/* Resumo */}
        <div style={{background:S.surface,borderRadius:18,padding:'14px 16px',border:S.border}}>
          {[{l:'C6 Black',v:totalC6},{l:'Nubank',v:totalNu}].map(r=>(
            <div key={r.l} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,color:S.muted}}>{r.l}</span>
              <span style={{fontSize:13,fontWeight:700,color:S.text}}>{formatCurrency(r.v)}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,
            borderTop:'1px solid #E5E3D8'}}>
            <span style={{fontSize:14,fontWeight:700,color:S.text}}>Total</span>
            <span style={{fontSize:14,fontWeight:700,color:S.red}}>{formatCurrency(totalCC)}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
