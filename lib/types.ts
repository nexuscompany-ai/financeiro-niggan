/**
 * Tipos globais da aplicação Niggan Finances
 */

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  processed: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DailyBalance {
  date: string
  balance: number
  income: number
  expense: number
}

export interface MonthlyBalance extends DailyBalance {
  month: number
  year: number
  totalTransactions: number
}

export interface MiaApiRequest {
  message: string
}

export interface MiaApiResponse {
  success: boolean
  transaction?: {
    type: TransactionType
    amount: number | string
    category: string
    description: string
    date: string
    processed: boolean
    confidence?: number
  }
  error?: string
}

export interface FinanceStats {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  averageTransaction: number
  transactionCount: number
  lastTransaction?: Transaction
}

export interface AppConfig {
  appName: string
  version: string
  tiktokDay: number // 0-6 (0 = Sunday, 3 = Wednesday)
  currency: string
  locale: string
}

export const DEFAULT_CONFIG: AppConfig = {
  appName: 'Niggan',
  version: '2.0.0',
  tiktokDay: 3, // Wednesday
  currency: 'BRL',
  locale: 'pt-BR',
}

export const TRANSACTION_CATEGORIES = {
  income: [
    'Salário',
    'TikTok Shop',
    'Contratos',
    'Freelancer',
    'Investimentos',
    'Bônus',
    'Outros',
  ] as const,
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Lazer',
    'Educação',
    'Telefone',
    'Internet',
    'Subscriptions',
    'Outros',
  ] as const,
}

export type IncomeCategory = (typeof TRANSACTION_CATEGORIES.income)[number]
export type ExpenseCategory = (typeof TRANSACTION_CATEGORIES.expense)[number]
