export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate()-1)
  if (date === today.toISOString().split('T')[0]) return 'Hoje'
  if (date === yesterday.toISOString().split('T')[0]) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
}

export function isWednesday(): boolean { return new Date().getDay() === 3 }
export function getProgressPercent(current: number, target: number): number {
  if (!target) return 0
  return Math.min(100, Math.round((current/target)*100))
}

export const FINAL_GOAL = 30000

// Categorias de entrada - removido "Entrada" e "Outras receitas", adicionado F7
export const INCOME_CATEGORIES = [
  'Salário FGL Brasil',
  'Contratos / Instalações',
  'TikTok Shop',
  'F7 Empresa',
  'Outras receitas',
]

export const EXPENSE_CATEGORIES = [
  'Dízimo',
  'Internet VIVO',
  'Combustível',
  'Cartão de Crédito',
  'Corte Cabelo',
  'Assinaturas',
  'Lazer',
  'Presentes',
  'Alimentação',
  'Compras pessoais',
  'Equipamentos / Trabalho',
  'Imprevistos',
  'Saúde',
  'Outras despesas',
]

export const INVESTMENT_CATEGORIES = [
  'CDB / Reserva',
  'Aporte extra',
]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Salário FGL Brasil': '💼',
  'Contratos / Instalações': '🔧',
  'TikTok Shop': '🎵',
  'F7 Empresa': '🏢',
  'Outras receitas': '💰',
  'Dízimo': '🙏',
  'Internet VIVO': '📡',
  'Combustível': '⛽',
  'Cartão de Crédito': '💳',
  'Corte Cabelo': '✂️',
  'Assinaturas': '📱',
  'Lazer': '🎮',
  'Presentes': '🎁',
  'Alimentação': '🍔',
  'Compras pessoais': '🛍️',
  'Equipamentos / Trabalho': '🛠️',
  'Imprevistos': '⚡',
  'Saúde': '⚕️',
  'Outras despesas': '📦',
  'CDB / Reserva': '📈',
  'Aporte extra': '💎',
}
