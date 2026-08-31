import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, INVESTMENT_CATEGORIES } from '@/lib/utils'
import MoneyInput from './MoneyInput'

export default function TransactionInput({ onSubmit }: { onSubmit?: () => void }) {
  const [type,         setType]         = useState<'expense'|'income'|'investment'>('expense')
  const [category,     setCategory]     = useState(EXPENSE_CATEGORIES[0])
  const [fromCategory, setFromCategory] = useState(INCOME_CATEGORIES[0])
  const [amount,       setAmount]       = useState(0)
  const [description,  setDescription]  = useState('')
  const [error,        setError]        = useState('')
  const addTransaction = useFinanceStore(s => s.addTransaction)
  const patrimony       = useFinanceStore(s => s.patrimony)
  const updatePatrimony = useFinanceStore(s => s.updatePatrimony)

  const categories = type==='income' ? INCOME_CATEGORIES : type==='investment' ? INVESTMENT_CATEGORIES : EXPENSE_CATEGORIES

  const handleType = (t: typeof type) => {
    setType(t)
    setCategory(t==='income'?INCOME_CATEGORIES[0]:t==='investment'?INVESTMENT_CATEGORIES[0]:EXPENSE_CATEGORIES[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0) { setError('Valor inválido'); return }
    if (!description.trim()) { setError('Adicione uma descrição'); return }
    addTransaction({
      type, category, amount, description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      ...(type==='investment' ? { fromCategory } : {}),
    })
    // Não há seletor de conta aqui — toda entrada/saída/investimento rápido
    // mexe direto na conta corrente (entrada soma, saída e investimento sobem).
    const conta = patrimony.find(p=>p.account==='Conta corrente')?.balance || 0
    if (type==='expense' || type==='investment') {
      updatePatrimony('Conta corrente', Math.max(0, conta - amount))
    } else if (type==='income') {
      updatePatrimony('Conta corrente', conta + amount)
    }
    if (type==='investment') {
      const investido = patrimony.find(p=>p.account==='C6 Investimentos')?.balance || 0
      updatePatrimony('C6 Investimentos', investido + amount)
    }
    setAmount(0); setDescription(''); setError('')
    onSubmit?.()
  }

  const typeConfig = {
    expense:    { label:'↑ Saída',    bg:'#C0392B', light:'#FCECEA', text:'#C0392B' },
    income:     { label:'↓ Entrada',  bg:'#2D7A4F', light:'#EBF7F0', text:'#2D7A4F' },
    investment: { label:'↗ Investir', bg:'#8A6D2E', light:'#FAF3E1', text:'#8A6D2E' },
  }
  const activeColor = typeConfig[type].bg

  const inp = {background:'#F8F8F6',border:'1.5px solid #E5E3D8',borderRadius:12,
    padding:'11px 14px',fontSize:14,color:'#1A1A14',width:'100%',
    boxSizing:'border-box' as const, outline:'none'}

  return (
    <div style={{padding:'16px'}}>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        {/* Type selector */}
        <div style={{display:'flex',gap:6,padding:'4px',borderRadius:16,background:'#F0EFE9'}}>
          {(['expense','income','investment'] as const).map(t=>(
            <button key={t} type="button" onClick={()=>handleType(t)}
              style={{flex:1,padding:'9px 4px',borderRadius:12,border:'none',cursor:'pointer',
                fontSize:12,fontWeight:700,transition:'all 0.15s',
                ...(type===t
                  ?{background:'#fff',color:typeConfig[t].text,boxShadow:'0 1px 4px rgba(0,0,0,0.1)'}
                  :{background:'transparent',color:'#A8A79E'})}}>
              {typeConfig[t].label}
            </button>
          ))}
        </div>

        {/* Money input */}
        <MoneyInput value={amount} onChange={setAmount} />

        {/* Category + Description */}
        <div style={{display:'flex',gap:8}}>
          <select value={category} onChange={e=>setCategory(e.target.value)}
            style={{...inp,flex:1,cursor:'pointer'}}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <input type="text" value={description} onChange={e=>setDescription(e.target.value)}
            placeholder="Descrição" maxLength={60}
            style={{...inp,flex:1}} />
        </div>

        {/* Investment origin */}
        {type==='investment'&&(
          <div style={{background:'#FAF3E1',border:'1px solid #E9D9AE',borderRadius:12,padding:'10px 14px'}}>
            <p style={{fontSize:11,fontWeight:700,color:'#8A6D2E',marginBottom:6,margin:0}}>De qual cofre vem?</p>
            <select value={fromCategory} onChange={e=>setFromCategory(e.target.value)}
              style={{...inp,background:'#fff',border:'1px solid #E9D9AE',color:'#6B5423',marginTop:6}}>
              {INCOME_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {error&&<p style={{fontSize:12,color:'#C0392B',margin:0}}>{error}</p>}

        <button type="submit"
          style={{width:'100%',padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
            background:activeColor,color:'#fff',fontSize:14,fontWeight:700,
            boxShadow:`0 4px 12px ${activeColor}40`}}>
          {typeConfig[type].label} · confirmar
        </button>
      </form>
    </div>
  )
}
