import { Transaction } from './store'

export function startOfMonthISO(now = new Date()): string {
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

// Uma conta fixa foi paga esse mês se existe alguma transação marcada com o
// billId dela datada dentro do mês atual — mesma checagem usada tanto pra
// recusar pagar de novo (store) quanto pra decidir se manda lembrete (cron).
export function isBillPaidThisMonth(transactions: Transaction[], billId: string, now = new Date()): boolean {
  const start = startOfMonthISO(now)
  return transactions.some(t => t.billId === billId && t.date >= start)
}

// Dias até o vencimento (negativo = já venceu), com a data de hoje
// normalizada à meia-noite pra não dar "vencido" antes da hora no dia certo.
export function daysUntilDue(dueDay: number, mOff: number, now = new Date()): number {
  const due = new Date(now.getFullYear(), now.getMonth()+mOff, dueDay)
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((due.getTime() - todayMid.getTime()) / 86400000)
}
