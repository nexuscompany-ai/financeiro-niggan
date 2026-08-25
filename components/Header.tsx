import Link from 'next/link'
import { useRouter } from 'next/router'

interface HeaderProps {
  title: string
  subtitle?: string
  showSettings?: boolean
}

export default function Header({ title, subtitle, showSettings = true }: HeaderProps) {
  const router = useRouter()
  const isHome = router.pathname === '/'

  return (
    <header className="sticky top-0 bg-white border-b border-neutral-100 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-olive-900">{title}</h1>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
        {isHome && showSettings && (
          <Link
            href="/settings"
            className="w-10 h-10 bg-olive-100 hover:bg-olive-200 rounded-full flex items-center justify-center text-lg transition-colors"
            title="Configurações"
          >
            ⚙️
          </Link>
        )}
      </div>
    </header>
  )
}
