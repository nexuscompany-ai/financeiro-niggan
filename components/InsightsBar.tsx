import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function InsightsBar({ hidden = false }: { hidden?: boolean }) {
  const getToday = useFinanceStore(s => s.getToday)
  const getLast7Days = useFinanceStore(s => s.getLast7Days)
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const getInsights = useFinanceStore(s => s.getInsights)

  const today = getToday()
  const last7 = getLast7Days()
  const month = getThisMonth()
  const ins = getInsights()
  const fmt = (v: number) => hidden ? '•••' : formatCurrency(v)

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
  const dayOfMonth = now.getDate()
  const expectedExpense = month.income > 0 ? (month.income / daysInMonth) * dayOfMonth : 0
  const onTrack = month.expense <= expectedExpense || expectedExpense === 0

  const cards = [
    { label: 'Hoje', sublabel: 'gasto', value: fmt(today.expense), positive: false },
    { label: '7 dias', sublabel: 'gasto', value: fmt(last7.expense), positive: false },
    { label: 'Hoje', sublabel: 'entrou', value: fmt(today.income), positive: true },
    { label: 'Média', sublabel: 'por dia', value: fmt(ins.dailyAverage), positive: null },
    { label: 'Projeção', sublabel: 'mensal', value: fmt(ins.projectedMonthly), positive: null },
    { label: 'Mais gasto', sublabel: 'categoria', value: hidden ? '•••' : (ins.mostSpentCategory.length > 10 ? ins.mostSpentCategory.slice(0,10)+'…' : ins.mostSpentCategory), positive: null },
  ]

  return (
    <div className="px-4 mb-3">
      {/* Status bar */}
      <div className="rounded-2xl px-4 py-3 mb-3 flex items-center justify-between"
        style={{ background: onTrack ? '#EBF7F0' : '#FCECEA', border: `1px solid ${onTrack ? '#86EFAC' : '#FCA5A5'}` }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: onTrack ? '#2D7A4F' : '#C0392B' }} />
          <p className="text-xs font-semibold" style={{ color: onTrack ? '#2D7A4F' : '#C0392B' }}>
            {onTrack ? 'No ritmo certo este mês' : 'Gastos acima do esperado'}
          </p>
        </div>
        <p className="text-xs tabular" style={{ color: onTrack ? '#2D7A4F' : '#C0392B', opacity: 0.7 }}>
          dia {dayOfMonth}/{daysInMonth}
        </p>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(135deg, #544C31, #3D3822)' }} />
        <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6B6140' }}>Insights do mês</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl p-3 shadow-card" style={{ background: '#fff', border: '1px solid #F0EFE9' }}>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium" style={{ color: '#A8A79E' }}>{c.label}</span>
              <span className="text-xs" style={{ color: '#D8D4B8' }}>·</span>
              <span className="text-xs" style={{ color: '#C8C5B8' }}>{c.sublabel}</span>
            </div>
            <p className="text-sm font-bold tabular leading-none"
              style={{ color: c.positive === true ? '#2D7A4F' : c.positive === false ? '#C0392B' : '#292615' }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
