import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import useFinanceStore from '@/lib/store'

function AppContent({ Component, pageProps }: AppProps) {
  const load = useFinanceStore(s => s.load)
  useEffect(() => { load() }, [])
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
        <meta name="apple-mobile-web-app-title" content="Niggan" />
        <title>Niggan Finances</title>
      </Head>
      <AppContent {...props} />
    </>
  )
}
