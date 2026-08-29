import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

interface Props { open: boolean; onClose: () => void }

export default function SideMenu({ open, onClose }: Props) {
  const bills   = useFinanceStore(s => s.bills)   ?? []
  const cards   = useFinanceStore(s => s.creditCardPurchases) ?? []
  const txs     = useFinanceStore(s => s.transactions) ?? []

  if (!open) return null

  const now = new Date()
  const som = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]

  const totalBills = bills.filter(b=>b.active&&b.recurring).reduce((s,b)=>s+b.amount,0)
  const totalCC    = cards.reduce((s,p)=>s+p.monthlyAmount,0)
  const totalInc   = txs.filter(t=>t.type==='income'&&t.date>=som).reduce((s,t)=>s+t.amount,0)

  const srcInc = (k:string) => txs.filter(t=>t.type==='income'&&t.category===k&&t.date>=som).reduce((s,t)=>s+t.amount,0)

  const SOURCES = [
    {key:'Salário FGL Brasil',label:'Salário FGL',   icon:'briefcase'},
    {key:'Contratos FGL',     label:'Contratos FGL',  icon:'tool'     },
    {key:'TikTok Shop',       label:'TikTok Shop',    icon:'tiktok'   },
    {key:'F7 Empresa',        label:'F7 Empresa',     icon:'building' },
  ]

  const S = {
    olive:'#3D3822', oliveL:'#F0D98A', oliveDark:'#292615',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    surface:'#fff', border:'#F0EFE9',
    iconBg:'rgba(201,168,76,0.14)', iconColor:'#8A6D2E',
    red:'#C0392B', green:'#2D7A4F', gold:'#8A6D2E',
  }

  const NavRow = ({href,icon,label,value,valueColor,sub,divider}:
    {href:string,icon:string,label:string,value:string,valueColor?:string,sub?:string,divider?:boolean}) => (
    <Link href={href} onClick={onClose} className="pressable"
      style={{display:'flex',alignItems:'center',padding:'14px 16px',
        textDecoration:'none', gap:14,
        borderTop:divider?`1px solid ${S.border}`:'none'}}>
      <div style={{width:42,height:42,borderRadius:13,background:S.iconBg,
        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon name={icon} size={19} color={S.iconColor}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>{label}</p>
        {sub&&<p style={{fontSize:11,color:S.faint,margin:'2px 0 0'}}>{sub}</p>}
      </div>
      <div style={{textAlign:'right',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
        {value&&<p style={{fontSize:14,fontWeight:700,color:valueColor||S.text,margin:0}}>{value}</p>}
        <Icon name="arrowRight" size={14} color={S.faint}/>
      </div>
    </Link>
  )

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{position:'fixed',inset:0,zIndex:50,
          background:'rgba(20,18,10,0.55)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}}/>

      {/* Drawer */}
      <div style={{position:'fixed',top:0,right:0,height:'100%',zIndex:51,
        width:'88vw',maxWidth:360,background:'#F8F8F6',
        boxShadow:'-12px 0 56px rgba(0,0,0,0.22)',
        display:'flex',flexDirection:'column',overflowY:'hidden',
        fontFamily:'Inter,system-ui,sans-serif'}}>

        {/* Header */}
        <div style={{padding:'20px 18px 18px',flexShrink:0,
          background:'linear-gradient(180deg,#3D3822 0%,#292615 100%)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:38,height:38,borderRadius:12,background:'rgba(201,168,76,0.18)',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon name="safe" size={18} color="#C9A84C"/>
              </div>
              <div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:19,
                  color:'#fff',margin:0}}>Menu</p>
                <p style={{fontSize:11,color:'#A09868',margin:'2px 0 0'}}>Ferramentas financeiras</p>
              </div>
            </div>
            <button onClick={onClose} className="pressable"
              style={{width:34,height:34,borderRadius:11,background:'rgba(255,255,255,0.08)',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="close" size={14} color="#C8C5B8"/>
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div style={{flex:1,overflowY:'auto',overscrollBehavior:'contain',
          padding:'16px',display:'flex',flexDirection:'column',gap:18}}>

          {/* Seção finanças */}
          <div>
            <p style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:'uppercase',
              letterSpacing:'0.08em',margin:'0 0 8px 4px'}}>Finanças</p>
            <div>
              <NavRow href="/contas" icon="zap" label="Contas a pagar"
                value={formatCurrency(totalBills)} valueColor={S.red}
                sub={`${bills.filter(b=>b.active&&b.recurring).length} contas fixas`}/>

              <NavRow href="/cartoes" icon="creditCard" label="Cartões de crédito"
                value={formatCurrency(totalCC)} valueColor={S.red}
                sub={`${cards.length} parcela${cards.length!==1?'s':''} ativas`} divider/>

              <NavRow href="/cofres" icon="safe" label="Cofres"
                value={formatCurrency(totalInc)} valueColor={S.green}
                sub="Entradas deste mês" divider/>

              <NavRow href="/investir" icon="invest" label="Simulador de aporte"
                value="" sub="Simule seus investimentos" divider/>
            </div>
          </div>

          {/* Seção fontes */}
          {(() => {
            const activeSources = SOURCES.map(s=>({...s,v:srcInc(s.key)})).filter(s=>s.v>0)
            if (activeSources.length===0) return null
            return (
              <div>
                <p style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:'uppercase',
                  letterSpacing:'0.08em',margin:'0 0 8px 4px'}}>Este mês por fonte</p>
                <div>
                  {activeSources.map((s,i)=>(
                    <div key={s.key}
                      style={{display:'flex',alignItems:'center',padding:'12px 16px',gap:12,
                        borderTop:i>0?`1px solid ${S.border}`:'none'}}>
                      <div style={{width:34,height:34,borderRadius:11,background:S.iconBg,
                        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Icon name={s.icon} size={15} color={S.iconColor}/>
                      </div>
                      <p style={{fontSize:13,fontWeight:600,color:S.text,flex:1,margin:0}}>{s.label}</p>
                      <p style={{fontSize:13,fontWeight:700,color:S.oliveDark,margin:0}}>{formatCurrency(s.v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

        </div>

        {/* Footer */}
        <div style={{padding:'12px 18px',borderTop:`1px solid ${S.border}`,flexShrink:0,
          background:'#fff',textAlign:'center'}}>
          <Link href="/settings" onClick={onClose}
            style={{fontSize:12,color:S.faint,textDecoration:'none'}}>
            Configurações
          </Link>
        </div>
      </div>
    </>
  )
}
