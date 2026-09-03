import { CreditCardPurchase } from './store'

// Dia de vencimento fixo de cada cartão.
export const CARD_DUE_DAY: Record<'C6' | 'Nubank', number> = { C6: 1, Nubank: 3 }
export const CARD_LABEL: Record<'C6' | 'Nubank', string> = { C6: 'C6 Black', Nubank: 'Nubank' }

export function installmentsLeft(p: CreditCardPurchase): number {
  return p.installments - p.currentInstallment + 1
}

// Número da parcela (1-indexado) que cai no mês `hoje + mOff`, calculado a
// partir do mês em que a compra foi feita (`startDate`) — não depende de
// quantas parcelas já foram pagas. É isso que faz "mês da fatura" e
// "parcela paga" serem coisas separadas: sem isso, pagar uma parcela não
// tirava a compra da lista do mês atual, e cada clique a mais cobrava de
// novo e avançava a parcela — o bug de "paguei duplicado".
export function installmentNumberForMonth(p: CreditCardPurchase, mOff: number, now = new Date()): number {
  const [sy, sm] = p.startDate.split('-').map(Number)
  const targetTotal = now.getFullYear() * 12 + now.getMonth() + mOff
  const startTotal = sy * 12 + (sm - 1)
  return (targetTotal - startTotal) + 1
}

export function isBilledInMonth(p: CreditCardPurchase, mOff: number, now = new Date()): boolean {
  const n = installmentNumberForMonth(p, mOff, now)
  return n >= 1 && n <= p.installments
}

// A parcela referente a esse mês já foi paga (currentInstallment já passou
// do número da parcela daquele mês)?
export function isPaidForMonth(p: CreditCardPurchase, mOff: number, now = new Date()): boolean {
  return p.currentInstallment > installmentNumberForMonth(p, mOff, now)
}

// Compras faturadas e ainda não pagas nesse cartão, nesse mês — é o que
// realmente está em aberto pra pagar.
export function openPurchasesForMonth(
  purchases: CreditCardPurchase[], card: 'C6' | 'Nubank', mOff: number, now = new Date()
): CreditCardPurchase[] {
  return purchases.filter(p => p.card === card && isBilledInMonth(p, mOff, now) && !isPaidForMonth(p, mOff, now))
}
