import useFinanceStore from '@/lib/store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function BalanceCard() {
  const balance = useFinanceStore((state) => state.balance)
  const transactions = useFinanceStore((state) => state.transactions)

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter((t) => t.date === today)
  
  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const todayExpense = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Main Balance */}
      <div className="bg-gradient-to-br from-olive-800 to-olive-900 rounded-2xl p-6 text-white mb-4 shadow-lg">
        <p className="text-sm opacity-80 mb-2">Saldo Total</p>
        <h1 className="text-4xl font-bold mb-2">{formatCurrency(balance)}</h1>
        <p className="text-xs opacity-70">
          {format(new Date(), 'EEEE, d \'de\' MMMM', { locale: ptBR })}
        </p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-600 mb-1">Entrada hoje</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(todayIncome)}</p>
          <p className="text-xs text-green-600 mt-1">{todayTransactions.filter(t => t.type === 'income').length} transação</p>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-xs text-red-600 mb-1">Saída hoje</p>
          <p className="text-lg font-bold text-red-700">-{formatCurrency(todayExpense)}</p>
          <p className="text-xs text-red-600 mt-1">{todayTransactions.filter(t => t.type === 'expense').length} transação</p>
        </div>
      </div>

      {/* Month Stats */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-neutral-600 mb-1">Mês</p>
            <p className="text-sm font-bold text-neutral-900">
              {format(new Date(), 'MMMM', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">Entradas:</span>
            <span className="font-bold text-green-600">{formatCurrency(monthIncome)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">Saídas:</span>
            <span className="font-bold text-red-600">-{formatCurrency(monthExpense)}</span>
          </div>
          <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between items-center text-sm">
            <span className="text-neutral-700 font-medium">Resultado:</span>
            <span className={`font-bold ${monthIncome - monthExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthIncome - monthExpense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
