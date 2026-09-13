import { useState } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { openPurchasesForMonth } from '@/lib/creditCards'
import Icon from '@/components/Icon'
import MoneyInput from '@/components/MoneyInput'

// Saldo aqui é 100% manual (bankBalances) — de propósito desligado do
// extrato de transações, pra pagar uma conta em qualquer lugar do app não
// abater daqui. Cada banco tem um papel: Mercado Pago paga contas/faturas,
// XP guarda dízimo, Santander recebe TikTok Shop. C6 é só a conta corrente —
// o que está investido vira sua própria linha, separada de todo banco.
const BANKS = [
  { key:'Santander', label:'Santander',       color:'#EC0000' },
  { key:'C6',        label:'C6',              color:'#C9A84C', dark:true, sub:"Conta corrente — o investimento está em \"Investimentos\", mais abaixo" },
  { key:'XP Investimentos', label:'XP Investimentos', color:'#1A1A14' },
  { key:'Inter',     label:'Inter',           color:'#FF7A00' },
  { key:'Nubank',      label:'Nubank',       color:'#820AD1' },
  { key:'Mercado Pago', label:'Mercado Pago', color:'#00A650' },
]

function startOfMonthISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

export default function Bancos() {
  const getBankBalance    = useFinanceStore(s => s.getBankBalance)
  const setBankBalance    = useFinanceStore(s => s.setBankBalance)
  const getAccountBalance = useFinanceStore(s => s.getAccountBalance)
  const bankBalancesRaw   = useFinanceStore(s => s.bankBalances) ?? []
  const transactions      = useFinanceStore(s => s.transactions) ?? []
  const bills             = useFinanceStore(s => s.bills) ?? []
  const cards              = useFinanceStore(s => s.creditCardPurchases) ?? []

  const [editing, setEditing] = useState<string|null>(null)
  const [draft,   setDraft]   = useState(0)

  const som = startOfMonthISO()

  // Mercado Pago paga contas: simula quanto falta (ou sobra) pro próximo mês
  // (contas fixas + fatura de cartão) considerando o saldo atual.
  const nextMonthBills = bills.filter(b=>b.active&&b.recurring).reduce((s,b)=>s+b.amount,0)
  const nextMonthCards = openPurchasesForMonth(cards,'C6',1).reduce((s,p)=>s+p.monthlyAmount,0)
    + openPurchasesForMonth(cards,'Nubank',1).reduce((s,p)=>s+p.monthlyAmount,0)
  const nextMonthTotal = nextMonthBills + nextMonthCards
  const mpBalance = getBankBalance('Mercado Pago')
  const mpGap = nextMonthTotal - mpBalance

  // XP guarda dízimo: quanto já foi pago em Dízimo este mês.
  const dizimoThisMonth = transactions
    .filter(t=>t.type==='expense'&&t.category==='Dízimo'&&t.date>=som)
    .reduce((s,t)=>s+t.amount,0)

  // Santander recebe TikTok Shop: quanto entrou este mês.
  const tiktokThisMonth = transactions
    .filter(t=>t.type==='income'&&t.category==='TikTok Shop'&&t.date>=som)
    .reduce((s,t)=>s+t.amount,0)

  const dynamicSub = (key:string) => {
    if (key==='Mercado Pago') {
      return nextMonthTotal<=0 ? 'Nada previsto pro próximo mês'
        : mpGap>0 ? `Falta ${formatCurrency(mpGap)} pro próximo mês`
        : `Sobra ${formatCurrency(-mpGap)} pro próximo mês`
    }
    if (key==='XP Investimentos') return `Dízimo pago este mês: ${formatCurrency(dizimoThisMonth)}`
    if (key==='Santander')        return `TikTok Shop este mês: ${formatCurrency(tiktokThisMonth)}`
    return null
  }

  const balances = BANKS.map(b => ({ ...b, balance: getBankBalance(b.key), dynSub: dynamicSub(b.key) }))
  const total = balances.reduce((s,b)=>s+b.balance,0)

  // "Investimento" não é banco — fica separado de propósito. Antes de
  // qualquer edição aqui, mostra o valor que já existia (C6 Investimentos)
  // como ponto de partida; depois da 1ª edição vira 100% independente.
  const hasInvestEntry = bankBalancesRaw.some(b=>b.bank==='Investimento')
  const investimento = hasInvestEntry ? getBankBalance('Investimento') : getAccountBalance('C6 Investimentos')

  const S = {
    surface:'#fff', border:'1px solid #F0EFE9',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98', gold:'#8A6D2E',
    olive:'#3D3822', oliveL:'#F0D98A',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
  }

  function startEdit(key: string, balance: number) {
    setEditing(key)
    setDraft(balance)
  }
  function saveEdit() {
    if (!editing) return
    setBankBalance(editing, draft)
    setEditing(null)
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
              color:'#1A1A14',margin:0}}>Bancos</h1>
            <p style={{fontSize:11,color:'#A8A79E',margin:0}}>Onde seu dinheiro está</p>
          </div>
        </div>
      </header>

      <main style={{padding:'16px',display:'flex',flexDirection:'column',gap:16,paddingBottom:40}}>
        {/* Hero: patrimônio total */}
        <div style={{background:'linear-gradient(135deg,#3D3822 0%,#292615 100%)',
          borderRadius:22,padding:'20px 20px 18px',position:'relative',overflow:'hidden',
          boxShadow:'0 8px 28px rgba(41,38,21,0.28)'}}>
          <div style={{position:'absolute',top:0,right:0,width:180,height:180,
            background:'radial-gradient(circle at top right,rgba(201,168,76,0.12),transparent)',pointerEvents:'none'}}/>
          <p style={{fontSize:11,fontWeight:600,color:'#A09868',margin:'0 0 4px',position:'relative'}}>
            Patrimônio total nos bancos
          </p>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:32,color:'#fff',
            margin:0,lineHeight:1,position:'relative'}}>{formatCurrency(total)}</p>
          <p style={{fontSize:12,color:'#857A50',margin:'6px 0 0',position:'relative'}}>
            {balances.length} bancos cadastrados
          </p>
        </div>

        {/* Lista de bancos */}
        <div style={{background:S.surface,borderRadius:18,overflow:'hidden',border:S.border}}>
          {balances.map((b,i) => (
            <div key={b.key}>
              {editing===b.key ? (
                <div style={{padding:'14px 16px',borderTop:i>0?S.border:'none',
                  display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,borderRadius:10,background:b.color,flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>{b.label}</p>
                      {b.sub && <p style={{fontSize:11,color:S.faint,margin:'1px 0 0'}}>{b.sub}</p>}
                    </div>
                  </div>
                  <MoneyInput value={draft} onChange={setDraft} label="O valor que você quer salvar"/>
                  {b.dynSub && (
                    <div style={{background:'#F0EFE9',borderRadius:10,padding:'8px 12px'}}>
                      <p style={{fontSize:11,color:S.muted,margin:0,fontStyle:'italic'}}>
                        Simulação, não afeta o valor salvo: {b.dynSub}
                      </p>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setEditing(null)}
                      style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                        background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
                    <button onClick={saveEdit}
                      style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                        background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Salvar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>startEdit(b.key,b.balance)} className="pressable"
                  style={{width:'100%',display:'flex',alignItems:'center',gap:12,
                    padding:'14px 16px',border:'none',cursor:'pointer',textAlign:'left',
                    background:'transparent',borderTop:i>0?S.border:'none'}}>
                  <div style={{width:36,height:36,borderRadius:11,background:b.color,flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="bank" size={16} color={b.dark?'#111':'#fff'}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:14,fontWeight:600,color:S.text,margin:0}}>{b.label}</p>
                    {b.sub && <p style={{fontSize:11,color:S.faint,margin:'1px 0 0'}}>{b.sub}</p>}
                  </div>
                  <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0,flexShrink:0}}>
                    {formatCurrency(b.balance)}
                  </p>
                  <Icon name="edit" size={13} color={S.faint}/>
                </button>
              )}
            </div>
          ))}
        </div>
        <p style={{fontSize:11,color:S.faint,textAlign:'center',margin:0}}>
          O valor de cada banco é só o que você digitou — pagar uma conta em
          qualquer lugar do app não muda esse número.
        </p>

        {/* Investimento — separado de propósito, não é um banco */}
        <div>
          <p style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:'uppercase',
            letterSpacing:'0.06em',margin:'0 0 8px 2px'}}>Investimentos</p>
          <div style={{background:S.surface,borderRadius:18,overflow:'hidden',border:S.border}}>
            {editing==='Investimento' ? (
              <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:10,background:S.gold,flexShrink:0}}/>
                  <p style={{fontSize:14,fontWeight:700,color:S.text,margin:0}}>Investimento</p>
                </div>
                <MoneyInput value={draft} onChange={setDraft} label="Valor investido"/>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setEditing(null)}
                    style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                      background:'#F0EFE9',color:S.muted,fontSize:13}}>Cancelar</button>
                  <button onClick={saveEdit}
                    style={{flex:1,padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                      background:S.olive,color:S.oliveL,fontSize:13,fontWeight:700}}>Salvar</button>
                </div>
              </div>
            ) : (
              <button onClick={()=>startEdit('Investimento',investimento)} className="pressable"
                style={{width:'100%',display:'flex',alignItems:'center',gap:12,
                  padding:'14px 16px',border:'none',cursor:'pointer',textAlign:'left',background:'transparent'}}>
                <div style={{width:36,height:36,borderRadius:11,background:S.gold,flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon name="invest" size={16} color="#fff"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:600,color:S.text,margin:0}}>Investimento</p>
                  <p style={{fontSize:11,color:S.faint,margin:'1px 0 0'}}>Não relacionado a nenhum banco</p>
                </div>
                <p style={{fontSize:15,fontWeight:700,color:S.text,margin:0,flexShrink:0}}>
                  {formatCurrency(investimento)}
                </p>
                <Icon name="edit" size={13} color={S.faint}/>
              </button>
            )}
          </div>
        </div>

        <p style={{fontSize:12,color:S.faint,textAlign:'center',margin:0}}>
          Toque em um banco pra atualizar o saldo
        </p>
      </main>
    </div>
  )
}
