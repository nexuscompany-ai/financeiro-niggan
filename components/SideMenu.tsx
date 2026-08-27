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
    {key:'Salário FGL Brasil',label:'Salário FGL',   color:'#3B82F6',icon:'briefcase'},
    {key:'Contratos FGL',     label:'Contratos FGL',  color:'#F59E0B',icon:'tool'     },
    {key:'TikTok Shop',       label:'TikTok Shop',    color:'#EC4899',icon:'tiktok'   },
    {key:'F7 Empresa',        label:'F7 Empresa',     color:'#8B5CF6',icon:'building' },
  ]

  const S = {
    olive:'#3D3822', oliveL:'#F0D98A',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    surface:'#fff', border:'1px solid #F0EFE9',
    red:'#C0392B', green:'#2D7A4F',
  }

  const NavCard = ({href,icon,label,value,color,sub}:{href:string,icon:string,label:string,value:string,color:string,sub?:string}) => (
    <Link href={href} onClick={onClose}
      style={{display:'flex',alignItems:'center',padding:'14px 16px',
        background:S.surface,borderRadius:18,border:S.border,textDecoration:'none',
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)',gap:14}}>
      <div style={{width:44,height:44,borderRadius:14,background:`${color}15`,
        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon name={icon} size={20} color={color}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0}}>{label}</p>
        {sub&&<p style={{fontSize:11,color:S.faint,margin:'2px 0 0'}}>{sub}</p>}
      </div>
      <div style={{textAlign:'right',flexShrink:0}}>
        <p style={{fontSize:15,fontWeight:700,color,margin:0}}>{value}</p>
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
        <div style={{padding:'20px 18px 16px',borderBottom:'1px solid #E5E3D8',flexShrink:0,
          background:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:20,
                color:S.text,margin:0}}>Menu</p>
              <p style={{fontSize:12,color:S.faint,margin:'2px 0 0'}}>Ferramentas financeiras</p>
            </div>
            <button onClick={onClose}
              style={{width:36,height:36,borderRadius:11,background:'#F0EFE9',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="close" size={15} color={S.muted}/>
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div style={{flex:1,overflowY:'auto',overscrollBehavior:'contain',
          padding:'16px',display:'flex',flexDirection:'column',gap:10}}>

          {/* Seção finanças */}
          <p style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:'uppercase',
            letterSpacing:'0.08em',margin:'4px 0 4px 4px'}}>Finanças</p>

          <NavCard href="/contas" icon="zap" label="Contas a pagar"
            value={formatCurrency(totalBills)} color="#F59E0B"
            sub={`${bills.filter(b=>b.active&&b.recurring).length} contas fixas`}/>

          <NavCard href="/cartoes" icon="creditCard" label="Cartões de crédito"
            value={formatCurrency(totalCC)} color={S.red}
            sub={`${cards.length} parcela${cards.length!==1?'s':''} ativas`}/>

          <NavCard href="/cofres" icon="safe" label="Cofres"
            value={formatCurrency(totalInc)} color="#2D7A4F"
            sub="Entradas deste mês"/>

          <NavCard href="/investir" icon="invest" label="Simulador de aporte"
            value="" color="#2563EB"
            sub="Simule seus investimentos"/>

          {/* Seção fontes */}
          <p style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:'uppercase',
            letterSpacing:'0.08em',margin:'12px 0 4px 4px'}}>Este mês por fonte</p>

          {SOURCES.map(s=>{
            const v = srcInc(s.key)
            if (v===0) return null
            return (
              <div key={s.key}
                style={{display:'flex',alignItems:'center',padding:'12px 14px',
                  background:S.surface,borderRadius:14,border:S.border,gap:12}}>
                <div style={{width:36,height:36,borderRadius:11,background:`${s.color}15`,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon name={s.icon} size={16} color={s.color}/>
                </div>
                <p style={{fontSize:13,fontWeight:600,color:S.text,flex:1,margin:0}}>{s.label}</p>
                <p style={{fontSize:14,fontWeight:700,color:s.color,margin:0}}>{formatCurrency(v)}</p>
              </div>
            )
          })}

        </div>

        {/* Footer */}
        <div style={{padding:'12px 18px',borderTop:'1px solid #E5E3D8',flexShrink:0,
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
