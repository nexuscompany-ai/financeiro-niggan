import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

const hide = (v: string) => '••••••'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getBalance = useFinanceStore(s => s.getBalance)
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const balance = getBalance()
  const patrimony = getTotalPatrimony()
  const month = getThisMonth()
  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-60 capitalize mb-3">{dateStr}</p>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-60 mb-1">Saldo calculado</p>
            <h1 className="text-3xl font-bold">{fmt(balance)}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60 mb-1">Patrimônio</p>
            <p className="text-lg font-bold text-yellow-300">{fmt(patrimony)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs opacity-50 mb-0.5">Entradas</p>
            <p className="text-sm font-bold text-green-300">{fmt(month.income)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">Saídas</p>
            <p className="text-sm font-bold text-red-300">{fmt(month.expense)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">Investido</p>
            <p className="text-sm font-bold text-blue-300">{fmt(month.investment)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
