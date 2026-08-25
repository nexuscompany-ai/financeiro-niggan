import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)
  const month = getThisMonth()
  const patrimony = getTotalPatrimony()
  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)

  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const resultado = month.income - month.expense - month.investment

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-60 capitalize mb-1">{monthName}</p>
        <p className="text-xs opacity-50 mb-3">Resultado do mês atual</p>

        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-60 mb-1">Sobrou este mês</p>
            <h1 className={`text-3xl font-bold ${resultado < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmt(resultado)}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60 mb-1">Patrimônio total</p>
            <p className="text-lg font-bold text-yellow-300">{fmt(patrimony)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs opacity-50 mb-0.5">↓ Entrou</p>
            <p className="text-sm font-bold text-green-300">{fmt(month.income)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">↑ Saiu</p>
            <p className="text-sm font-bold text-red-300">{fmt(month.expense)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">📈 Invest.</p>
            <p className="text-sm font-bold text-blue-300">{fmt(month.investment)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
