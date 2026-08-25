import { useState } from 'react'
import Link from 'next/link'
import useFinanceStore from '@/lib/store'

export default function Settings() {
  const [showClearData, setShowClearData] = useState(false)
  const transactions = useFinanceStore((state) => state.transactions)

  const handleClearData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('niggan-finances-store')
      localStorage.removeItem('lastTiktokDate')
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const data = {
      transactions,
      exportDate: new Date().toISOString(),
    }
    
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
    element.setAttribute('download', `niggan-backup-${new Date().toISOString().split('T')[0]}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-2xl hover:opacity-70 transition-opacity">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-olive-900">Configurações</h1>
            <p className="text-xs text-neutral-500">Gerenciar dados e preferências</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 pb-safe">
        {/* App Info */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-neutral-600 uppercase mb-3">App</h2>
          <div className="bg-olive-50 rounded-xl p-4 border border-olive-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-700">Versão</span>
              <span className="font-bold text-olive-900">2.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700">Status</span>
              <span className="text-green-600 font-medium">🟢 Online</span>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-neutral-600 uppercase mb-3">Dados</h2>
          
          <div className="space-y-3">
            {/* Transactions Count */}
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-700">Transações</span>
                <span className="font-bold text-olive-900">{transactions.length}</span>
              </div>
              <p className="text-xs text-neutral-500">
                {transactions.length > 0 
                  ? `Última: ${new Date(transactions[transactions.length - 1].date).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma transação ainda'}
              </p>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="w-full bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">📊 Exportar Dados</p>
                  <p className="text-xs text-green-700">Baixar backup JSON</p>
                </div>
                <span className="text-xl">→</span>
              </div>
            </button>

            {/* Clear Data Button */}
            <button
              onClick={() => setShowClearData(!showClearData)}
              className="w-full bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-900">🗑️ Limpar Tudo</p>
                  <p className="text-xs text-red-700">Deletar todas as transações</p>
                </div>
                <span className="text-xl">→</span>
              </div>
            </button>

            {showClearData && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-up">
                <p className="text-sm text-red-900 mb-4">
                  ⚠️ Tem certeza? Isso vai deletar TUDO e não pode ser desfeito.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearData(false)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-900 font-medium py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Deletar Tudo
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mia Section */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-neutral-600 uppercase mb-3">Mia - IA</h2>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🤖</span>
              <div>
                <p className="font-bold text-neutral-900">Assistente Mia</p>
                <p className="text-xs text-neutral-500">Powered by Anthropic Claude</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mb-3">
              Mia processa suas transações em linguagem natural. Ela entende padrões e categoriza automaticamente!
            </p>
            <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
              Exemplos: "gastei 50 em comida" ou "recebi 100 de freelancer"
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-bold text-neutral-600 uppercase mb-3">Sobre</h2>
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <p className="text-2xl mb-2">🤑</p>
            <p className="font-bold text-olive-900 mb-1">Niggan Finances</p>
            <p className="text-xs text-neutral-600 mb-3">
              App de finanças pessoais 100% mobile com IA integrada
            </p>
            <p className="text-xs text-neutral-500">
              Desenvolvido com ❤️ para Felipe<br />
              © 2026 Niggan
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
