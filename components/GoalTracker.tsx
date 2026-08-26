import useFinanceStore from '@/lib/store'
import { formatCurrency, getProgressPercent, FINAL_GOAL } from '@/lib/utils'
import Icon from './Icon'

export default function GoalTracker({ hidden = false }: { hidden?: boolean }) {
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)
  const goals    = useFinanceStore(s => s.goals)
  const patrimony= getTotalPatrimony()
  const progress = getProgressPercent(patrimony, FINAL_GOAL)
  const fmt      = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const now    = new Date()
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const currentGoal  = goals.find(g => g.month.startsWith(months[now.getMonth()]))
  const monthProgress= currentGoal ? getProgressPercent(patrimony, currentGoal.target) : 0

  return (
    <div className="px-4 mb-3">
      <div className="rounded-2xl p-4 shadow-card" style={{ background:'#fff', border:'1px solid #F0EFE9' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-4 h-4 rounded-sm" style={{ background:'linear-gradient(135deg, #544C31, #3D3822)' }} />
              <p className="text-xs font-semibold tracking-wide uppercase" style={{ color:'#6B6140' }}>Meta patrimonial</p>
            </div>
            <p className="text-xs mt-1" style={{ color:'#A8A79E' }}>{fmt(FINAL_GOAL)} até Mai/2027</p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-2xl tabular" style={{ color:'#292615' }}>{progress}%</p>
            <p className="text-xs" style={{ color:'#A8A79E' }}>{fmt(patrimony)}</p>
          </div>
        </div>

        <div className="progress-bar mb-3">
          <div className="progress-fill" style={{ width:`${progress}%` }} />
        </div>

        {currentGoal && (
          <div className="rounded-xl p-3" style={{ background:'#F8F8F6' }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium" style={{ color:'#6B6A60' }}>
                Meta {currentGoal.month}
                <span className="font-semibold ml-1" style={{ color:'#292615' }}>{fmt(currentGoal.target)}</span>
              </p>
              <p className="text-xs font-bold tabular" style={{ color:monthProgress>=100?'#2D7A4F':'#544C31' }}>{monthProgress}%</p>
            </div>
            <div className="progress-bar" style={{ height:'4px' }}>
              <div className="progress-fill" style={{ width:`${monthProgress}%`, background:monthProgress>=100?'#2D7A4F':undefined }} />
            </div>
            {monthProgress>=100 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Icon name="check" size={12} color="#2D7A4F" />
                <p className="text-xs font-semibold" style={{ color:'#2D7A4F' }}>Meta do mês atingida</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
