import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard() {
  const balance = useFinanceStore(s => s.balance)
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const month = getThisMonth()

  const now = new Date()
  const dayName = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-70 capitalize mb-1">{dayName}, {dateStr}</p>
        <p className="text-xs opacity-60 mb-2">Saldo disponível</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{formatCurrency(balance)}</h1>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs opacity-60 mb-0.5">Entradas mês</p>
            <p className="text-base font-bold text-green-300">{formatCurrency(month.income)}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1">
            <p className="text-xs opacity-60 mb-0.5">Saídas mês</p>
            <p className="text-base font-bold text-red-300">{formatCurrency(month.expense)}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1">
            <p className="text-xs opacity-60 mb-0.5">Resultado</p>
            <p className={`text-base font-bold ${month.income - month.expense >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrency(month.income - month.expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
