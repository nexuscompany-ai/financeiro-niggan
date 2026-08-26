import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const patrimony = useFinanceStore(s => s.patrimony)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)
  const syncing = useFinanceStore(s => s.syncing)

  const month = getThisMonth()
  const conta = patrimony.find(p => p.account === 'Conta corrente')?.balance || 0
  const investimentos = patrimony.find(p => p.account === 'C6 Investimentos')?.balance || 0
  const totalCC = getCreditCardTotal('C6') + getCreditCardTotal('Nubank')
  const fmt = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="card-olive rounded-3xl p-6 shadow-olive relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #A09868, transparent)', transform: 'translate(-30%, 30%)' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative">
          <div>
            <p className="font-display font-700 text-2xl text-white tracking-tight">niggan</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: '#A09868' }}>{monthName}</p>
          </div>
          {syncing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs" style={{ color: '#A09868' }}>sync</span>
            </div>
          )}
          {!syncing && (
            <div className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
          )}
        </div>

        {/* Month stats */}
        <div className="grid grid-cols-3 gap-2 mb-5 relative">
          {[
            { label: 'Entrou', value: month.income, color: '#4ADE80' },
            { label: 'Saiu', value: month.expense, color: '#F87171' },
            { label: 'Aportado', value: month.investment, color: '#60A5FA' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1 font-medium" style={{ color: '#A09868' }}>{label}</p>
              <p className="text-sm font-bold tabular" style={{ color }}>{fmt(value)}</p>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-2 relative">
          {[
            { label: 'Conta', value: conta, color: '#fff' },
            { label: 'Investido', value: investimentos, color: '#F0D98A' },
            { label: 'Cartões', value: totalCC, color: totalCC > 0 ? '#F87171' : '#4ADE80', prefix: totalCC > 0 ? '-' : '' },
          ].map(({ label, value, color, prefix }) => (
            <div key={label}>
              <p className="text-xs mb-0.5 font-medium" style={{ color: '#6B6140' }}>{label}</p>
              <p className="text-sm font-bold tabular" style={{ color }}>
                {hidden ? '•••' : `${prefix || ''}${formatCurrency(value)}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
