import { useState } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'

const SOURCE_COLOR = '#8A6D2E'

const SOURCES = [
  {key:'Salário FGL Brasil',label:'Salário FGL',  color:SOURCE_COLOR,icon:'briefcase'},
  {key:'Contratos FGL',     label:'Contratos FGL', color:SOURCE_COLOR,icon:'tool'     },
  {key:'TikTok Shop',       label:'TikTok Shop',   color:SOURCE_COLOR,icon:'tiktok'   },
  {key:'F7 Empresa',        label:'F7 Empresa',    color:SOURCE_COLOR,icon:'building' },
  {key:'Outras receitas',   label:'Outras receitas',color:SOURCE_COLOR,icon:'coins'   },
]

export default function Investir() {
  const txs = useFinanceStore(s => s.transactions) ?? []
  const patrimony       = useFinanceStore(s => s.patrimony)
  const addTransaction  = useFinanceStore(s => s.addTransaction)
  const updatePatrimony = useFinanceStore(s => s.updatePatrimony)

  const som = new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split('T')[0]
  const srcInc = (k:string) => txs.filter(t=>t.type==='income'&&t.category===k&&t.date>=som).reduce((s,t)=>s+t.amount,0)

  const [src,       setSrc]       = useState(SOURCES[0].key)
  const [total,     setTotal]     = useState(0)
  const [invest,    setInvest]    = useState(0)
  const [result,    setResult]    = useState<{r:number;i:number;p:number}|null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const selSrc  = SOURCES.find(s=>s.key===src)!
  const autoInc = srcInc(src)
  const valid   = total>0 && invest>0 && invest<=total

  function calcular() {
    if (!valid) return
    setResult({r:total-invest,i:invest,p:Math.round((invest/total)*100)})
    setConfirmed(false)
  }

  function confirmarAporte() {
    if (!result || confirmed) return
    const today = new Date().toISOString().split('T')[0]
    addTransaction({ type:'investment', category:'Aporte extra', amount:result.i,
      description:`Aporte — ${selSrc.label}`, date:today, fromCategory:selSrc.key })
    const investido = patrimony.find(p=>p.account==='C6 Investimentos')?.balance || 0
    updatePatrimony('C6 Investimentos', investido + result.i)
    setConfirmed(true)
  }

  const S = {
    olive:'#3D3822', oliveL:'#F0D98A',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    surface:'#fff', border:'1px solid #F0EFE9',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
  }

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
              color:S.text,margin:0}}>Simulador de aporte</h1>
            <p style={{fontSize:11,color:'#A8A79E',margin:0}}>Simule seus investimentos</p>
          </div>
        </div>
      </header>

      <main style={{padding:'16px',display:'flex',flexDirection:'column',gap:16,paddingBottom:40}}>
        {/* Info */}
        <div style={{background:'#F0EFE9',border:'1px solid #D8D4B8',borderRadius:16,
          padding:'12px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
          <Icon name="invest" size={16} color={S.muted}/>
          <p style={{fontSize:13,color:'#544C31',margin:0,lineHeight:1.5}}>
            Escolha uma fonte de renda, informe o valor disponível e quanto deseja investir.
            O simulador mostra o que sobra.
          </p>
        </div>

        {/* Fonte */}
        <div>
          <p style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',
            letterSpacing:'0.06em',margin:'0 0 10px'}}>Fonte de renda</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {SOURCES.map(s=>{
              const mi=srcInc(s.key); const sel=src===s.key
              return (
                <button key={s.key} onClick={()=>{setSrc(s.key);setResult(null)}}
                  style={{padding:'14px 12px',borderRadius:16,border:'none',cursor:'pointer',
                    textAlign:'left',transition:'all 0.15s',
                    ...(sel?{background:`${s.color}14`,outline:`1.5px solid ${s.color}`}
                      :{background:S.surface,outline:'1px solid #F0EFE9'})}}>
                  <div style={{width:28,height:28,borderRadius:9,background:`${s.color}20`,
                    display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                    <Icon name={s.icon} size={14} color={s.color}/>
                  </div>
                  <p style={{fontSize:13,fontWeight:700,color:sel?s.color:S.text,margin:'0 0 2px'}}>{s.label}</p>
                  <p style={{fontSize:12,color:sel?s.color:S.faint,margin:0}}>
                    {mi>0?formatCurrency(mi):'Sem entrada este mês'}
                  </p>
                </button>
              )
            })}
          </div>
          {autoInc>0&&(
            <button onClick={()=>{setTotal(autoInc);setResult(null)}}
              style={{width:'100%',marginTop:8,padding:'10px',borderRadius:12,
                border:'1px dashed #D8D4B8',background:'#F7F6F2',color:S.muted,
                fontSize:12,fontWeight:600,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <Icon name="arrowDown" size={12} color={S.muted}/>
              Usar {formatCurrency(autoInc)} recebidos
            </button>
          )}
        </div>

        {/* Valor disponível */}
        <MoneyInput value={total} onChange={v=>{setTotal(v);setResult(null)}}
          label="Valor disponível"/>

        {/* Quero investir */}
        <div>
          <MoneyInput value={invest} onChange={v=>{setInvest(v);setResult(null)}}
            label="Quero investir"/>
          {total>0&&(
            <div style={{display:'flex',gap:6,marginTop:8}}>
              {[10,20,30,50].map(p=>(
                <button key={p} onClick={()=>{setInvest(Math.round(total*p/100*100)/100);setResult(null)}}
                  style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',
                    background:'#F0EFE9',color:S.muted,fontSize:12,fontWeight:700}}>
                  {p}%
                </button>
              ))}
            </div>
          )}
          {invest>total&&total>0&&(
            <p style={{fontSize:12,color:'#C0392B',margin:'6px 0 0'}}>
              Valor maior que o disponível
            </p>
          )}
        </div>

        <button onClick={calcular} disabled={!valid}
          style={{width:'100%',padding:'15px',borderRadius:16,border:'none',cursor:'pointer',
            fontSize:15,fontWeight:700,
            ...(!valid?{background:'#F0EFE9',color:S.faint}
              :{background:S.olive,color:S.oliveL,boxShadow:'0 4px 14px rgba(41,38,21,0.25)'})}}>
          Calcular
        </button>

        {result&&(
          <div style={{borderRadius:18,overflow:'hidden',
            outline:`1.5px solid ${selSrc.color}30`,background:S.surface}}>
            <div style={{background:`${selSrc.color}10`,padding:18}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:30,height:30,borderRadius:10,background:`${selSrc.color}20`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name={selSrc.icon} size={15} color={selSrc.color}/>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:selSrc.color}}>{selSrc.label}</span>
                </div>
                <span style={{fontSize:15,fontWeight:700,color:selSrc.color}}>{result.p}%</span>
              </div>
              <div style={{height:12,borderRadius:6,background:'rgba(0,0,0,0.07)'}}>
                <div style={{height:12,borderRadius:6,background:selSrc.color,
                  width:`${result.p}%`,transition:'width 0.5s'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',
              borderTop:`1px solid ${selSrc.color}20`}}>
              {[{l:'Investido',v:result.i,c:selSrc.color},{l:'Restante',v:result.r,c:'#2D7A4F'}].map(x=>(
                <div key={x.l} style={{padding:'16px 14px',textAlign:'center',
                  borderRight:x.l==='Investido'?`1px solid ${selSrc.color}20`:'none'}}>
                  <p style={{fontSize:11,color:S.faint,margin:'0 0 6px'}}>{x.l}</p>
                  <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:20,
                    color:x.c,margin:0}}>{formatCurrency(x.v)}</p>
                </div>
              ))}
            </div>
            <div style={{padding:'0 14px 14px',borderTop:`1px solid ${selSrc.color}20`}}>
              {confirmed ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  padding:'13px',marginTop:14,borderRadius:14,background:'#EBF7F0'}}>
                  <Icon name="check" size={15} color="#2D7A4F"/>
                  <span style={{fontSize:13,fontWeight:700,color:'#2D7A4F'}}>Aporte registrado no Investido</span>
                </div>
              ) : (
                <button onClick={confirmarAporte}
                  style={{width:'100%',marginTop:14,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                    fontSize:14,fontWeight:700,background:S.olive,color:S.oliveL,
                    boxShadow:'0 4px 14px rgba(41,38,21,0.25)'}}>
                  Confirmar aporte de {formatCurrency(result.i)}
                </button>
              )}
            </div>
            <button onClick={()=>{setTotal(0);setInvest(0);setResult(null);setConfirmed(false)}}
              style={{width:'100%',padding:'12px',border:'none',cursor:'pointer',
                background:'#F8F8F6',color:S.faint,fontSize:12,borderTop:'1px solid #F0EFE9'}}>
              Limpar simulação
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
