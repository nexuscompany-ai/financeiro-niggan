import { useState, useRef } from 'react'
import useFinanceStore from '@/lib/store'

interface TransactionInputProps {
  onSubmit?: () => void
}

export default function TransactionInput({ onSubmit }: TransactionInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const addTransaction = useFinanceStore((state) => state.addTransaction)

  const handleAutoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Escreva algo para Mia processar')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/mia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!data.success || !data.transaction) {
        setError(data.error || 'Não consegui processar isso. Tente de novo.')
        return
      }

      const { type, amount, category, description, date } = data.transaction

      addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
        processed: true,
      })

      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
      onSubmit?.()
    } catch (err) {
      setError('Erro ao conectar com Mia. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 pb-safe">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleAutoResize()
            }}
            placeholder="Escreve pra Mia: 'gastei 50 em comida' ou 'recebi 100 de freelancer'"
            className="w-full px-4 py-3 bg-neutral-100 rounded-xl focus:bg-white border-2 border-transparent focus:border-olive-500 resize-none overflow-hidden font-base placeholder-neutral-400 transition-all"
            rows={1}
            maxLength={500}
            disabled={loading}
          />
          <div className="absolute right-3 bottom-2 text-xs text-neutral-400">
            {message.length}/500
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full bg-olive-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-olive-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <span>💬 Enviar para Mia</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
