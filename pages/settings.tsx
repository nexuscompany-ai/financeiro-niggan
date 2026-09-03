import { useState, useEffect } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'
import { formatCurrency, FINAL_GOAL } from '@/lib/utils'
import { pushSupported, getPushSubscription, subscribeToPush, unsubscribeFromPush, sendTestPush } from '@/lib/pushClient'

type PushStatus = 'checking' | 'unsupported' | 'off' | 'on'

export default function Settings() {
  const [showClear, setShowClear] = useState(false)
  const [editGoal, setEditGoal] = useState<string | null>(null)
  const [goalValue, setGoalValue] = useState('')
  const [pushStatus, setPushStatus] = useState<PushStatus>('checking')
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMsg, setPushMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!pushSupported()) { setPushStatus('unsupported'); return }
    getPushSubscription().then(sub => setPushStatus(sub ? 'on' : 'off'))
  }, [])

  const handleEnablePush = async () => {
    setPushBusy(true); setPushMsg(null)
    const r = await subscribeToPush()
    setPushBusy(false)
    if (r.ok) { setPushStatus('on'); setPushMsg('Notificações ativadas!') }
    else setPushMsg(r.reason || 'Não deu pra ativar')
  }

  const handleDisablePush = async () => {
    setPushBusy(true); setPushMsg(null)
    await unsubscribeFromPush()
    setPushBusy(false)
    setPushStatus('off')
  }

  const handleTestPush = async () => {
    setPushBusy(true); setPushMsg(null)
    const r = await sendTestPush()
    setPushBusy(false)
    setPushMsg(r.ok ? 'Teste enviado — deve chegar em alguns segundos' : (r.reason || 'Falha ao enviar teste'))
  }
  const transactions = useFinanceStore(s => s.transactions)
  const goals = useFinanceStore(s => s.goals)
  const updateGoal = useFinanceStore(s => s.updateGoal)
  const getBalance = useFinanceStore(s => s.getBalance)
  const getTotalPatrimony = useFinanceStore(s => s.getTotalPatrimony)

  const balance = getBalance()
  const patrimony = getTotalPatrimony()

  const handleExport = () => {
    const raw = localStorage.getItem('niggan-v3')
    const el = document.createElement('a')
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(raw || '{}'))
    el.setAttribute('download', `niggan-backup-${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  const handleClear = () => {
    localStorage.removeItem('niggan-v3')
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
          <Link href="/" className="text-xl text-neutral-600">←</Link>
          <h1 className="text-xl font-bold text-olive-900">Configurações</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-10">
        {/* Resumo */}
        <div className="bg-white rounded-xl p-4 border border-neutral-100">
          <p className="text-xs font-bold text-neutral-500 uppercase mb-3">Resumo Financeiro</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Saldo calculado</span>
              <span className="font-bold text-olive-900">{formatCurrency(balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Patrimônio total</span>
              <span className="font-bold text-yellow-600">{formatCurrency(patrimony)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total transações</span>
              <span className="font-bold">{transactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Meta</span>
              <span className="font-bold">{formatCurrency(FINAL_GOAL)} até Mai/2027</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Progresso meta</span>
              <span className="font-bold text-olive-700">{Math.round((patrimony / FINAL_GOAL) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Evolução Patrimonial */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500 uppercase">Evolução Patrimonial</p>
            <p className="text-xs text-neutral-400 mt-0.5">Toque para registrar o patrimônio real do mês</p>
          </div>
          {goals.map(goal => (
            <div key={goal.month} className="border-b border-neutral-50 last:border-0">
              {editGoal === goal.month ? (
                <div className="px-4 py-3 flex gap-2 items-center">
                  <p className="text-sm font-medium w-20">{goal.month}</p>
                  <input type="number" value={goalValue} onChange={e => setGoalValue(e.target.value)}
                    placeholder="Patrimônio" inputMode="decimal" autoFocus
                    className="flex-1 px-3 py-2 bg-neutral-100 rounded-lg text-sm" />
                  <button onClick={() => handleSaveGoal(goal.month)} className="text-olive-700 font-bold text-sm px-1">OK</button>
                  <button onClick={() => setEditGoal(null)} className="text-neutral-400 text-sm">✕</button>
                </div>
              ) : (
                <div onClick={() => { setEditGoal(goal.month); setGoalValue(goal.actual?.toString() || '') }}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-neutral-50">
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
                      <p className="text-xs text-neutral-300">✏️ Registrar</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notificações push */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500 uppercase">Notificações</p>
            <p className="text-xs text-neutral-400 mt-0.5">Aviso de contas e faturas vencendo, com o valor de cada uma</p>
          </div>
          <div className="px-4 py-4">
            {pushStatus === 'unsupported' && (
              <p className="text-sm text-neutral-400">Seu navegador não suporta notificações push. No Safari, funciona a partir da versão 16.4.</p>
            )}
            {pushStatus === 'checking' && (
              <p className="text-sm text-neutral-400">Verificando...</p>
            )}
            {pushStatus === 'off' && (
              <button onClick={handleEnablePush} disabled={pushBusy}
                className="w-full bg-olive-900 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-60">
                {pushBusy ? 'Ativando...' : 'Ativar notificações no Safari'}
              </button>
            )}
            {pushStatus === 'on' && (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">✓ Notificações ativadas neste dispositivo</p>
                <div className="flex gap-2">
                  <button onClick={handleTestPush} disabled={pushBusy}
                    className="flex-1 bg-neutral-100 text-neutral-700 py-2.5 rounded-lg font-medium text-sm disabled:opacity-60">
                    Enviar teste
                  </button>
                  <button onClick={handleDisablePush} disabled={pushBusy}
                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-medium text-sm disabled:opacity-60">
                    Desativar
                  </button>
                </div>
              </div>
            )}
            {pushMsg && <p className="text-xs text-neutral-400 mt-2">{pushMsg}</p>}
          </div>
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
              <p className="text-sm text-red-900 mb-3 font-medium">⚠️ Isso não pode ser desfeito!</p>
              <div className="flex gap-2">
                <button onClick={() => setShowClear(false)}
                  className="flex-1 bg-white border border-red-200 text-red-700 py-2.5 rounded-lg font-medium text-sm">Cancelar</button>
                <button onClick={handleClear}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm">Deletar Tudo</button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center py-2">
          <p className="text-xs text-neutral-400">Niggan Finances v2.0 · Desenvolvido para Felipe 🚀</p>
        </div>
      </main>
    </div>
  )
}
