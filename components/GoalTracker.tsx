import useFinanceStore from '@/lib/store'
import { formatCurrency, getProgressPercent, FINAL_GOAL } from '@/lib/utils'

export default function GoalTracker() {
  const getBalance = useFinanceStore(s => s.getBalance)
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)
  const goals = useFinanceStore(s => s.goals)

  const patrimony = getTotalPatrimony()
  const progress = getProgressPercent(patrimony, FINAL_GOAL)

  const now = new Date()
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const currentGoal = goals.find(g => g.month.startsWith(months[now.getMonth()]))
  const monthProgress = currentGoal ? getProgressPercent(patrimony, currentGoal.target) : 0

  return (
    <div className="px-4 mb-3">
      <div className="bg-olive-50 border border-olive-200 rounded-xl p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-bold text-olive-800 uppercase">Meta: R$ 30k até Mai/2027</p>
            <p className="text-xs text-neutral-500 mt-0.5">Patrimônio: {formatCurrency(patrimony)}</p>
          </div>
          <span className="text-2xl font-bold text-olive-900">{progress}%</span>
        </div>
        <div className="w-full bg-olive-200 rounded-full h-2.5 mb-3">
          <div className="bg-olive-700 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        {currentGoal && (
          <div className="border-t border-olive-200 pt-3">
            <div className="flex justify-between mb-1">
              <p className="text-xs text-neutral-600">Meta {currentGoal.month}: {formatCurrency(currentGoal.target)}</p>
              <p className="text-xs font-bold text-olive-800">{monthProgress}%</p>
            </div>
            <div className="w-full bg-olive-200 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${monthProgress >= 100 ? 'bg-green-500' : 'bg-olive-500'}`}
                style={{ width: `${monthProgress}%` }} />
            </div>
            {monthProgress >= 100 && <p className="text-xs text-green-600 font-bold mt-1">🎉 Meta do mês batida!</p>}
          </div>
        )}
      </div>
    </div>
  )
}
