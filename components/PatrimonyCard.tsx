import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

const ACCOUNT_EMOJI: Record<string, string> = {
  'C6 Investimentos': '🏦',
  'XP Investimentos': '📊',
  'Mercado Pago': '🟡',
  'Dinheiro em conta': '💵',
  'Santander': '🔴',
}

export default function PatrimonyCard({ hidden = false }: { hidden?: boolean }) {
  const patrimony = useFinanceStore(s => s.patrimony)
  const updatePatrimony = useFinanceStore(s => s.updatePatrimony)
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)
  const [editing, setEditing] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [expanded, setExpanded] = useState(false)
  const total = getTotalPatrimony()
  const GOAL = 30000
  const progress = Math.min(100, Math.round((total / GOAL) * 100))
  const fmt = (v: number) => hidden ? '••••' : formatCurrency(v)

  const save = (account: string) => {
    const val = parseFloat(value.replace(',', '.'))
    if (!isNaN(val) && val >= 0) updatePatrimony(account, val)
    setEditing(null)
    setValue('')
  }

  return (
    <div className="px-4 mb-3">
      <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
        <div onClick={() => setExpanded(!expanded)} className="p-4 flex items-center justify-between cursor-pointer active:bg-neutral-50">
          <div>
            <p className="text-xs font-bold text-neutral-500 uppercase">Patrimônio</p>
            <p className="text-xl font-bold text-olive-900">{fmt(total)}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 bg-neutral-100 rounded-full h-1.5">
                <div className="bg-olive-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-neutral-400">{progress}% da meta</p>
            </div>
          </div>
          <span className="text-neutral-400">{expanded ? '▲' : '▼'}</span>
        </div>
        {expanded && (
          <div className="border-t border-neutral-100">
            {patrimony.map(p => (
              <div key={p.account} className="border-b border-neutral-50 last:border-0">
                {editing === p.account ? (
                  <div className="px-4 py-3 flex gap-2 items-center">
                    <span className="text-lg">{ACCOUNT_EMOJI[p.account] || '🏦'}</span>
                    <p className="text-sm flex-1">{p.account}</p>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                      <input type="number" value={value} onChange={e => setValue(e.target.value)}
                        className="pl-7 pr-2 py-1.5 bg-neutral-100 rounded-lg text-sm w-28 font-bold" autoFocus inputMode="decimal" />
                    </div>
                    <button onClick={() => save(p.account)} className="text-olive-700 font-bold text-sm px-2">OK</button>
                    <button onClick={() => setEditing(null)} className="text-neutral-400 text-sm">✕</button>
                  </div>
                ) : (
                  <div onClick={() => { setEditing(p.account); setValue(p.balance.toString()) }}
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-neutral-50">
                    <span className="text-lg">{ACCOUNT_EMOJI[p.account] || '🏦'}</span>
                    <p className="text-sm flex-1 text-neutral-700">{p.account}</p>
                    <p className="text-sm font-bold text-neutral-900">{fmt(p.balance)}</p>
                    <span className="text-neutral-300 text-xs">✏️</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
