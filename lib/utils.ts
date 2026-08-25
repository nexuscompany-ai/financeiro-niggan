export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function getDayOfWeek(): number {
  return new Date().getDay()
}

export function isWednesday(): boolean {
  return new Date().getDay() === 3
}

export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export const INCOME_CATEGORIES = [
  'Salário FGL Brasil',
  'Contratos / Instalações',
  'TikTok Shop',
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
  'Saúde',
  'Outras despesas',
]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Salário FGL Brasil': '💼',
  'Contratos / Instalações': '🔧',
  'TikTok Shop': '🎵',
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
  'Saúde': '⚕️',
  'Outras despesas': '📦',
}

export const FINAL_GOAL = 30000
export const GOAL_DATE = 'Mai/2027'
