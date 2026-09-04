import { useState, useMemo } from 'react'
import Link from 'next/link'
import useFinanceStore, { Task } from '@/lib/store'
import Icon from '@/components/Icon'

function todayISO() { return new Date().toISOString().split('T')[0] }
function addDaysISO(n: number) { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0] }

function dateLabel(dateStr: string) {
  if (dateStr === todayISO()) return 'Hoje'
  if (dateStr === addDaysISO(1)) return 'Amanhã'
  const d = new Date(dateStr+'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })
}

export default function Tarefas() {
  const rawTasks   = useFinanceStore(s => s.tasks)
  const addTask    = useFinanceStore(s => s.addTask)
  const toggleTask = useFinanceStore(s => s.toggleTask)
  const removeTask = useFinanceStore(s => s.removeTask)

  const tasks = rawTasks ?? []
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [desc, setDesc] = useState('')
  const [notes, setNotes] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pickingDate, setPickingDate] = useState(false)

  // Com horário definido vem primeiro, em ordem — sem horário fica depois,
  // na ordem em que foram criadas.
  const byTime = (list: Task[]) => [...list].sort((a, b) => {
    if (a.reminderTime && b.reminderTime) return a.reminderTime.localeCompare(b.reminderTime)
    if (a.reminderTime) return -1
    if (b.reminderTime) return 1
    return 0
  })

  const dayTasks = useMemo(()=>tasks.filter(t=>t.date===selectedDate), [tasks, selectedDate])
  const pending = byTime(dayTasks.filter(t=>!t.done))
  const doneTasks = byTime(dayTasks.filter(t=>t.done))

  const S = {
    surface:'#fff', border:'1px solid #F0EFE9',
    text:'#1A1A14', muted:'#857A50', faint:'#B0AC98',
    red:'#C0392B', redBg:'#FEF0EE', green:'#2D7A4F', greenBg:'#EBF7F0',
    gold:'#8A6D2E', goldBg:'#FAF3E1',
    olive:'#3D3822', oliveL:'#F0D98A',
    inp:{background:'#F7F6F2',border:'1.5px solid #E5E3D8',borderRadius:12,
      padding:'11px 14px',fontSize:14,color:'#1A1A14',
      width:'100%',boxSizing:'border-box' as const,outline:'none'},
  }

  function submitAdd() {
    if (!desc.trim()) return
    addTask({
      description: desc.trim(),
      date: selectedDate,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(reminderTime ? { reminderTime } : {}),
    })
    setDesc(''); setNotes(''); setReminderTime(''); setShowAdvanced(false)
  }

  const QUICK = [
    { label:'Hoje', date:todayISO() },
    { label:'Amanhã', date:addDaysISO(1) },
  ]

  const TaskRow = ({t}:{t:Task}) => (
    <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',
      background:S.surface,borderRadius:16,boxShadow:'0 1px 3px rgba(41,38,21,0.05)'}}>
      <button onClick={()=>toggleTask(t.id)} className="pressable"
        style={{width:26,height:26,borderRadius:9,flexShrink:0,border:'none',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',marginTop:1,
          background:t.done?S.green:'#F0EFE9'}}>
        {t.done && <Icon name="check" size={14} color="#fff"/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {t.reminderTime && (
            <span style={{fontSize:11,fontWeight:700,color:t.done?S.faint:S.gold,
              background:t.done?'#F0EFE9':S.goldBg,borderRadius:6,padding:'2px 6px',flexShrink:0}}>
              {t.reminderTime}
            </span>
          )}
          <p style={{fontSize:14,fontWeight:600,margin:0,minWidth:0,
            color:t.done?S.faint:S.text,
            textDecoration:t.done?'line-through':'none'}}>{t.description}</p>
        </div>
        {t.notes && <p style={{fontSize:12,color:S.faint,margin:'3px 0 0'}}>{t.notes}</p>}
      </div>
      <button onClick={()=>removeTask(t.id)} className="pressable"
        style={{width:28,height:28,borderRadius:9,border:'none',cursor:'pointer',flexShrink:0,
          background:S.redBg,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon name="close" size={12} color={S.red}/>
      </button>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F8F8F6',fontFamily:'Inter,system-ui,sans-serif'}}>
      <header style={{position:'sticky',top:0,zIndex:40,background:'rgba(255,255,255,0.9)',
        backdropFilter:'blur(12px)',borderBottom:'1px solid #E5E3D8'}}>
        <div style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
          <Link href="/" style={{width:34,height:34,borderRadius:10,background:'#F0EFE9',
            display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
            <Icon name="back" size={16} color="#6B6140"/>
          </Link>
          <div>
            <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:18,
              color:'#1A1A14',margin:0}}>Tarefas</h1>
            <p style={{fontSize:11,color:'#A8A79E',margin:0,textTransform:'capitalize'}}>{dateLabel(selectedDate)}</p>
          </div>
        </div>
      </header>

      <main style={{padding:'16px',display:'flex',flexDirection:'column',gap:16,paddingBottom:120}}>
        {/* Date tabs */}
        <div style={{display:'flex',gap:8}}>
          {QUICK.map(q=>(
            <button key={q.date} onClick={()=>{setSelectedDate(q.date);setPickingDate(false)}}
              style={{flex:1,padding:'10px 6px',borderRadius:12,border:'none',cursor:'pointer',
                fontWeight:700,fontSize:13,
                ...(selectedDate===q.date&&!pickingDate?{background:S.olive,color:S.oliveL,boxShadow:'0 2px 8px rgba(41,38,21,0.2)'}
                  :{background:'#F0EFE9',color:S.muted})}}>
              {q.label}
            </button>
          ))}
          <button onClick={()=>setPickingDate(p=>!p)}
            style={{flex:1,padding:'10px 6px',borderRadius:12,border:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
              ...(pickingDate?{background:S.olive,color:S.oliveL,boxShadow:'0 2px 8px rgba(41,38,21,0.2)'}
                :{background:'#F0EFE9',color:S.muted})}}>
            <Icon name="chevronDown" size={13} color={pickingDate?S.oliveL:S.muted}/> Outra
          </button>
        </div>
        {pickingDate && (
          <input type="date" value={selectedDate}
            onChange={e=>setSelectedDate(e.target.value||todayISO())}
            style={S.inp}/>
        )}

        {/* Hero */}
        <div style={{background:'linear-gradient(135deg,#3D3822 0%,#292615 100%)',
          borderRadius:22,padding:'20px 20px 18px',position:'relative',overflow:'hidden',
          boxShadow:'0 8px 28px rgba(41,38,21,0.28)'}}>
          <div style={{position:'absolute',top:0,right:0,width:180,height:180,
            background:'radial-gradient(circle at top right,rgba(201,168,76,0.12),transparent)',pointerEvents:'none'}}/>
          <p style={{fontSize:11,fontWeight:600,color:'#A09868',margin:'0 0 4px',position:'relative'}}>
            {dateLabel(selectedDate)}
          </p>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:32,color:'#fff',
            margin:0,lineHeight:1,position:'relative'}}>
            {pending.length} pendente{pending.length!==1?'s':''}
          </p>
          <p style={{fontSize:12,color:'#857A50',margin:'6px 0 0',position:'relative'}}>
            {doneTasks.length>0 ? `${doneTasks.length} concluída${doneTasks.length!==1?'s':''} · ` : ''}
            {dayTasks.length} tarefa{dayTasks.length!==1?'s':''} no total
          </p>
        </div>

        {/* Add task */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',gap:8}}>
            <input placeholder="Nova tarefa..." value={desc}
              onChange={e=>setDesc(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter') submitAdd()}}
              style={{...S.inp,flex:1}}/>
            <button onClick={submitAdd} disabled={!desc.trim()}
              style={{width:46,borderRadius:12,border:'none',cursor:desc.trim()?'pointer':'default',
                background:desc.trim()?S.olive:'#F0EFE9',opacity:desc.trim()?1:0.6,
                display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="plus" size={18} color={desc.trim()?S.oliveL:S.muted}/>
            </button>
          </div>

          <button onClick={()=>setShowAdvanced(s=>!s)}
            style={{alignSelf:'flex-start',display:'flex',alignItems:'center',gap:5,
              background:'none',border:'none',cursor:'pointer',padding:'2px 2px',fontSize:12,color:S.muted}}>
            <Icon name={showAdvanced?'chevronUp':'chevronDown'} size={11} color={S.muted}/>
            {showAdvanced
              ? 'Menos opções'
              : `Descrição e horário (opcional)${notes||reminderTime?' · preenchido':''}`}
          </button>

          {showAdvanced && (
            <div style={{background:S.surface,borderRadius:14,border:S.border,
              padding:12,display:'flex',flexDirection:'column',gap:10}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:S.muted,margin:'0 0 6px',
                  textTransform:'uppercase',letterSpacing:'0.05em'}}>Descrição (opcional)</p>
                <textarea placeholder="Mais detalhes sobre a tarefa..." value={notes}
                  onChange={e=>setNotes(e.target.value)}
                  style={{...S.inp,minHeight:60,resize:'vertical' as const,fontFamily:'inherit'}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:S.muted,margin:'0 0 6px',
                  textTransform:'uppercase',letterSpacing:'0.05em'}}>Horário de lembrete (opcional)</p>
                <input type="time" value={reminderTime}
                  onChange={e=>setReminderTime(e.target.value)} style={S.inp}/>
              </div>
            </div>
          )}
        </div>

        {/* Pending list */}
        {pending.length>0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {pending.map(t=><TaskRow key={t.id} t={t}/>)}
          </div>
        )}

        {/* Done list */}
        {doneTasks.length>0 && (
          <div>
            <p style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:'uppercase',
              letterSpacing:'0.06em',margin:'0 0 8px 2px'}}>Concluídas</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {doneTasks.map(t=><TaskRow key={t.id} t={t}/>)}
            </div>
          </div>
        )}

        {dayTasks.length===0 && (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{width:48,height:48,borderRadius:16,background:'#F0EFE9',
              display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
              <Icon name="checklist" size={22} color="#A8A79E"/>
            </div>
            <p style={{fontSize:14,color:'#A8A79E',margin:0}}>Nenhuma tarefa para {dateLabel(selectedDate).toLowerCase()}</p>
          </div>
        )}
      </main>
    </div>
  )
}
