import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { Transaction } from '@/lib/store'
import { formatCurrency, formatDate, INCOME_CATEGORIES, EXPENSE_CATEGORIES, INVESTMENT_CATEGORIES } from '@/lib/utils'
import Icon, { CATEGORY_ICON } from './Icon'

type FilterType = 'month'|'today'|'7days'|'income'|'expense'|'investment'|'all'
const ALL_CATS = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...INVESTMENT_CATEGORIES, 'Transferência']

export default function TransactionsList({ hidden = false }: { hidden?: boolean }) {
  const transactions = useFinanceStore(s => s.transactions)
  const removeTransaction = useFinanceStore(s => s.removeTransaction)
  const updateTransaction = useFinanceStore(s => s.updateTransaction)

  const [filter, setFilter] = useState<FilterType>('month')
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editData, setEditData] = useState<Partial<Transaction>>({})
  const [expandedId, setExpandedId] = useState<string|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)

  const fmt = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const today = new Date().toISOString().split('T')[0]
  const sevenAgo = (() => { const d=new Date(); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0] })()
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const filtered = transactions.filter(t => {
    if (filter==='month') return t.date >= startMonth
    if (filter==='today') return t.date === today
    if (filter==='7days') return t.date >= sevenAgo
    if (filter==='income') return t.type==='income' && t.date >= startMonth
    if (filter==='expense') return t.type==='expense' && t.date >= startMonth
    if (filter==='investment') return t.type==='investment' && t.date >= startMonth
    return true
  })

  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => { if (!grouped[t.date]) grouped[t.date]=[]; grouped[t.date].push(t) })
  const sortedDates = Object.keys(grouped).sort((a,b) => b.localeCompare(a))

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setEditData({ type:tx.type, category:tx.category, amount:tx.amount, description:tx.description, date:tx.date })
    setExpandedId(null)
  }
  const saveEdit = () => {
    if (!editingId||!editData.amount||editData.amount<=0) return
    updateTransaction(editingId, editData)
    setEditingId(null); setEditData({})
  }

  const typeColor = (t: string) => t==='income'?'#2D7A4F':t==='investment'?'#8A6D2E':t==='transfer'?'#6B6140':'#C0392B'
  const typeBg   = (t: string) => t==='income'?'#EBF7F0':t==='investment'?'#FAF3E1':t==='transfer'?'#F0EFE9':'#FCECEA'
  const typeSign  = (t: string) => t==='income'?'+':t==='investment'?'↗':t==='transfer'?'↔':'-'

  const FILTERS: { key: FilterType; label: string }[] = [
    { key:'month', label:'Este mês' },
    { key:'today', label:'Hoje' },
    { key:'7days', label:'7 dias' },
    { key:'income', label:'Entradas' },
    { key:'expense', label:'Saídas' },
    { key:'investment', label:'Invest.' },
    { key:'all', label:'Histórico' },
  ]

  const totalIncome  = filtered.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExpense = filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)

  return (
    <div>
      {/* Filters */}
      <div className="px-4 mb-3 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={()=>setFilter(f.key)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all pressable"
            style={filter===f.key
              ? { background:'#3D3822', color:'#F0D98A' }
              : { background:'#fff', color:'#857A50', border:'1px solid #E5E3D8' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="px-4 mb-3 flex items-center gap-4">
          {totalIncome > 0 && <p className="text-xs font-semibold tabular" style={{ color:'#2D7A4F' }}>+{fmt(totalIncome)}</p>}
          {totalExpense > 0 && <p className="text-xs font-semibold tabular" style={{ color:'#C0392B' }}>-{fmt(totalExpense)}</p>}
          <p className="text-xs" style={{ color:'#C8C5B8' }}>{filtered.length} transações</p>
        </div>
      )}

      <div className="px-4 pb-32">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background:'#F0EFE9' }}>
              <Icon name="inbox" size={22} color="#A8A79E" />
            </div>
            <p className="text-sm font-medium" style={{ color:'#A8A79E' }}>Nenhuma transação</p>
            {filter !== 'all' && (
              <button onClick={()=>setFilter('all')} className="mt-2 text-xs font-semibold pressable" style={{ color:'#6B6140' }}>
                Ver histórico completo
              </button>
            )}
          </div>
        ) : sortedDates.map(date => (
          <div key={date} className="mb-5">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-semibold" style={{ color:'#A8A79E' }}>{formatDate(date)}</p>
              <div className="flex-1 h-px" style={{ background:'#F0EFE9' }} />
              <p className="text-xs font-semibold tabular" style={{ color:'#C8C5B8' }}>
                {fmt(grouped[date].reduce((s,t)=>t.type==='income'?s+t.amount:t.type==='transfer'?s:s-t.amount,0))}
              </p>
            </div>

            <div className="space-y-2">
              {grouped[date].map(tx => (
                <div key={tx.id} className="rounded-2xl overflow-hidden shadow-card" style={{ background:'#fff', border:'1px solid #F0EFE9' }}>
                  {editingId===tx.id ? (
                    <div className="p-4 space-y-2.5">
                      <p className="text-xs font-semibold" style={{ color:'#6B6140' }}>Editando</p>
                      <div className="flex gap-2">
                        {(['expense','income','investment'] as const).map(tp => (
                          <button key={tp} type="button" onClick={()=>setEditData(d=>({...d,type:tp}))}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all pressable"
                            style={editData.type===tp
                              ? { background:tp==='income'?'#2D7A4F':tp==='investment'?'#8A6D2E':'#C0392B', color:'#fff' }
                              : { background:'#F0EFE9', color:'#857A50' }}>
                            {tp==='income'?'Entrada':tp==='investment'?'Invest.':'Saída'}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color:'#A8A79E' }}>R$</span>
                        <input type="number" step="0.01" min="0" value={editData.amount||''}
                          onChange={e=>setEditData(d=>({...d,amount:parseFloat(e.target.value)}))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold"
                          style={{ background:'#F8F8F6', border:'1.5px solid #E5E3D8' }} inputMode="decimal" />
                      </div>
                      <select value={editData.category} onChange={e=>setEditData(d=>({...d,category:e.target.value}))}
                        className="w-full px-4 py-3 rounded-xl text-sm cursor-pointer"
                        style={{ background:'#F8F8F6', border:'1.5px solid #E5E3D8' }}>
                        {ALL_CATS.map(c=><option key={c}>{c}</option>)}
                      </select>
                      <input type="text" value={editData.description||''} onChange={e=>setEditData(d=>({...d,description:e.target.value}))}
                        placeholder="Descrição" className="w-full px-4 py-3 rounded-xl text-sm"
                        style={{ background:'#F8F8F6', border:'1.5px solid #E5E3D8' }} />
                      <input type="date" value={editData.date||''} onChange={e=>setEditData(d=>({...d,date:e.target.value}))}
                        className="w-full px-4 py-3 rounded-xl text-sm"
                        style={{ background:'#F8F8F6', border:'1.5px solid #E5E3D8' }} />
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditingId(null);setEditData({})}}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium pressable"
                          style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                        <button onClick={saveEdit}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold pressable"
                          style={{ background:'#3D3822', color:'#F0D98A' }}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div onClick={()=>setExpandedId(expandedId===tx.id?null:tx.id)} className="flex items-center gap-3 p-3.5 cursor-pointer pressable">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: typeBg(tx.type) }}>
                          <Icon name={CATEGORY_ICON[tx.category] || (tx.type==='income'?'coins':tx.type==='investment'?'invest':tx.type==='transfer'?'arrowRight':'package')}
                            size={18} color={typeColor(tx.type)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color:'#1A1A14' }}>{tx.description}</p>
                          <p className="text-xs truncate mt-0.5" style={{ color:'#A8A79E' }}>{tx.category}</p>
                        </div>
                        <p className="text-sm font-bold tabular flex-shrink-0" style={{ color:typeColor(tx.type) }}>
                          {typeSign(tx.type)}{fmt(tx.amount)}
                        </p>
                      </div>
                      {expandedId===tx.id && (
                        <div className="flex gap-2 px-3.5 pb-3">
                          <button onClick={()=>startEdit(tx)}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold pressable flex items-center justify-center gap-1.5"
                            style={{ background:'#F0EFE9', color:'#544C31' }}>
                            <Icon name="edit" size={13} color="#544C31" /> Editar
                          </button>
                          {confirmDelete===tx.id ? (
                            <>
                              <button onClick={()=>{removeTransaction(tx.id);setExpandedId(null);setConfirmDelete(null)}}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold pressable"
                                style={{ background:'#C0392B', color:'#fff' }}>Confirmar</button>
                              <button onClick={()=>setConfirmDelete(null)}
                                className="flex-1 py-2 rounded-xl text-xs font-medium pressable"
                                style={{ background:'#F0EFE9', color:'#857A50' }}>Cancelar</button>
                            </>
                          ) : (
                            <button onClick={()=>setConfirmDelete(tx.id)}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold pressable flex items-center justify-center gap-1.5"
                              style={{ background:'#FCECEA', color:'#C0392B' }}>
                              <Icon name="trash" size={13} color="#C0392B" /> Deletar
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
