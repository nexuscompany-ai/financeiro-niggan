import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import useFinanceStore from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabase'

function AppContent({ Component, pageProps }: AppProps) {
  const loadFromStorage = useFinanceStore(s => s.loadFromStorage)
  const loadFromSupabase = useFinanceStore(s => s.loadFromSupabase)
  const synced = useFinanceStore(s => s.synced)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Carrega localStorage primeiro (instantâneo)
    loadFromStorage()

    // 2. Se Supabase configurado, sincroniza em background
    if (isSupabaseConfigured()) {
      loadFromSupabase().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading && isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-olive-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Sincronizando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {synced && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-xs text-center py-0.5">
          ☁️ Sincronizado com Supabase
        </div>
      )}
      <Component {...pageProps} />
    </>
  )
}

export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Niggan" />
        <meta name="description" content="App de finanças pessoais - 100% Mobile" />
        <title>Niggan Finances</title>
      </Head>
      <AppContent {...props} />
    </>
  )
}
