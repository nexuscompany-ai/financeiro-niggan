import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

export default function InsightsBar({ hidden = false }: { hidden?: boolean }) {
  const getToday    = useFinanceStore(s => s.getToday)
  const getLast7Days= useFinanceStore(s => s.getLast7Days)
  const getThisMonth= useFinanceStore(s => s.getThisMonth)
  const getInsights = useFinanceStore(s => s.getInsights)

  const today  = getToday()
  const last7  = getLast7Days()
  const month  = getThisMonth()
  const ins    = getInsights()
  const fmt    = (v: number) => hidden ? '•••' : formatCurrency(v)

  const now          = new Date()
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
  const dayOfMonth   = now.getDate()
  const expectedExpense = month.income > 0 ? (month.income / daysInMonth) * dayOfMonth : 0
  const onTrack      = month.expense <= expectedExpense || expectedExpense === 0

  const cards = [
    { label:'Hoje',     sub:'gasto',     value:fmt(today.expense),          pos:false,   icon:'arrowUp'   },
    { label:'7 dias',   sub:'gasto',     value:fmt(last7.expense),          pos:false,   icon:'activity'  },
    { label:'Hoje',     sub:'entrou',    value:fmt(today.income),           pos:true,    icon:'arrowDown' },
    { label:'Média',    sub:'por dia',   value:fmt(ins.dailyAverage),       pos:null,    icon:'chart'     },
    { label:'Projeção', sub:'do mês',    value:fmt(ins.projectedMonthly),   pos:null,    icon:'trending'  },
    { label:'Top gasto',sub:'categoria', value:hidden ? '•••' : (ins.mostSpentCategory.length>10 ? ins.mostSpentCategory.slice(0,10)+'…' : ins.mostSpentCategory), pos:null, icon:'star' },
  ]

  return (
    <div className="px-4 mb-3">
      {/* Status */}
      <div className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between"
        style={{ background:onTrack?'#EBF7F0':'#FCECEA', border:`1px solid ${onTrack?'#86EFAC':'#FCA5A5'}` }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background:onTrack?'#2D7A4F':'#C0392B' }} />
          <p className="text-xs font-semibold" style={{ color:onTrack?'#2D7A4F':'#C0392B' }}>
            {onTrack ? 'No ritmo certo este mês' : 'Gastos acima do esperado'}
          </p>
        </div>
        <p className="text-xs tabular" style={{ color:onTrack?'#2D7A4F':'#C0392B', opacity:0.6 }}>
          {dayOfMonth}/{daysInMonth}
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-4 h-4 rounded-sm" style={{ background:'linear-gradient(135deg, #544C31, #3D3822)' }} />
        <p className="text-xs font-semibold tracking-wide uppercase" style={{ color:'#6B6140' }}>Insights do mês</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map((c,i) => (
          <div key={i} className="rounded-2xl p-3 shadow-card" style={{ background:'#fff', border:'1px solid #F0EFE9' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name={c.icon} size={12} color="#C8C5B8" />
              <span className="text-xs" style={{ color:'#A8A79E' }}>{c.label}</span>
            </div>
            <p className="text-sm font-bold tabular leading-none"
              style={{ color:c.pos===true?'#2D7A4F':c.pos===false?'#C0392B':'#292615' }}>
              {c.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color:'#C8C5B8' }}>{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
