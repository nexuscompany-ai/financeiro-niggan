import { useState } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency, FINAL_GOAL } from '@/lib/utils'

export default function Settings() {
  const [showClear, setShowClear] = useState(false)
  const [editGoal, setEditGoal] = useState<string | null>(null)
  const [goalValue, setGoalValue] = useState('')
  const transactions = useFinanceStore(s => s.transactions)
  const balance = useFinanceStore(s => s.balance)
  const goals = useFinanceStore(s => s.goals)
  const updateGoal = useFinanceStore(s => s.updateGoal)

  const handleExport = () => {
    const data = { transactions, balance, goals, exportDate: new Date().toISOString() }
    const el = document.createElement('a')
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
    el.setAttribute('download', `niggan-backup-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  const handleClear = () => {
    localStorage.removeItem('niggan-v2')
    localStorage.removeItem('lastTiktok')
    window.location.href = '/'
  }

  const handleSaveGoal = (month: string) => {
    const val = parseFloat(goalValue.replace(',', '.'))
    if (val > 0) updateGoal(month, val)
    setEditGoal(null)
    setGoalValue('')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold text-olive-900">Configurações</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-10">
        {/* Resumo */}
        <div className="bg-white rounded-xl p-4 border border-neutral-100">
          <p className="text-xs font-bold text-neutral-500 uppercase mb-3">Resumo</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Saldo atual</span>
              <span className="font-bold text-olive-900">{formatCurrency(balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Transações</span>
              <span className="font-bold">{transactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Meta final</span>
              <span className="font-bold">{formatCurrency(FINAL_GOAL)} até Mai/2027</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Progresso</span>
              <span className="font-bold text-olive-700">{Math.round((balance / FINAL_GOAL) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Evolução de Patrimônio */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500 uppercase">Evolução Patrimonial</p>
            <p className="text-xs text-neutral-400 mt-0.5">Toque para registrar o patrimônio do mês</p>
          </div>
          {goals.map(goal => (
            <div key={goal.month} className="border-b border-neutral-50 last:border-0">
              {editGoal === goal.month ? (
                <div className="px-4 py-3 flex gap-2 items-center">
                  <p className="text-sm font-medium w-20 flex-shrink-0">{goal.month}</p>
                  <input
                    type="number"
                    value={goalValue}
                    onChange={e => setGoalValue(e.target.value)}
                    placeholder="Patrimônio"
                    className="flex-1 px-3 py-2 bg-neutral-100 rounded-lg text-sm"
                    autoFocus
                    inputMode="decimal"
                  />
                  <button onClick={() => handleSaveGoal(goal.month)} className="text-olive-700 font-bold text-sm">OK</button>
                  <button onClick={() => setEditGoal(null)} className="text-neutral-400 text-sm">✕</button>
                </div>
              ) : (
                <div
                  onClick={() => { setEditGoal(goal.month); setGoalValue(goal.actual?.toString() || '') }}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-neutral-50"
                >
                  <div>
                    <p className="text-sm font-medium">{goal.month}</p>
                    <p className="text-xs text-neutral-400">Meta: {formatCurrency(goal.target)}</p>
                  </div>
                  <div className="text-right">
                    {goal.actual !== null ? (
                      <>
                        <p className="text-sm font-bold text-olive-700">{formatCurrency(goal.actual)}</p>
                        <p className={`text-xs font-medium ${goal.actual >= goal.target ? 'text-green-600' : 'text-red-500'}`}>
                          {goal.actual >= goal.target ? '✅ Bateu' : `−${formatCurrency(goal.target - goal.actual)}`}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-neutral-300">Toque para registrar</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <button onClick={handleExport}
            className="w-full bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between active:bg-neutral-50">
            <div className="text-left">
              <p className="text-sm font-medium">📊 Exportar Dados</p>
              <p className="text-xs text-neutral-400">Baixar backup JSON</p>
            </div>
            <span className="text-neutral-400">→</span>
          </button>

          <button onClick={() => setShowClear(!showClear)}
            className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between active:bg-red-100">
            <div className="text-left">
              <p className="text-sm font-medium text-red-700">🗑️ Limpar Tudo</p>
              <p className="text-xs text-red-400">Deletar todas as transações</p>
            </div>
            <span className="text-red-400">→</span>
          </button>

          {showClear && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-900 mb-3 font-medium">Tem certeza? Isso não pode ser desfeito!</p>
              <div className="flex gap-2">
                <button onClick={() => setShowClear(false)}
                  className="flex-1 bg-white border border-red-200 text-red-700 py-2.5 rounded-lg font-medium text-sm">
                  Cancelar
                </button>
                <button onClick={handleClear}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm">
                  Deletar Tudo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center py-4">
          <p className="text-xs text-neutral-400">Niggan Finances v2.0</p>
          <p className="text-xs text-neutral-300">Desenvolvido para Felipe 🚀</p>
        </div>
      </main>
    </div>
  )
}
