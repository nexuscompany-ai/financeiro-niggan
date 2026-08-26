import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon, { CATEGORY_ICON } from '@/components/Icon'

type Period = 'month'|'7d'|'90d'|'all'
const PERIOD_LABELS: Record<Period,string> = { month:'Este mês', '7d':'7 dias', '90d':'90 dias', all:'Histórico' }

const COFRES = [
  { key:'Salário FGL Brasil',      icon:'briefcase', accent:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE', textAccent:'#1D4ED8' },
  { key:'Contratos FGL', icon:'tool',       accent:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A', textAccent:'#92400E' },
  { key:'TikTok Shop',             icon:'tiktok',     accent:'#EC4899', bg:'#FDF2F8', border:'#FBCFE8', textAccent:'#9D174D' },
]

function getStartDate(p: Period): string {
  const now = new Date()
  if (p==='month') return new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
  if (p==='7d')  { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] }
  if (p==='90d') { const d=new Date(); d.setDate(d.getDate()-90); return d.toISOString().split('T')[0] }
  return '2000-01-01'
}

export default function Cofres() {
  const transactions = useFinanceStore(s => s.transactions)
  const [hidden,   setHidden]   = useState(false)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [periods,  setPeriods]  = useState<Record<string,Period>>({})

  const getPeriod = (k: string): Period => periods[k] || 'month'
  const setPeriod = (k: string, p: Period) => setPeriods(prev=>({...prev,[k]:p}))
  const fmt       = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const startOfMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split('T')[0]
  const totalGeralMes = transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)
  const totalInvestMes = transactions.filter(t=>t.type==='investment'&&t.date>=startOfMonth).reduce((s,t)=>s+t.amount,0)

  const cofresData = useMemo(()=>COFRES.map(c=>{
    const period = getPeriod(c.key)
    const start  = getStartDate(period)
    const incomes = transactions.filter(t=>t.type==='income'&&t.date>=start&&t.category===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const investments = transactions.filter(t=>t.type==='investment'&&t.date>=start&&t.fromCategory===c.key).sort((a,b)=>b.date.localeCompare(a.date))
    const totalIncome = incomes.reduce((s,t)=>s+t.amount,0)
    const totalInvest = investments.reduce((s,t)=>s+t.amount,0)
    const incomeMonth = transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth&&t.category===c.key).reduce((s,t)=>s+t.amount,0)
    const pct = totalGeralMes>0 ? Math.min(100,Math.round((incomeMonth/totalGeralMes)*100)) : 0
    return { ...c, incomes, investments, totalIncome, totalInvest, pct, period }
  }),[transactions,periods])

  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})

  return (
    <div className="min-h-screen" style={{ background:'#F8F8F6' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderBottom:'1px solid #E5E3D8' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-xl flex items-center justify-center pressable"
              style={{ background:'#F0EFE9' }}>
              <Icon name="back" size={16} color="#6B6140" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight" style={{ color:'#292615' }}>Cofres</h1>
              <p className="text-xs capitalize" style={{ color:'#A8A79E' }}>{monthName}</p>
            </div>
          </div>
          <button onClick={()=>setHidden(h=>!h)}
            className="w-9 h-9 rounded-xl flex items-center justify-center pressable transition-all"
            style={{ background:hidden?'#3D3822':'#F0EFE9' }}>
            <Icon name={hidden?'eye':'eyeOff'} size={16} color={hidden?'#F0D98A':'#857A50'} />
          </button>
        </div>
      </header>

      <main className="pb-12">
        {/* Hero card */}
        <div className="px-4 pt-4 pb-3">
          <div className="card-olive rounded-3xl p-6 shadow-olive relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04]"
              style={{ background:'radial-gradient(circle at top right, #C9A84C, transparent)', pointerEvents:'none' }} />

            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:'rgba(201,168,76,0.2)' }}>
                    <Icon name="safe" size={13} color="#C9A84C" />
                  </div>
                  <p className="text-xs font-semibold tracking-wide uppercase" style={{ color:'#857A50' }}>Total em cofres</p>
                </div>
                <p className="font-display font-bold text-3xl text-white tracking-tight mt-1">
                  {hidden ? '••••••' : formatCurrency(totalGeralMes)}
                </p>
                <p className="text-xs mt-1.5" style={{ color:'#6B6140' }}>
                  {transactions.filter(t=>t.type==='income'&&t.date>=startOfMonth).length} entradas em {now.toLocaleDateString('pt-BR',{month:'long'})}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1" style={{ color:'#6B6140' }}>Investido</p>
                <p className="font-display font-bold text-lg tabular" style={{ color:'#F0D98A' }}>
                  {hidden ? '•••••' : formatCurrency(totalInvestMes)}
                </p>
              </div>
            </div>

            {/* Mini bars */}
            <div className="space-y-2">
              {cofresData.map(c => (
                <div key={c.key} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-xs truncate" style={{ color:'#6B6140' }}>{c.key.split(' ')[0]}</p>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width:`${c.pct}%`, background:c.accent }} />
                  </div>
                  <p className="text-xs tabular w-8 text-right" style={{ color:'#857A50' }}>{c.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cofres list */}
        <div className="px-4 space-y-3">
          {cofresData.map(({ key, icon, accent, bg, border, textAccent, incomes, investments, totalIncome, totalInvest, pct, period }) => {
            const isOpen = expanded===key

            return (
              <div key={key} className="rounded-2xl overflow-hidden shadow-card" style={{ background:'#fff', border:'1px solid #F0EFE9' }}>
                {/* Header */}
                <div onClick={()=>setExpanded(isOpen?null:key)} className="p-4 cursor-pointer pressable">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:bg, border:`1px solid ${border}` }}>
                        <Icon name={icon} size={18} color={accent} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color:'#1A1A14' }}>{key}</p>
                        <p className="text-xs mt-0.5" style={{ color:'#A8A79E' }}>
                          {incomes.length} entrada{incomes.length!==1?'s':''} · {PERIOD_LABELS[period]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg tabular" style={{ color:'#1A1A14' }}>
                        {fmt(totalIncome)}
                      </p>
                      {totalInvest>0 && (
                        <p className="text-xs font-semibold tabular mt-0.5" style={{ color:'#2563EB' }}>
                          {fmt(totalInvest)} invest.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background:'#F0EFE9' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width:`${pct}%`, background:accent }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs tabular font-medium" style={{ color:'#A8A79E' }}>{pct}%</p>
                      <Icon name={isOpen?'chevronUp':'chevronDown'} size={13} color="#C8C5B8" />
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop:`1px solid #F0EFE9` }}>
                    {/* Period filters */}
                    <div className="px-4 pt-3 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
                      {(Object.entries(PERIOD_LABELS) as [Period,string][]).map(([p,label])=>(
                        <button key={p} onClick={e=>{e.stopPropagation();setPeriod(key,p)}}
                          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all pressable"
                          style={period===p
                            ? { background:accent, color:'#fff' }
                            : { background:'#F0EFE9', color:'#857A50' }}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                      {/* Incomes */}
                      {incomes.length>0 && (
                        <>
                          <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color:'#A8A79E' }}>Entradas</p>
                          {incomes.map(tx=>(
                            <div key={tx.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                              style={{ background:bg, border:`1px solid ${border}` }}>
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background:'rgba(255,255,255,0.6)' }}>
                                  <Icon name={CATEGORY_ICON[tx.category]||'coins'} size={13} color={accent} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color:'#1A1A14' }}>{tx.description}</p>
                                  <p className="text-xs" style={{ color:'#A8A79E' }}>
                                    {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-bold tabular flex-shrink-0" style={{ color:textAccent }}>
                                +{fmt(tx.amount)}
                              </p>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-1 px-1">
                            <p className="text-xs font-semibold" style={{ color:'#A8A79E' }}>Subtotal</p>
                            <p className="text-sm font-bold tabular" style={{ color:textAccent }}>{fmt(totalIncome)}</p>
                          </div>
                        </>
                      )}

                      {/* Investments */}
                      {investments.length>0 && (
                        <>
                          <div className="flex items-center gap-2 mt-3 mb-2">
                            <Icon name="invest" size={12} color="#2563EB" />
                            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color:'#2563EB' }}>Investimentos deste cofre</p>
                          </div>
                          {investments.map(tx=>(
                            <div key={tx.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                              style={{ background:'#EFF6FF', border:'1px solid #BFDBFE' }}>
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background:'rgba(255,255,255,0.6)' }}>
                                  <Icon name="invest" size={13} color="#2563EB" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color:'#1D4ED8' }}>{tx.description}</p>
                                  <p className="text-xs" style={{ color:'#93C5FD' }}>
                                    {new Date(tx.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-bold tabular flex-shrink-0" style={{ color:'#2563EB' }}>{fmt(tx.amount)}</p>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-1 px-1">
                            <p className="text-xs font-semibold" style={{ color:'#93C5FD' }}>Total investido</p>
                            <p className="text-sm font-bold tabular" style={{ color:'#2563EB' }}>{fmt(totalInvest)}</p>
                          </div>
                        </>
                      )}

                      {incomes.length===0 && investments.length===0 && (
                        <div className="py-8 flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'#F0EFE9' }}>
                            <Icon name="inbox" size={18} color="#C8C5B8" />
                          </div>
                          <p className="text-xs font-medium" style={{ color:'#A8A79E' }}>
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
    </div>
  )
}
