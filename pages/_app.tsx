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
        <meta name="theme-color" content="#F8F8F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Niggan" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <title>Niggan · Finanças</title>
      </Head>
      <AppContent {...props} />
    </>
  )
}
