import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter, Space_Grotesk } from 'next/font/google'
import { useEffect } from 'react'
import useFinanceStore from '@/lib/store'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-space',
  display: 'swap',
})

export default function App({ Component, pageProps, router }: AppProps) {
  const load = useFinanceStore(s => s.load)
  useEffect(() => { load() }, [])

  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`}
      style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#F8F8F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Niggan" />
        <title>Niggan · Finanças</title>
      </Head>
      <Component {...pageProps} />
    </div>
  )
}
