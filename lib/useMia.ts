import { useState } from 'react'
import useFinanceStore from './store'

interface MiaResponse {
  success: boolean
  transaction?: {
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    date: string
    processed: boolean
  }
  error?: string
}

export function useMia() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addTransaction = useFinanceStore((state) => state.addTransaction)

  const processMessage = async (message: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data: MiaResponse = await response.json()

      if (!data.success || !data.transaction) {
        setError(data.error || 'Erro ao processar mensagem')
        return false
      }

      const { type, amount, category, description, date } = data.transaction

      addTransaction({
        type,
        amount: parseFloat(String(amount)),
        category,
        description,
        date,
        processed: true,
      })

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMsg)
      console.error('Mia error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    processMessage,
    loading,
    error,
  }
}
