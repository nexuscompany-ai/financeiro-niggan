import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const getBalance   = useFinanceStore(s => s.getBalance)
  const patrimony    = useFinanceStore(s => s.patrimony)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)
  const syncing      = useFinanceStore(s => s.syncing)

  const month        = getThisMonth()
  const contaBase     = patrimony.find(p => p.account === 'Conta corrente')?.balance || 0
  const conta         = contaBase + getBalance()
  const investimentos= patrimony.find(p => p.account === 'C6 Investimentos')?.balance || 0
  const totalCC      = getCreditCardTotal('C6') + getCreditCardTotal('Nubank')
  const fmt          = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="card-olive rounded-3xl p-6 shadow-olive relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle at top right, #C9A84C, transparent)', pointerEvents:'none' }} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle at bottom left, #A09868, transparent)', pointerEvents:'none' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative">
          <div>
            <p className="font-display font-bold text-2xl text-white tracking-tight">niggan</p>
            <p className="text-xs capitalize mt-0.5" style={{ color:'#857A50' }}>{monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            {syncing ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background:'rgba(255,255,255,0.07)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#C9A84C' }} />
                <span className="text-xs" style={{ color:'#857A50' }}>sync</span>
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full" style={{ background:'#4ADE80' }} />
            )}
          </div>
        </div>

        {/* Month stats */}
        <div className="grid grid-cols-3 gap-2 mb-5 relative">
          {[
            { label:'Entrou', value:month.income, color:'#4ADE80', icon:'arrowDown' },
            { label:'Saiu',   value:month.expense, color:'#F87171', icon:'arrowUp' },
            { label:'Aporte', value:month.investment, color:'#60A5FA', icon:'invest' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background:'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1 mb-1.5">
                <Icon name={icon} size={11} color={color} />
                <p className="text-xs font-medium" style={{ color:'#857A50' }}>{label}</p>
              </div>
              <p className="text-sm font-bold tabular" style={{ color }}>{fmt(value)}</p>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-3 gap-2 pt-4 relative" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label:'Conta',    value:conta,        color:'#fff',    icon:'wallet' },
            { label:'Investido',value:investimentos,color:'#F0D98A', icon:'trending' },
            { label:'Cartões',  value:totalCC,      color:totalCC>0?'#F87171':'#4ADE80', icon:'creditCard', prefix:totalCC>0?'-':'' },
          ].map(({ label, value, color, icon, prefix }) => (
            <div key={label}>
              <div className="flex items-center gap-1 mb-0.5">
                <Icon name={icon} size={10} color="#6B6140" />
                <p className="text-xs" style={{ color:'#6B6140' }}>{label}</p>
              </div>
              <p className="text-sm font-bold tabular" style={{ color }}>
                {hidden ? '•••' : `${prefix||''}${formatCurrency(value)}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
