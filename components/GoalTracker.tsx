import useFinanceStore from '@/lib/store'
import { formatCurrency, getProgressPercent, FINAL_GOAL } from '@/lib/utils'

export default function GoalTracker() {
  const balance = useFinanceStore(s => s.balance)
  const goals = useFinanceStore(s => s.goals)

  const progress = getProgressPercent(balance, FINAL_GOAL)

  // Meta do mês atual
  const now = new Date()
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const currentMonthStr = `${months[now.getMonth()]}/${now.getFullYear()}`
  const currentGoal = goals.find(g => g.month.startsWith(months[now.getMonth()]))
  const monthProgress = currentGoal ? getProgressPercent(balance, currentGoal.target) : 0

  return (
    <div className="px-4 mb-4">
      <div className="bg-olive-50 border border-olive-200 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-xs font-bold text-olive-800 uppercase">Meta: R$ 30.000 até Mai/2027</p>
            <p className="text-xs text-neutral-500 mt-0.5">Atual: {formatCurrency(balance)}</p>
          </div>
          <span className="text-2xl font-bold text-olive-900">{progress}%</span>
        </div>

        {/* Barra de progresso geral */}
        <div className="w-full bg-olive-200 rounded-full h-3 mb-3">
          <div
            className="bg-olive-700 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Meta do mês atual */}
        {currentGoal && (
          <div className="border-t border-olive-200 pt-3 mt-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-neutral-600">Meta {currentGoal.month}: {formatCurrency(currentGoal.target)}</p>
              <p className="text-xs font-bold text-olive-800">{monthProgress}%</p>
            </div>
            <div className="w-full bg-olive-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${monthProgress >= 100 ? 'bg-green-500' : 'bg-olive-500'}`}
                style={{ width: `${monthProgress}%` }}
              />
            </div>
            {monthProgress >= 100 && (
              <p className="text-xs text-green-600 font-bold mt-1">🎉 Meta do mês batida!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
