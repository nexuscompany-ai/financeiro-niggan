// Máscara de moeda estilo banco: digita centavos, formata em tempo real
// "300" → "3,00" | "30000" → "300,00"

export function formatMoneyInput(raw: string): string {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  // Converte para centavos → reais
  const cents = parseInt(digits, 10)
  const reais = cents / 100
  return reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseMoney(formatted: string): number {
  // "1.234,56" → 1234.56
  const clean = formatted.replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Hook-like helper: recebe evento onChange, retorna valor formatado e numérico
export function handleMoneyChange(e: React.ChangeEvent<HTMLInputElement>) {
  const formatted = formatMoneyInput(e.target.value)
  const numeric   = parseMoney(formatted)
  return { formatted, numeric }
}
