import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import useFinanceStore from '@/lib/store'

function AppContent({ Component, pageProps }: AppProps) {
  const loadFromStorage = useFinanceStore((state) => state.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [])

  return <Component {...pageProps} />
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
