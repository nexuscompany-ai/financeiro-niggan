interface IconProps {
  name: string
  size?: number
  color?: string
  className?: string
}

const PATHS: Record<string, string> = {
  // Navigation
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.9-2.1a7 7 0 0 0 .1-1 7 7 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a6.9 6.9 0 0 0-1.7-1l-.4-2.6A.5.5 0 0 0 13 2h-4a.5.5 0 0 0-.5.4l-.4 2.6a7 7 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L3.1 11a7 7 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.5-1a7 7 0 0 0 1.7 1l.4 2.6c.1.2.3.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.6a7 7 0 0 0 1.7-1l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6L18.9 13z",
  back: "M19 12H5m7-7-7 7 7 7",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: "M17.9 17.9A10.8 10.8 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.8 9.8 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2m-6.4-1.7a3 3 0 1 1-4.2-4.2M1 1l22 22",
  close: "M18 6 6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  chevronDown: "m6 9 6 6 6-6",
  chevronUp: "m18 15-6-6-6 6",

  // Finance
  wallet: "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2m-4-5h4v6h-4a3 3 0 0 1 0-6z",
  trending: "m22 7-8.5 8.5-5-5L1 18",
  trendingDown: "m22 17-8.5-8.5-5 5L1 6",
  creditCard: "M1 4h22v16H1zM1 9h22",
  bank: "M3 22v-9m4 9v-9m4 9v-9m4 9v-9m4 9v-9M1 13l11-9 11 9",
  safe: "M19 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4 0h2m-2-3h2",
  invest: "M2 20h.01M7 20v-4m5 4V8m5 12v-6",
  coins: "M8 14a6 6 0 1 0 0-12A6 6 0 0 0 8 14zm0 0v8m4-8h4m0 4h-4",
  arrowUp: "M12 19V5m-7 7 7-7 7 7",
  arrowDown: "M12 5v14m-7-7 7 7 7-7",

  // Categories
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  tool: "m20.7 7-1.4-1.4a1 1 0 0 0-1.4 0L16 8 12 4l-1.5 1.5L9 4 4 9l1 1-2.7 2.7a1 1 0 0 0 0 1.4l4.6 4.6a1 1 0 0 0 1.4 0L11 16l1 1 5-5-1-1 2-2a1 1 0 0 0 0-1.4L17 7h3.7z",
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM2 22h20M10 10h4m-4 4h4M10 6h4",
  fuel: "M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7m0 0 2-2m0 0v7m0-7h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2",
  wifi: "M5 12.5a9.5 9.5 0 0 1 14 0M1 8.5a15 15 0 0 1 22 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01",
  scissors: "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12",
  smartphone: "M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01",
  gamepad: "M6 12h4m-2-2v4m7-2h.01M17 9h.01M9 5H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7m0 0H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  shoppingBag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8z",
  food: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  package: "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7 12 12l8.7-5M12 22V12",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  cross: "M22 12h-4l-3 9L9 3l-3 9H2",
  check: "M20 6 9 17l-5-5",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2 1.2-6.8L2 9.3l6.9-1z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  diamond: "M12 2l8 10-8 10L4 12z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  // TikTok (simplified music note)
  tiktok: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  // Arrow right
  arrowRight: "M5 12h14m-7-7 7 7-7 7",
  inbox: "M22 12h-6l-2 3H10l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
}

// Categoria → ícone
export const CATEGORY_ICON: Record<string, string> = {
  'Salário FGL Brasil': 'briefcase',
  'Contratos FGN': 'tool',
  'TikTok Shop': 'tiktok',
  'F7 Empresa': 'building',
  'Outras receitas': 'coins',
  'Dízimo': 'heart',
  'Internet VIVO': 'wifi',
  'Combustível': 'fuel',
  'Cartão de Crédito': 'creditCard',
  'Corte Cabelo': 'scissors',
  'Assinaturas': 'smartphone',
  'Lazer': 'gamepad',
  'Presentes': 'gift',
  'Alimentação': 'food',
  'Compras pessoais': 'shoppingBag',
  'Equipamentos / Trabalho': 'tool',
  'Imprevistos': 'zap',
  'Saúde': 'cross',
  'Outras despesas': 'package',
  'CDB / Reserva': 'invest',
  'Aporte extra': 'diamond',
}

export default function Icon({ name, size = 20, color = 'currentColor', className = '' }: IconProps) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
