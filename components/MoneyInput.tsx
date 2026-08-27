import { useState, useEffect } from 'react'
import { formatMoneyInput, parseMoney } from '@/lib/money'

interface MoneyInputProps {
  value: number           // valor numérico controlado
  onChange: (n: number) => void
  placeholder?: string
  style?: React.CSSProperties
  autoFocus?: boolean
  label?: string
}

export default function MoneyInput({ value, onChange, placeholder = '0,00', style, autoFocus, label }: MoneyInputProps) {
  // Mantém a string formatada internamente
  const [display, setDisplay] = useState(
    value > 0 ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
  )

  // Sincroniza se o valor externo mudar (ex: botão "usar total")
  useEffect(() => {
    if (value === 0 && display === '') return
    const formatted = value > 0
      ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      : ''
    setDisplay(formatted)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatMoneyInput(e.target.value)
    setDisplay(formatted)
    onChange(parseMoney(formatted))
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <p style={{ fontSize: 11, fontWeight: 700, color: '#857A50', marginBottom: 6,
          textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      )}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, fontWeight: 600, color: '#A8A79E', pointerEvents: 'none' }}>
          R$
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px 14px 14px 40px',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            color: '#1A1A14',
            background: '#F7F6F2',
            border: '1.5px solid #E5E3D8',
            borderRadius: 14,
            outline: 'none',
            letterSpacing: '-0.01em',
            ...style,
          }}
        />
      </div>
    </div>
  )
}
