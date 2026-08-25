import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const patrimony = useFinanceStore(s => s.patrimony)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)

  const month = getThisMonth()
  const conta = patrimony.find(p => p.account === 'Conta corrente')?.balance || 0
  const investimentos = patrimony.find(p => p.account === 'C6 Investimentos')?.balance || 0
  const totalCC = getCreditCardTotal('C6') + getCreditCardTotal('Nubank')
  const resultado = month.income - month.expense - month.investment

  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)
  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="bg-gradient-to-br from-olive-800 to-olive-950 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-60 capitalize mb-3">{monthName}</p>

        {/* Resultado do mês */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-50 mb-1">Resultado do mês</p>
            <h1 className={`text-3xl font-bold ${resultado < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmt(resultado)}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-50 mb-1">Investido</p>
            <p className="text-lg font-bold text-yellow-300">{fmt(investimentos)}</p>
          </div>
        </div>

        {/* Grade mês */}
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-3 mb-3">
          <div>
            <p className="text-xs opacity-50 mb-0.5">↓ Entrou</p>
            <p className="text-sm font-bold text-green-300">{fmt(month.income)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">↑ Saiu</p>
            <p className="text-sm font-bold text-red-300">{fmt(month.expense)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">📈 Aporte</p>
            <p className="text-sm font-bold text-blue-300">{fmt(month.investment)}</p>
          </div>
        </div>

        {/* Conta + Cartão */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs opacity-50 mb-0.5">💵 Conta corrente</p>
            <p className="text-sm font-bold text-white">{fmt(conta)}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-0.5">💳 Cartões</p>
            <p className={`text-sm font-bold ${totalCC > 0 ? 'text-red-300' : 'text-green-300'}`}>
              {totalCC > 0 ? '-' : ''}{fmt(totalCC)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
