import { useState } from 'react'
import useFinanceStore from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import Icon from './Icon'
import MoneyInput from './MoneyInput'

export default function BalanceCard({ hidden = false }: { hidden?: boolean }) {
  const getThisMonth = useFinanceStore(s => s.getThisMonth)
  const patrimony    = useFinanceStore(s => s.patrimony)
  const updatePatrimony = useFinanceStore(s => s.updatePatrimony)
  const getAccountBalance = useFinanceStore(s => s.getAccountBalance)
  const getCreditCardTotal = useFinanceStore(s => s.getCreditCardTotal)
  const syncing      = useFinanceStore(s => s.syncing)

  const [editingConta, setEditingConta] = useState(false)
  const [newConta,     setNewConta]     = useState(0)

  const month        = getThisMonth()
  // "Conta corrente" é um extrato: patrimônio base + soma de todas as
  // transações marcadas com essa conta (ver getAccountBalance em
  // lib/store.ts). Nenhuma tela mexe no valor bruto diretamente.
  const conta         = getAccountBalance('Conta corrente')
  const investimentos= getAccountBalance('C6 Investimentos')
  const totalCC      = getCreditCardTotal('C6') + getCreditCardTotal('Nubank')
  const fmt          = (v: number) => hidden ? '•••••' : formatCurrency(v)

  const openEditConta = () => { setNewConta(Math.max(0, conta)); setEditingConta(true) }
  const saveConta = () => {
    // O valor digitado é o saldo final desejado; a base salva precisa
    // descontar o que o extrato (transações já lançadas) já soma/subtrai,
    // senão a correção some assim que a próxima transação for computada.
    const baseline = patrimony.find(p => p.account === 'Conta corrente')?.balance || 0
    const ledger = conta - baseline
    updatePatrimony('Conta corrente', newConta - ledger)
    setEditingConta(false)
  }

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
            <p className="font-display font-bold text-2xl text-white tracking-tight">neggan</p>
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
            { label:'Aporte', value:month.investment, color:'#C9A84C', icon:'invest' },
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
            { label:'Conta',    value:conta,        color:'#fff',    icon:'wallet', onClick:openEditConta },
            { label:'Investido',value:investimentos,color:'#F0D98A', icon:'trending' },
            { label:'Cartões',  value:totalCC,      color:totalCC>0?'#F87171':'#4ADE80', icon:'creditCard', prefix:totalCC>0?'-':'' },
          ].map(({ label, value, color, icon, prefix, onClick }) => (
            <div key={label} onClick={onClick} className={onClick ? 'pressable' : ''} style={onClick ? { cursor:'pointer' } : undefined}>
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

      {/* Editar saldo em conta */}
      {editingConta && (
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'flex-end',
          background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}
          onClick={()=>setEditingConta(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:'100%',background:'#fff',borderRadius:'24px 24px 0 0',padding:'16px 20px 32px'}}>
            <div style={{width:40,height:4,borderRadius:2,background:'#E5E3D8',margin:'0 auto 20px'}}/>
            <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
              color:'#1A1A14',margin:'0 0 4px'}}>Corrigir saldo em conta</p>
            <p style={{fontSize:12,color:'#A8A79E',margin:'0 0 16px'}}>
              Ajuste para o valor real da sua conta corrente hoje.
            </p>
            <MoneyInput value={newConta} onChange={setNewConta} autoFocus/>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>setEditingConta(false)}
                style={{flex:1,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                  background:'#F0EFE9',color:'#857A50',fontSize:14,fontWeight:600}}>
                Cancelar
              </button>
              <button onClick={saveConta}
                style={{flex:2,padding:'14px',borderRadius:14,border:'none',cursor:'pointer',
                  background:'#3D3822',color:'#F0D98A',fontSize:14,fontWeight:700}}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
