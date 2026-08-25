import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function InsightsBar() {
  const getToday = useFinanceStore(s => s.getToday)
  const getLast7Days = useFinanceStore(s => s.getLast7Days)
  const getInsights = useFinanceStore(s => s.getInsights)

  const today = getToday()
  const last7 = getLast7Days()
  const ins = getInsights()

  const cards = [
    { label: 'Gasto hoje', value: formatCurrency(today.expense), color: 'text-red-600', bg: 'bg-red-50', icon: '📅' },
    { label: 'Últimos 7d', value: formatCurrency(last7.expense), color: 'text-orange-600', bg: 'bg-orange-50', icon: '📆' },
    { label: 'Entrou hoje', value: formatCurrency(today.income), color: 'text-green-600', bg: 'bg-green-50', icon: '💚' },
    { label: 'Média/dia', value: formatCurrency(ins.dailyAverage), color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
    { label: 'Projeção mês', value: formatCurrency(ins.projectedMonthly), color: 'text-purple-600', bg: 'bg-purple-50', icon: '📈' },
    { label: 'Top gasto', value: ins.mostSpentCategory, color: 'text-olive-700', bg: 'bg-olive-50', icon: '🏷️', small: true },
  ]

  return (
    <div className="px-4 mb-3">
      <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Insights rápidos</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-3`}>
            <p className="text-base mb-1">{c.icon}</p>
            <p className={`${c.small ? 'text-xs' : 'text-sm'} font-bold ${c.color} leading-tight truncate`}>{c.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
