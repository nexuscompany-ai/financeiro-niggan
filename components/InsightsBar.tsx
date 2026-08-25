import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function InsightsBar() {
  const getToday = useFinanceStore(s => s.getToday)
  const getLast7Days = useFinanceStore(s => s.getLast7Days)
  const getInsights = useFinanceStore(s => s.getInsights)

  const today = getToday()
  const last7 = getLast7Days()
  const insights = getInsights()

  const cards = [
    { label: 'Gasto hoje', value: formatCurrency(today.expense), color: 'text-red-600', bg: 'bg-red-50', icon: '📅' },
    { label: 'Últimos 7 dias', value: formatCurrency(last7.expense), color: 'text-orange-600', bg: 'bg-orange-50', icon: '📆' },
    { label: 'Entrou hoje', value: formatCurrency(today.income), color: 'text-green-600', bg: 'bg-green-50', icon: '💚' },
    { label: 'Média/dia', value: formatCurrency(insights.dailyAverage), color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
    { label: 'Projeção mês', value: formatCurrency(insights.projectedMonthly), color: 'text-purple-600', bg: 'bg-purple-50', icon: '📈' },
    { label: 'Mais gasto', value: insights.mostSpentCategory, color: 'text-olive-700', bg: 'bg-olive-50', icon: '🏷️', small: true },
  ]

  return (
    <div className="px-4 mb-2">
      <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Insights rápidos</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-3`}>
            <p className="text-base mb-1">{card.icon}</p>
            <p className={`${card.small ? 'text-xs' : 'text-sm'} font-bold ${card.color} leading-tight`}>
              {card.value}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
