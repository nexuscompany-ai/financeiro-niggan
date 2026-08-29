import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore, { Bill } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'

const PAY_ACCOUNTS = [
  { key:'Conta corrente',   label:'Conta corrente',   icon:'wallet',    color:'#292615' },
  { key:'C6 Investimentos', label:'C6 Investimentos', icon:'invest',    color:'#C9A84C' },
  { key:'Mercado Pago',     label:'Mercado Pago',      icon:'creditCard',color:'#00A650' },
  { key:'Outros',           label:'Outra conta',       icon:'bank',      color:'#6B6140' },
]
const BILL_CATS = ['Internet','Assinatura','Combustível','Pessoal','Saúde','Moradia','Alimentação','Outros']

function mLabel(off: number) {
  const d = new Date(); d.setMonth(d.getMonth()+off)
  return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}

export default function Contas() {
  const rawBills  = useFinanceStore(s => s.bills)
  const patrimony = useFinanceStore(s => s.patrimony)
  const addBill   = useFinanceStore(s => s.addBill)
  const updateBill= useFinanceStore(s => s.updateBill)
  const removeBill= useFinanceStore(s => s.removeBill)
  const updatePat = useFinanceStore(s => s.updatePatrimony)
  const addTx     = useFinanceStore(s => s.addTransaction)

  const bills = rawBills ?? []
  const [mOff,     setMOff]     = useState(0)
  const [editBill, setEditBill] = useState<Bill|null>(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const [nb,       setNb]       = useState({desc:'',amount:0,day:'',cat:'Internet'})
  const [payId,    setPayId]    = useState<string|null>(null)
  const [payAcct,  setPayAcct]  = useState(PAY_ACCOUNTS[0].key)

  const now = new Date()
  const activeBills = useMemo(()=>
    bills.filter(b=>b.active&&b.recurring).map(b=>{
      const due  = new Date(now.getFullYear(),now.getMonth()+mOff,b.dueDay)
      const past = mOff===0 && due < now
      return {...b,due,past}
    }).sort((a,b)=>a.dueDay-b.dueDay)
  ,[bills,mOff])

  const total = activeBills.reduce((s,b)=>s+b.amount,0)
  const getBalance = (k:string) => (patrimony??[]).find(p=>p.account===k)?.balance??0
  const today = new Date().toISOString().split('T')[0]

  function confirmPay(b: typeof activeBills[0]) {
    const bal = getBalance(payAcct)
    const acct = PAY_ACCOUNTS.find(a=>a.key===payAcct)!
    addTx({type:'expense',category:b.category||'Outras despesas',amount:b.amount,
      description:`${b.description} — pago via ${acct.label}`,date:today})
    updatePat(payAcct, Math.max(0,bal-b.amount))
    setPayId(null)
  }

  const S = {
    surface:'#fff', border:'1px solid #F0EFE9', radius:16,
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    red:'#C0392B', redBg:'#FEF0EE', green:'#2D7A4F', greenBg:'#EBF7F0',
    olive:'#3D3822', oliveL:'#F0D98A',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
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

        {/* Total */}
        <div style={{background:S.redBg,border:'1px solid #FECACA',borderRadius:18,padding:'16px 18px'}}>
          <p style={{fontSize:11,fontWeight:600,color:S.red,margin:'0 0 4px'}}>Total a pagar em {mLabel(mOff)}</p>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:28,color:S.red,margin:0,lineHeight:1}}>
            {formatCurrency(total)}
          </p>
          <p style={{fontSize:11,color:'#FCA5A5',margin:'6px 0 0'}}>
            {activeBills.length} conta{activeBills.length!==1?'s':''}
          </p>
        </div>

        {/* Bills */}
        {activeBills.map(b=>(
          <div key={b.id} style={{background:S.surface,borderRadius:18,overflow:'hidden',
            border:S.border,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
            {payId===b.id ? (
              /* Pay */
              <div style={{padding:16,display:'flex',flexDirection:'column',gap:14}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:38,height:38,borderRadius:12,background:S.redBg,
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="creditCard" size={17} color={S.red}/>
                  </div>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>Pagar {b.description}</p>
                    <p style={{fontSize:13,fontWeight:700,color:S.red,margin:0}}>{formatCurrency(b.amount)}</p>
                  </div>
                </div>

                <div>
                  <p style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',
                    letterSpacing:'0.06em',marginBottom:8,margin:'0 0 8px'}}>De qual conta?</p>
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
                    Será debitado <strong style={{color:S.red}}>{formatCurrency(b.amount)}</strong> da{' '}
                    <strong style={{color:S.text}}>{PAY_ACCOUNTS.find(a=>a.key===payAcct)?.label}</strong>
                    {getBalance(payAcct)>0&&<> · saldo: <strong>{formatCurrency(getBalance(payAcct))}</strong></>}
                  </p>
                </div>

                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setPayId(null)}
                    style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                      background:'#F0EFE9',color:S.muted,fontSize:13,fontWeight:600}}>Cancelar</button>
                  <button onClick={()=>confirmPay(b)}
                    style={{flex:2,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                      background:S.green,color:'#fff',fontSize:13,fontWeight:700,
                      boxShadow:'0 3px 10px rgba(45,122,79,0.25)'}}>Confirmar pagamento</button>
                </div>
              </div>
            ) : editBill?.id===b.id ? (
              /* Edit */
              <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
                <p style={{fontSize:12,fontWeight:700,color:S.muted,margin:0}}>Editando conta</p>
                <input value={editBill.description}
                  onChange={e=>setEditBill({...editBill,description:e.target.value})}
                  style={S.inp} placeholder="Descrição"/>
                <div style={{display:'flex',gap:8}}>
                  <MoneyInput value={editBill.amount} onChange={v=>setEditBill({...editBill,amount:v})}
                    style={{fontSize:16,flex:1}}/>
                  <div style={{position:'relative',width:80}}>
                    <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
                      fontSize:11,color:S.faint}}>Dia</span>
                    <input type="number" min="1" max="31" value={editBill.dueDay}
                      onChange={e=>setEditBill({...editBill,dueDay:parseInt(e.target.value)||1})}
                      style={{...S.inp,paddingLeft:34,width:80}} inputMode="numeric"/>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setEditBill(null)}
                    style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                      background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
                  <button onClick={()=>{updateBill(editBill.id,{
                    description:editBill.description,amount:editBill.amount,dueDay:editBill.dueDay
                  });setEditBill(null)}}
                    style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                      background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Salvar</button>
                </div>
              </div>
            ) : (
              /* Normal */
              <div style={{padding:'14px 16px',opacity:b.past?0.6:1}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:12,flexShrink:0,
                    background:b.past?'#F0F0F0':'#F0EFE9',
                    border:`1px solid ${b.past?'#E5E3D8':'#D8D4B8'}`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="zap" size={17} color={b.past?S.faint:S.muted}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0}}>{b.description}</p>
                    <p style={{fontSize:12,fontWeight:600,color:S.muted,margin:'2px 0 0'}}>
                      Dia {b.dueDay} · {b.category}
                      {b.past&&<span style={{color:S.green}}> · Passado</span>}
                    </p>
                  </div>
                  <p style={{fontSize:16,fontWeight:700,color:S.red,flexShrink:0}}>{formatCurrency(b.amount)}</p>
                </div>
                <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}>
                  <button onClick={()=>{setPayId(b.id);setPayAcct(PAY_ACCOUNTS[0].key)}}
                    style={{width:32,height:32,borderRadius:9,border:'none',cursor:'pointer',
                      background:S.greenBg,display:'flex',alignItems:'center',justifyContent:'center'}}
                    title="Pagar">
                    <Icon name="check" size={14} color={S.green}/>
                  </button>
                  <button onClick={()=>setEditBill(b)}
                    style={{width:32,height:32,borderRadius:9,border:'none',cursor:'pointer',
                      background:'#F0EFE9',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="edit" size={14} color={S.muted}/>
                  </button>
                  <button onClick={()=>removeBill(b.id)}
                    style={{width:32,height:32,borderRadius:9,border:'none',cursor:'pointer',
                      background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="trash" size={14} color={S.red}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeBills.length===0&&(
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{width:48,height:48,borderRadius:16,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
              <Icon name="check" size={22} color="#A8A79E"/>
            </div>
            <p style={{fontSize:14,color:'#A8A79E',margin:0}}>Nenhuma conta para {mLabel(mOff)}</p>
          </div>
        )}

        {/* Add */}
        {showAdd?(
          <div style={{background:S.surface,borderRadius:18,border:'1px solid #E5E3D8',
            padding:16,display:'flex',flexDirection:'column',gap:12}}>
            <p style={{fontSize:14,fontWeight:700,color:'#544C31',margin:0}}>Nova conta fixa</p>
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
              <button onClick={()=>setShowAdd(false)}
                style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                  background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
              <button onClick={()=>{
                const day=parseInt(nb.day)
                if(!nb.desc.trim()||!nb.amount||!day) return
                addBill({description:nb.desc.trim(),amount:nb.amount,dueDay:day,
                  category:nb.cat,recurring:true,active:true})
                setNb({desc:'',amount:0,day:'',cat:'Internet'}); setShowAdd(false)
              }} style={{flex:1,padding:'12px',borderRadius:12,border:'none',cursor:'pointer',
                background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Adicionar</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setShowAdd(true)}
            style={{width:'100%',padding:'14px',borderRadius:16,border:'1.5px dashed #D8D4B8',
              background:'#F7F6F2',color:S.muted,fontSize:13,fontWeight:600,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Icon name="plus" size={15} color={S.muted}/> Adicionar conta fixa
          </button>
        )}
      </main>
    </div>
  )
}
