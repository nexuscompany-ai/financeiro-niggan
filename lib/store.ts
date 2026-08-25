import { create } from 'zustand'

export type TransactionType = 'income' | 'expense' | 'investment'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  fromCategory?: string // Para investimentos: de qual cofre veio
}

export interface Patrimony {
  account: string
  balance: number
}

export interface Goal {
  month: string
  target: number
  actual: number | null
}

export interface FinanceState {
  transactions: Transaction[]
  patrimony: Patrimony[]
  goals: Goal[]

  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  removeTransaction: (id: string) => void
  updatePatrimony: (account: string, balance: number) => void
  updateGoal: (month: string, actual: number) => void

  getBalance: () => number
  getToday: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getLast7Days: () => { income: number; expense: number; transactions: Transaction[] }
  getThisMonth: () => { income: number; expense: number; investment: number; transactions: Transaction[] }
  getByCategory: (days?: number) => Record<string, number>
  getInsights: () => { dailyAverage: number; projectedMonthly: number; mostSpentCategory: string; biggestExpense: Transaction | null }
  getTotalPatrimony: () => number
  // Cofres: entradas por categoria, investimentos NÃO diminuem o cofre
  getCofreTotal: (category: string) => number

  load: () => void
  save: (state: any) => void
}

const INITIAL_PATRIMONY: Patrimony[] = [
  { account: 'C6 Investimentos', balance: 9976.31 },
  { account: 'XP Investimentos', balance: 0 },
  { account: 'Mercado Pago', balance: 303.44 },
  { account: 'Dinheiro em conta', balance: 420.10 },
  { account: 'Santander', balance: 284.78 },
]

const INITIAL_GOALS: Goal[] = [
  { month: 'Ago/2026', target: 3000, actual: null },
  { month: 'Set/2026', target: 6000, actual: null },
  { month: 'Out/2026', target: 9000, actual: null },
  { month: 'Nov/2026', target: 12000, actual: null },
  { month: 'Dez/2026', target: 15000, actual: null },
  { month: 'Jan/2027', target: 18000, actual: null },
  { month: 'Fev/2027', target: 21000, actual: null },
  { month: 'Mar/2027', target: 24000, actual: null },
  { month: 'Abr/2027', target: 27000, actual: null },
  { month: 'Mai/2027', target: 30000, actual: null },
]

// 254 transações reais do extrato bancário (Jan-Ago 2026)
const EXTRATO: Transaction[] = [
  // ===== JANEIRO 2026 =====
  {id:"e-1",type:"income",category:"Contratos / Instalações",amount:105.76,description:"PIX Gabriel Almeida de Sousa",date:"2026-01-08"},
  {id:"e-2",type:"income",category:"Salário FGL Brasil",amount:1800,description:"PIX FGL Brasil Terceirização",date:"2026-01-09"},
  {id:"e-3",type:"income",category:"Contratos / Instalações",amount:219.72,description:"PIX FGL Brasil Terceirização",date:"2026-01-17"},
  {id:"e-4",type:"income",category:"Contratos / Instalações",amount:152.56,description:"PIX c6 Grupo FGL Brasil",date:"2026-01-17"},
  {id:"e-5",type:"income",category:"Outras receitas",amount:225,description:"PIX Felipe Almeida de Sousa",date:"2026-01-29"},
  {id:"e-6",type:"income",category:"Outras receitas",amount:200,description:"PIX Felipe Almeida de Sousa",date:"2026-01-29"},
  {id:"e-7",type:"income",category:"Outras receitas",amount:50.43,description:"PIX Julia Marques Pereira Lima",date:"2026-01-30"},
  {id:"e-8",type:"expense",category:"Combustível",amount:10,description:"Estac Trevo São Paulo",date:"2026-01-02"},
  {id:"e-9",type:"expense",category:"Combustível",amount:15,description:"Trevo Barueri",date:"2026-01-07"},
  {id:"e-10",type:"expense",category:"Outras despesas",amount:20,description:"PIX Luiz Carlos Fermiano",date:"2026-01-07"},
  {id:"e-11",type:"expense",category:"Outras despesas",amount:35,description:"PIX Cesar Julio Oliveira",date:"2026-01-09"},
  {id:"e-12",type:"expense",category:"Lazer",amount:94.8,description:"Shopping Iguatemi Alphaville",date:"2026-01-10"},
  {id:"e-13",type:"expense",category:"Alimentação",amount:57.81,description:"Supermercado Super Ci",date:"2026-01-11"},
  {id:"e-14",type:"expense",category:"Internet VIVO",amount:59,description:"VIVO-SP",date:"2026-01-20"},
  {id:"e-15",type:"expense",category:"Alimentação",amount:22.4,description:"Esquina do Pão Padaria",date:"2026-01-20"},
  {id:"e-16",type:"expense",category:"Outras despesas",amount:64.2,description:"PIX Gabriel Almeida de Sousa",date:"2026-01-21"},
  {id:"e-17",type:"expense",category:"Alimentação",amount:36,description:"Cheio Di Recheio Barueri",date:"2026-01-23"},
  {id:"e-18",type:"expense",category:"Outras despesas",amount:60,description:"PIX Cesar Julio Oliveira",date:"2026-01-24"},
  {id:"e-19",type:"expense",category:"Corte Cabelo",amount:37,description:"Fujimoto Osasco",date:"2026-01-24"},
  {id:"e-20",type:"expense",category:"Combustível",amount:142.93,description:"Posto Portal Estrela D Barueri",date:"2026-01-25"},
  {id:"e-21",type:"expense",category:"Assinaturas",amount:22.42,description:"ByteDance Brasil (TikTok)",date:"2026-01-25"},
  {id:"e-22",type:"expense",category:"Assinaturas",amount:23.9,description:"Spotify",date:"2026-01-26"},
  {id:"e-23",type:"expense",category:"Assinaturas",amount:10,description:"Seguro Conta C6",date:"2026-01-28"},
  {id:"e-24",type:"expense",category:"Alimentação",amount:242.8,description:"Casualealimeireli São Paulo",date:"2026-01-29"},
  {id:"e-25",type:"expense",category:"Assinaturas",amount:39.72,description:"PIX Marketplace",date:"2026-01-30"},
  {id:"e-26",type:"expense",category:"Combustível",amount:61.14,description:"Posto Portal Estrela D Barueri",date:"2026-01-31"},
  // ===== FEVEREIRO 2026 =====
  {id:"e-27",type:"income",category:"Outras receitas",amount:80,description:"PIX Gabriel Almeida de Sousa",date:"2026-02-02"},
  {id:"e-28",type:"income",category:"Contratos / Instalações",amount:200,description:"PIX Recebido",date:"2026-02-07"},
  {id:"e-29",type:"income",category:"Contratos / Instalações",amount:750,description:"PIX Recebido",date:"2026-02-07"},
  {id:"e-30",type:"income",category:"Outras receitas",amount:100,description:"PIX Julia Marques Pereira Lima",date:"2026-02-11"},
  {id:"e-31",type:"income",category:"Contratos / Instalações",amount:180,description:"PIX Felipe Almeida de Sousa",date:"2026-02-16"},
  {id:"e-32",type:"income",category:"Salário FGL Brasil",amount:880.9,description:"PIX c6 Grupo FGL Brasil",date:"2026-02-17"},
  {id:"e-33",type:"income",category:"Outras receitas",amount:150,description:"PIX Felipe Almeida de Sousa",date:"2026-02-26"},
  {id:"e-34",type:"income",category:"Outras receitas",amount:100,description:"PIX Felipe Almeida de Sousa",date:"2026-02-26"},
  {id:"e-35",type:"expense",category:"Outras despesas",amount:14,description:"PIX Julia Marques Pereira Lima",date:"2026-02-06"},
  {id:"e-36",type:"expense",category:"Corte Cabelo",amount:19,description:"Fujimoto Osasco",date:"2026-02-07"},
  {id:"e-37",type:"expense",category:"Assinaturas",amount:129.9,description:"PIX Marketplace",date:"2026-02-10"},
  {id:"e-38",type:"expense",category:"Outras despesas",amount:20,description:"PIX João Pedro Baccarin",date:"2026-02-11"},
  {id:"e-39",type:"expense",category:"Outras despesas",amount:70,description:"PIX Cesar Julio Oliveira",date:"2026-02-12"},
  {id:"e-40",type:"expense",category:"Combustível",amount:9.4,description:"Itapevi São Bernardo",date:"2026-02-13"},
  {id:"e-41",type:"expense",category:"Combustível",amount:7.1,description:"Rodovias Rota SP",date:"2026-02-13"},
  {id:"e-42",type:"expense",category:"Lazer",amount:180,description:"Lagoinha Alphaville Barueri",date:"2026-02-14"},
  {id:"e-43",type:"expense",category:"Combustível",amount:30,description:"Rotondo Auto Posto",date:"2026-02-14"},
  {id:"e-44",type:"expense",category:"Internet VIVO",amount:59,description:"TELEFONICA BRAS",date:"2026-02-16"},
  {id:"e-45",type:"expense",category:"Combustível",amount:50,description:"Posto Portal Estrela D Barueri",date:"2026-02-17"},
  {id:"e-46",type:"expense",category:"Alimentação",amount:32.98,description:"Nutricar Santana de Pa",date:"2026-02-17"},
  {id:"e-47",type:"expense",category:"Combustível",amount:120,description:"Posto Portal Estrela D Barueri",date:"2026-02-21"},
  {id:"e-48",type:"expense",category:"Assinaturas",amount:50.32,description:"AIBR Instituição de Pagamento",date:"2026-02-24"},
  {id:"e-49",type:"expense",category:"Outras despesas",amount:35,description:"PIX Cesar Julio Oliveira",date:"2026-02-25"},
  {id:"e-50",type:"expense",category:"Assinaturas",amount:23.9,description:"Spotify",date:"2026-02-26"},
  {id:"e-51",type:"expense",category:"Combustível",amount:20,description:"Auto Posto Verissimo Jandira",date:"2026-02-26"},
  {id:"e-52",type:"expense",category:"Lazer",amount:101.9,description:"MCF Marginal Chácara F",date:"2026-02-26"},
  {id:"e-53",type:"expense",category:"Combustível",amount:3.5,description:"Rodoanel Pedágio Barueri",date:"2026-02-26"},
  {id:"e-54",type:"expense",category:"Assinaturas",amount:10,description:"Seguro Conta C6",date:"2026-02-28"},
  // ===== MARÇO 2026 =====
  {id:"e-55",type:"income",category:"Salário FGL Brasil",amount:1500,description:"PIX FGL Brasil Terceirização",date:"2026-03-09"},
  {id:"e-56",type:"income",category:"Outras receitas",amount:330.04,description:"CDB C6 retorno",date:"2026-03-12"},
  {id:"e-57",type:"income",category:"Outras receitas",amount:22,description:"PIX Julia Marques Pereira Lima",date:"2026-03-12"},
  {id:"e-58",type:"income",category:"Outras receitas",amount:46.41,description:"PIX Felipe Almeida de Sousa",date:"2026-03-17"},
  {id:"e-59",type:"income",category:"Outras receitas",amount:32.66,description:"PIX Felipe Almeida de Sousa",date:"2026-03-20"},
  {id:"e-60",type:"income",category:"Contratos / Instalações",amount:500,description:"PIX FGL Brasil Terceirização",date:"2026-03-30"},
  {id:"e-61",type:"income",category:"Outras receitas",amount:115.4,description:"Devolução PIX Adriana Almeida",date:"2026-03-30"},
  {id:"e-62",type:"expense",category:"Assinaturas",amount:34.9,description:"PIX Marketplace",date:"2026-03-02"},
  {id:"e-63",type:"expense",category:"Assinaturas",amount:40,description:"Google Brasil Internet",date:"2026-03-04"},
  {id:"e-64",type:"expense",category:"Assinaturas",amount:33,description:"Facebook Serviços Online Brasil",date:"2026-03-06"},
  {id:"e-65",type:"expense",category:"Outras despesas",amount:88.12,description:"PIX Gabriel Almeida de Sousa",date:"2026-03-09"},
  {id:"e-66",type:"expense",category:"Assinaturas",amount:299.89,description:"CAKTO PAY",date:"2026-03-09"},
  {id:"e-67",type:"investment",category:"CDB / Reserva",amount:330,description:"CDB C6 Lim. Garant.",date:"2026-03-09",fromCategory:"Salário FGL Brasil"},
  {id:"e-68",type:"expense",category:"Outras despesas",amount:16,description:"PIX Julia Marques Pereira Lima",date:"2026-03-10"},
  {id:"e-69",type:"expense",category:"Corte Cabelo",amount:35,description:"David Figueiredo Barueri",date:"2026-03-12"},
  {id:"e-70",type:"expense",category:"Corte Cabelo",amount:22,description:"David Figueiredo Barueri",date:"2026-03-12"},
  {id:"e-71",type:"expense",category:"Outras despesas",amount:20,description:"M4 Produtos e Serviços",date:"2026-03-13"},
  {id:"e-72",type:"expense",category:"Outras despesas",amount:40,description:"PIX Felipe Almeida de Sousa",date:"2026-03-16"},
  {id:"e-73",type:"expense",category:"Combustível",amount:154.01,description:"Posto Portal Estrela D Barueri",date:"2026-03-20"},
  {id:"e-74",type:"expense",category:"Lazer",amount:129.99,description:"Decathlon Barueri",date:"2026-03-20"},
  {id:"e-75",type:"expense",category:"Outras despesas",amount:12,description:"PIX Julia Marques Pereira Lima",date:"2026-03-24"},
  {id:"e-76",type:"expense",category:"Outras despesas",amount:3,description:"PIX Gabriel Almeida de Sousa",date:"2026-03-25"},
  {id:"e-77",type:"expense",category:"Assinaturas",amount:10,description:"Seguro Conta C6",date:"2026-03-28"},
  {id:"e-78",type:"expense",category:"Outras despesas",amount:115.4,description:"PIX Adriana Almeida Souza",date:"2026-03-30"},
  {id:"e-79",type:"expense",category:"Outras despesas",amount:130,description:"PIX Gabriel Almeida de Sousa",date:"2026-03-30"},
  {id:"e-80",type:"expense",category:"Assinaturas",amount:23.9,description:"Spotify",date:"2026-03-30"},
  // ===== ABRIL 2026 =====
  {id:"e-81",type:"income",category:"Contratos / Instalações",amount:100,description:"PIX Felipe Rama Bezerra",date:"2026-04-05"},
  {id:"e-82",type:"income",category:"Outras receitas",amount:50,description:"PIX Julia Marques Pereira Lima",date:"2026-04-06"},
  {id:"e-83",type:"income",category:"Contratos / Instalações",amount:350,description:"PIX Felipe Almeida de Sousa",date:"2026-04-09"},
  {id:"e-84",type:"income",category:"Contratos / Instalações",amount:40,description:"PIX FGL Brasil Terceirização",date:"2026-04-15"},
  {id:"e-85",type:"income",category:"Outras receitas",amount:60,description:"PIX Gabriel Almeida de Sousa",date:"2026-04-16"},
  {id:"e-86",type:"income",category:"Outras receitas",amount:25,description:"PIX Julia Marques Pereira Lima",date:"2026-04-19"},
  {id:"e-87",type:"income",category:"Outras receitas",amount:100,description:"PIX Felipe Almeida de Sousa",date:"2026-04-26"},
  {id:"e-88",type:"income",category:"Outras receitas",amount:117.12,description:"PIX Gabriel Almeida de Sousa",date:"2026-04-26"},
  {id:"e-89",type:"income",category:"Outras receitas",amount:50,description:"PIX Julia Marques Pereira Lima",date:"2026-04-30"},
  {id:"e-90",type:"expense",category:"Outras despesas",amount:70,description:"PIX Cesar Julio Oliveira",date:"2026-04-01"},
  {id:"e-91",type:"expense",category:"Combustível",amount:19.02,description:"Posto Portal Estrela D Barueri",date:"2026-04-01"},
  {id:"e-92",type:"expense",category:"Alimentação",amount:101.85,description:"Arcos Dourados (McDonald's)",date:"2026-04-01"},
  {id:"e-93",type:"expense",category:"Assinaturas",amount:27,description:"NU Pagamentos",date:"2026-04-04"},
  {id:"e-94",type:"expense",category:"Outras despesas",amount:13,description:"PIX Charlie Rama",date:"2026-04-05"},
  {id:"e-95",type:"expense",category:"Assinaturas",amount:102.8,description:"ZOOP Brasil",date:"2026-04-06"},
  {id:"e-96",type:"expense",category:"Outras despesas",amount:5,description:"PIX Guilherme Vinicius",date:"2026-04-07"},
  {id:"e-97",type:"expense",category:"Outras despesas",amount:25,description:"PIX Gabriel Almeida de Sousa",date:"2026-04-09"},
  {id:"e-98",type:"expense",category:"Assinaturas",amount:19.5,description:"Mastercomm Marketing",date:"2026-04-10"},
  {id:"e-99",type:"expense",category:"Assinaturas",amount:30,description:"Facebook Serviços Online Brasil",date:"2026-04-10"},
  {id:"e-100",type:"expense",category:"Alimentação",amount:34.96,description:"Supermercado Fátima Jandira",date:"2026-04-11"},
  {id:"e-101",type:"expense",category:"Combustível",amount:75.74,description:"Posto Portal Estrela D Barueri",date:"2026-04-12"},
  {id:"e-102",type:"expense",category:"Assinaturas",amount:40,description:"NIC.BR",date:"2026-04-13"},
  {id:"e-103",type:"expense",category:"Outras despesas",amount:28,description:"PIX Julia Marques Pereira Lima",date:"2026-04-14"},
  {id:"e-104",type:"expense",category:"Alimentação",amount:13.99,description:"Nutricar Santana de Pa",date:"2026-04-15"},
  {id:"e-105",type:"expense",category:"Combustível",amount:114.55,description:"Posto Portal Estrela D Barueri",date:"2026-04-15"},
  {id:"e-106",type:"expense",category:"Combustível",amount:77.68,description:"Posto Portal Estrela D Barueri",date:"2026-04-19"},
  {id:"e-107",type:"expense",category:"Outras despesas",amount:20,description:"PIX Jhenifer Martins da Silva",date:"2026-04-21"},
  {id:"e-108",type:"expense",category:"Outras despesas",amount:10,description:"PIX Solange da Conceição",date:"2026-04-21"},
  {id:"e-109",type:"expense",category:"Corte Cabelo",amount:5,description:"Fujimoto Osasco",date:"2026-04-25"},
  {id:"e-110",type:"expense",category:"Combustível",amount:97.12,description:"Posto Portal Estrela D Barueri",date:"2026-04-26"},
  {id:"e-111",type:"expense",category:"Assinaturas",amount:23.9,description:"Spotify",date:"2026-04-26"},
  {id:"e-112",type:"expense",category:"Combustível",amount:37.8,description:"Posto Portal Estrela D Barueri",date:"2026-04-26"},
  {id:"e-113",type:"expense",category:"Assinaturas",amount:10,description:"Seguro Conta C6",date:"2026-04-28"},
  {id:"e-114",type:"expense",category:"Alimentação",amount:18.12,description:"Supermercado Fátima Jandira",date:"2026-04-28"},
  {id:"e-115",type:"expense",category:"Combustível",amount:50,description:"Posto Paraná São Paulo",date:"2026-04-30"},
  // ===== MAIO 2026 =====
  {id:"e-116",type:"income",category:"Outras receitas",amount:69.9,description:"PIX Felipe Almeida de Sousa",date:"2026-05-02"},
  {id:"e-117",type:"income",category:"Outras receitas",amount:70,description:"PIX Felipe Almeida de Sousa",date:"2026-05-02"},
  {id:"e-118",type:"income",category:"Outras receitas",amount:30,description:"PIX Felipe Almeida de Sousa",date:"2026-05-02"},
  {id:"e-119",type:"income",category:"Outras receitas",amount:100,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-02"},
  {id:"e-120",type:"income",category:"Outras receitas",amount:13,description:"PIX Julia Marques Pereira Lima",date:"2026-05-02"},
  {id:"e-121",type:"income",category:"Outras receitas",amount:330,description:"PIX Felipe Almeida de Sousa",date:"2026-05-07"},
  {id:"e-122",type:"income",category:"Outras receitas",amount:300,description:"PIX Felipe Almeida de Sousa",date:"2026-05-11"},
  {id:"e-123",type:"income",category:"Outras receitas",amount:100,description:"PIX Felipe Almeida de Sousa",date:"2026-05-16"},
  {id:"e-124",type:"income",category:"Outras receitas",amount:174.2,description:"PIX Felipe Almeida de Sousa",date:"2026-05-21"},
  {id:"e-125",type:"income",category:"Outras receitas",amount:40.82,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-24"},
  {id:"e-126",type:"income",category:"Outras receitas",amount:23.9,description:"PIX Felipe Almeida de Sousa",date:"2026-05-26"},
  {id:"e-127",type:"income",category:"Outras receitas",amount:45,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-30"},
  {id:"e-128",type:"income",category:"Outras receitas",amount:35,description:"PIX Felipe Rama Bezerra",date:"2026-05-30"},
  {id:"e-129",type:"income",category:"Outras receitas",amount:50,description:"PIX Felipe Almeida de Sousa",date:"2026-05-30"},
  {id:"e-130",type:"expense",category:"Combustível",amount:164.99,description:"Posto Portal Estrela D Barueri",date:"2026-05-02"},
  {id:"e-131",type:"expense",category:"Outras despesas",amount:15,description:"PIX Lucas Davi Almeida",date:"2026-05-02"},
  {id:"e-132",type:"expense",category:"Outras despesas",amount:90.51,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-07"},
  {id:"e-133",type:"expense",category:"Lazer",amount:20,description:"Altitude Alphaville Barueri",date:"2026-05-08"},
  {id:"e-134",type:"expense",category:"Outras despesas",amount:20,description:"PIX Fabiana Aparecida Martins",date:"2026-05-09"},
  {id:"e-135",type:"expense",category:"Lazer",amount:20,description:"Circuit Park Barueri",date:"2026-05-09"},
  {id:"e-136",type:"expense",category:"Combustível",amount:97.87,description:"Posto Portal Estrela D Barueri",date:"2026-05-09"},
  {id:"e-137",type:"expense",category:"Combustível",amount:34.85,description:"Posto Portal Estrela D Barueri",date:"2026-05-09"},
  {id:"e-138",type:"expense",category:"Combustível",amount:53.85,description:"Posto Setee Barueri",date:"2026-05-11"},
  {id:"e-139",type:"expense",category:"Outras despesas",amount:69.5,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-13"},
  {id:"e-140",type:"expense",category:"Combustível",amount:44.03,description:"Posto Portal Estrela D Barueri",date:"2026-05-14"},
  {id:"e-141",type:"expense",category:"Outras despesas",amount:35,description:"PIX Cesar Julio Oliveira",date:"2026-05-14"},
  {id:"e-142",type:"expense",category:"Outras despesas",amount:37,description:"PIX Adriana de Almeida Souza",date:"2026-05-14"},
  {id:"e-143",type:"expense",category:"Combustível",amount:20.76,description:"Posto Portal Estrela D Barueri",date:"2026-05-16"},
  {id:"e-144",type:"expense",category:"Outras despesas",amount:42.71,description:"PIX Gabriel Almeida de Sousa",date:"2026-05-21"},
  {id:"e-145",type:"expense",category:"Combustível",amount:40.82,description:"Posto Portal Estrela D Barueri",date:"2026-05-24"},
  {id:"e-146",type:"expense",category:"Outras despesas",amount:50,description:"PIX Julia Marques Pereira Lima",date:"2026-05-24"},
  {id:"e-147",type:"expense",category:"Combustível",amount:44.91,description:"Posto Portal Estrela D Barueri",date:"2026-05-24"},
  {id:"e-148",type:"expense",category:"Outras despesas",amount:20,description:"PIX Matheus Soares de Lima",date:"2026-05-24"},
  {id:"e-149",type:"expense",category:"Assinaturas",amount:23.9,description:"Spotify",date:"2026-05-26"},
  {id:"e-150",type:"expense",category:"Alimentação",amount:7.8,description:"Café São Jorge Barueri",date:"2026-05-26"},
  {id:"e-151",type:"expense",category:"Assinaturas",amount:10,description:"Seguro Conta C6",date:"2026-05-28"},
  {id:"e-152",type:"expense",category:"Outras despesas",amount:6.56,description:"Ministério da Defesa - Fundo Militar",date:"2026-05-28"},
  {id:"e-153",type:"expense",category:"Lazer",amount:10,description:"J Park Jandira",date:"2026-05-28"},
  {id:"e-154",type:"expense",category:"Combustível",amount:112.59,description:"Posto Portal Estrela D Barueri",date:"2026-05-29"},
  {id:"e-155",type:"expense",category:"Alimentação",amount:8,description:"Burger King Largo 13",date:"2026-05-30"},
  {id:"e-156",type:"expense",category:"Alimentação",amount:21.96,description:"ASSB Comércio Varejista",date:"2026-05-30"},
  {id:"e-157",type:"expense",category:"Combustível",amount:38.49,description:"Posto Portal Estrela D Barueri",date:"2026-05-30"},
  {id:"e-158",type:"expense",category:"Combustível",amount:41.45,description:"Posto Portal Estrela D Barueri",date:"2026-05-31"},
  // ===== JUNHO 2026 =====
  {id:"e-159",type:"income",category:"Outras receitas",amount:56.45,description:"PIX Julia Marques Pereira Lima",date:"2026-06-01"},
  {id:"e-160",type:"income",category:"Outras receitas",amount:50,description:"PIX Julia Marques Pereira Lima",date:"2026-06-06"},
  {id:"e-161",type:"income",category:"Outras receitas",amount:70,description:"PIX Erika Almeida Marques",date:"2026-06-06"},
  {id:"e-162",type:"income",category:"Outras receitas",amount:300,description:"PIX Felipe Almeida de Sousa",date:"2026-06-06"},
  {id:"e-163",type:"income",category:"Outras receitas",amount:64.84,description:"PIX Gabriel Almeida de Sousa",date:"2026-06-06"},
  {id:"e-164",type:"income",category:"Outras receitas",amount:30,description:"PIX Julia Marques Pereira Lima",date:"2026-06-08"},
  {id:"e-165",type:"income",category:"Outras receitas",amount:25,description:"PIX Gabriel Almeida de Sousa",date:"2026-06-13"},
  {id:"e-166",type:"income",category:"Outras receitas",amount:37.01,description:"PIX Julia Marques Pereira Lima",date:"2026-06-14"},
  {id:"e-167",type:"income",category:"Outras receitas",amount:330,description:"PIX Felipe Almeida de Sousa",date:"2026-06-16"},
  {id:"e-168",type:"income",category:"Outras receitas",amount:40,description:"PIX Adriana de Almeida Souza",date:"2026-06-17"},
  {id:"e-169",type:"income",category:"Outras receitas",amount:26.61,description:"PIX Gabriel Almeida de Sousa",date:"2026-06-21"},
  {id:"e-170",type:"income",category:"Outras receitas",amount:30,description:"PIX Julia Marques Pereira Lima",date:"2026-06-22"},
  {id:"e-171",type:"income",category:"Outras receitas",amount:35,description:"PIX Felipe Almeida de Sousa",date:"2026-06-25"},
  {id:"e-172",type:"income",category:"Outras receitas",amount:150,description:"PIX Felipe Almeida de Sousa",date:"2026-06-28"},
  {id:"e-173",type:"expense",category:"Assinaturas",amount:29.99,description:"NU Pagamentos",date:"2026-06-02"},
  {id:"e-174",type:"expense",category:"Alimentação",amount:92.2,description:"Giga Atacado São Paulo",date:"2026-06-06"},
  {id:"e-175",type:"expense",category:"Assinaturas",amount:46.85,description:"NU Pagamentos",date:"2026-06-06"},
  {id:"e-176",type:"expense",category:"Outras despesas",amount:30,description:"PIX Julia Marques Pereira Lima",date:"2026-06-06"},
  {id:"e-177",type:"expense",category:"Outras despesas",amount:20,description:"PIX Stephanie Cristina Antunes",date:"2026-06-06"},
  {id:"e-178",type:"expense",category:"Combustível",amount:44.47,description:"Posto Portal Estrela D Barueri",date:"2026-06-06"},
  {id:"e-179",type:"expense",category:"Combustível",amount:26.23,description:"Posto Portal Estrela D Barueri",date:"2026-06-07"},
  {id:"e-180",type:"expense",category:"Lazer",amount:44.9,description:"Love For Sweet Barueri",date:"2026-06-07"},
  {id:"e-181",type:"expense",category:"Combustível",amount:52.08,description:"Posto Portal Estrela D Barueri",date:"2026-06-07"},
  {id:"e-182",type:"expense",category:"Saúde",amount:79.9,description:"PIX Adriana de Almeida Souza",date:"2026-06-09"},
  {id:"e-183",type:"expense",category:"Alimentação",amount:27.99,description:"Nutricar Santana de Pa",date:"2026-06-12"},
  {id:"e-184",type:"expense",category:"Outras despesas",amount:25,description:"MP Simonedepaula Osasco",date:"2026-06-12"},
  {id:"e-185",type:"expense",category:"Outras despesas",amount:40,description:"PIX Vanessa Cristini Malaquias",date:"2026-06-13"},
  {id:"e-186",type:"expense",category:"Outras despesas",amount:75,description:"PIX Cesar Julio Oliveira",date:"2026-06-19"},
  {id:"e-187",type:"expense",category:"Combustível",amount:34.09,description:"Posto Portal Estrela D Barueri",date:"2026-06-19"},
  {id:"e-188",type:"expense",category:"Combustível",amount:55.29,description:"Posto Portal Estrela D Barueri",date:"2026-06-20"},
  {id:"e-189",type:"expense",category:"Lazer",amount:26,description:"NSR Shake Cotia",date:"2026-06-21"},
  {id:"e-190",type:"expense",category:"Combustível",amount:44.28,description:"Posto Portal Estrela D Barueri",date:"2026-06-21"},
  {id:"e-191",type:"expense",category:"Lazer",amount:26,description:"Condomínio Alphaville Barueri",date:"2026-06-22"},
  {id:"e-192",type:"expense",category:"Combustível",amount:52.96,description:"Posto Portal Estrela D Barueri",date:"2026-06-26"},
  {id:"e-193",type:"expense",category:"Saúde",amount:54.88,description:"Drogaria Henrique Barueri",date:"2026-06-26"},
  {id:"e-194",type:"expense",category:"Combustível",amount:69.02,description:"Posto Portal Estrela D Barueri",date:"2026-06-28"},
  // ===== JULHO 2026 =====
  {id:"e-195",type:"income",category:"Outras receitas",amount:37.73,description:"PIX Felipe Almeida de Sousa",date:"2026-07-02"},
  {id:"e-196",type:"income",category:"Outras receitas",amount:55,description:"PIX Felipe Almeida de Sousa",date:"2026-07-06"},
  {id:"e-197",type:"income",category:"Salário FGL Brasil",amount:348.63,description:"PIX FGL Brasil Terceirização",date:"2026-07-10"},
  {id:"e-198",type:"income",category:"Outras receitas",amount:693.41,description:"PIX Felipe Almeida de Sousa",date:"2026-07-13"},
  {id:"e-199",type:"income",category:"Outras receitas",amount:95.02,description:"PIX Julia Marques Pereira Lima",date:"2026-07-21"},
  {id:"e-200",type:"income",category:"Outras receitas",amount:9344.55,description:"PIX Felipe Almeida de Sousa (aporte C6)",date:"2026-07-21"},
  {id:"e-201",type:"income",category:"TikTok Shop",amount:27.04,description:"Bytedance Brasil (TikTok Shop)",date:"2026-07-24"},
  {id:"e-202",type:"income",category:"TikTok Shop",amount:15.69,description:"Bytedance Brasil (TikTok Shop)",date:"2026-07-29"},
  {id:"e-203",type:"expense",category:"Internet VIVO",amount:65.56,description:"TELEFONICA BRAS",date:"2026-07-02"},
  {id:"e-204",type:"expense",category:"Alimentação",amount:7.99,description:"Nutricar Santana de Pa",date:"2026-07-04"},
  {id:"e-205",type:"expense",category:"Lazer",amount:14,description:"Nilson Nunes Cotia",date:"2026-07-11"},
  {id:"e-206",type:"expense",category:"Lazer",amount:77.98,description:"MP Mary Kay Grazi Cotia",date:"2026-07-11"},
  {id:"e-207",type:"expense",category:"Outras despesas",amount:89.51,description:"PIX Julia Marques Pereira Lima",date:"2026-07-16"},
  {id:"e-208",type:"expense",category:"Assinaturas",amount:57,description:"DM Instituição de Pagamento",date:"2026-07-16"},
  {id:"e-209",type:"expense",category:"Outras despesas",amount:20,description:"PIX Andreza Leandra Martins",date:"2026-07-18"},
  {id:"e-210",type:"expense",category:"Alimentação",amount:95.2,description:"EHW Comércio de Alimentos Barueri",date:"2026-07-18"},
  {id:"e-211",type:"expense",category:"Alimentação",amount:22.91,description:"C&M Caminho Doce Tambo Barueri",date:"2026-07-18"},
  {id:"e-212",type:"expense",category:"Outras despesas",amount:10,description:"Tecno Machine Comércio Jandira",date:"2026-07-18"},
  {id:"e-213",type:"investment",category:"CDB / Reserva",amount:9344,description:"CDB C6 Lim. Garant.",date:"2026-07-21",fromCategory:"Outras receitas"},
  {id:"e-214",type:"expense",category:"Outras despesas",amount:59.31,description:"PIX Gabriel Almeida de Sousa",date:"2026-07-23"},
  {id:"e-215",type:"expense",category:"Lazer",amount:35,description:"Eliana Lopes São Bernardo",date:"2026-07-25"},
  {id:"e-216",type:"expense",category:"Alimentação",amount:7,description:"Pastel do Padre São Paulo",date:"2026-07-25"},
  {id:"e-217",type:"expense",category:"Lazer",amount:20,description:"Bruno Martins São Paulo",date:"2026-07-25"},
  {id:"e-218",type:"expense",category:"Lazer",amount:36,description:"Taghriddib Guarulhos",date:"2026-07-25"},
  {id:"e-219",type:"expense",category:"Outras despesas",amount:42.72,description:"PIX Gabriel Almeida de Sousa",date:"2026-07-27"},
  {id:"e-220",type:"expense",category:"Lazer",amount:81.47,description:"Lagoinha Alphaville",date:"2026-07-29"},
  {id:"e-221",type:"expense",category:"Outras despesas",amount:47,description:"Paulo Sergio Xavier São Paulo",date:"2026-07-31"},
  // ===== AGOSTO 2026 =====
  {id:"e-222",type:"income",category:"Outras receitas",amount:60,description:"PIX Felipe Almeida de Sousa",date:"2026-08-01"},
  {id:"e-223",type:"income",category:"Outras receitas",amount:75.98,description:"PIX c6 Gabriel Almeida de Sousa",date:"2026-08-01"},
  {id:"e-224",type:"income",category:"Outras receitas",amount:960.10,description:"PIX Felipe Almeida de Sousa",date:"2026-08-04"},
  {id:"e-225",type:"income",category:"TikTok Shop",amount:101.91,description:"Bytedance Brasil (TikTok Shop)",date:"2026-08-05"},
  {id:"e-226",type:"income",category:"Outras receitas",amount:50,description:"PIX c6 Gabriel Almeida de Sousa",date:"2026-08-07"},
  {id:"e-227",type:"income",category:"TikTok Shop",amount:237.13,description:"Bytedance Brasil (TikTok Shop)",date:"2026-08-12"},
  {id:"e-228",type:"income",category:"Outras receitas",amount:100,description:"PIX Felipe Almeida de Sousa",date:"2026-08-14"},
  {id:"e-229",type:"income",category:"Contratos / Instalações",amount:893.06,description:"PIX Felipe Almeida de Sousa (contrato)",date:"2026-08-17"},
  {id:"e-230",type:"income",category:"TikTok Shop",amount:386.80,description:"Bytedance Brasil (TikTok Shop)",date:"2026-08-19"},
  {id:"e-231",type:"income",category:"Outras receitas",amount:568.58,description:"PIX Felipe Almeida de Sousa",date:"2026-08-19"},
  {id:"e-232",type:"expense",category:"Combustível",amount:151.96,description:"Posto Portal Estrela D Barueri",date:"2026-08-01"},
  {id:"e-233",type:"expense",category:"Outras despesas",amount:11.98,description:"Ferreira Aoki Osasco",date:"2026-08-02"},
  {id:"e-234",type:"investment",category:"CDB / Reserva",amount:540,description:"CDB C6 Lim. Garant.",date:"2026-08-04",fromCategory:"Outras receitas"},
  {id:"e-235",type:"expense",category:"Assinaturas",amount:18,description:"Luciana Aparecida Cruz Barueri",date:"2026-08-05"},
  {id:"e-236",type:"expense",category:"Combustível",amount:123.80,description:"Auto Posto do Golf Jandira",date:"2026-08-06"},
  {id:"e-237",type:"expense",category:"Outras despesas",amount:8,description:"Mobilicidade Tecnologia",date:"2026-08-07"},
  {id:"e-238",type:"expense",category:"Alimentação",amount:58.9,description:"Aromeu Barueri",date:"2026-08-07"},
  {id:"e-239",type:"expense",category:"Lazer",amount:20.05,description:"Outback Alphaville Barueri",date:"2026-08-07"},
  {id:"e-240",type:"expense",category:"Lazer",amount:176.74,description:"Outback Alphaville Barueri",date:"2026-08-07"},
  {id:"e-241",type:"expense",category:"Combustível",amount:50.39,description:"Posto Portal Estrela D Barueri",date:"2026-08-08"},
  {id:"e-242",type:"expense",category:"Outras despesas",amount:60,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-10"},
  {id:"e-243",type:"expense",category:"Outras despesas",amount:110,description:"PIX Vinicius Loyola Batista",date:"2026-08-15"},
  {id:"e-244",type:"expense",category:"Alimentação",amount:15.98,description:"Supermercado Fátima Jandira",date:"2026-08-15"},
  {id:"e-245",type:"expense",category:"Lazer",amount:20,description:"Festpay Payments São Paulo",date:"2026-08-15"},
  {id:"e-246",type:"expense",category:"Outras despesas",amount:65,description:"PIX Julia Marques Pereira Lima",date:"2026-08-17"},
  {id:"e-247",type:"expense",category:"Alimentação",amount:19,description:"MP Café Yeshua Barueri",date:"2026-08-17"},
  {id:"e-248",type:"investment",category:"CDB / Reserva",amount:540,description:"CDB C6 Lim. Garant.",date:"2026-08-17",fromCategory:"Contratos / Instalações"},
  {id:"e-249",type:"expense",category:"Outras despesas",amount:95,description:"PIX Gabriel Almeida de Sousa",date:"2026-08-18"},
  {id:"e-250",type:"investment",category:"CDB / Reserva",amount:468,description:"CDB C6 Lim. Garant.",date:"2026-08-19",fromCategory:"Outras receitas"},
]

function daysBefore(n: number): string {
  const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]
}
function startOfMonth(): string {
  const d = new Date(); return new Date(d.getFullYear(),d.getMonth(),1).toISOString().split('T')[0]
}

const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  patrimony: INITIAL_PATRIMONY,
  goals: INITIAL_GOALS,

  load: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('niggan-v4')
      if (raw) {
        const data = JSON.parse(raw)
        set({ transactions: data.transactions ?? EXTRATO, patrimony: data.patrimony ?? INITIAL_PATRIMONY, goals: data.goals ?? INITIAL_GOALS })
      } else {
        set({ transactions: EXTRATO, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS })
        get().save({ transactions: EXTRATO, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS })
      }
    } catch { set({ transactions: EXTRATO, patrimony: INITIAL_PATRIMONY, goals: INITIAL_GOALS }) }
  },

  save: (data) => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem('niggan-v4', JSON.stringify(data)) } catch {}
  },

  addTransaction: (tx) => {
    set((state) => {
      const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).substr(2,5)}` }
      const newTxs = [newTx, ...state.transactions]
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  updateTransaction: (id, updates) => {
    set((state) => {
      const newTxs = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  removeTransaction: (id) => {
    set((state) => {
      const newTxs = state.transactions.filter(t => t.id !== id)
      const newState = { transactions: newTxs, patrimony: state.patrimony, goals: state.goals }
      get().save(newState)
      return { transactions: newTxs }
    })
  },

  updatePatrimony: (account, balance) => {
    set((state) => {
      const newPat = state.patrimony.map(p => p.account === account ? { ...p, balance } : p)
      const newState = { transactions: state.transactions, patrimony: newPat, goals: state.goals }
      get().save(newState)
      return { patrimony: newPat }
    })
  },

  updateGoal: (month, actual) => {
    set((state) => {
      const newGoals = state.goals.map(g => g.month === month ? { ...g, actual } : g)
      const newState = { transactions: state.transactions, patrimony: state.patrimony, goals: newGoals }
      get().save(newState)
      return { goals: newGoals }
    })
  },

  // Saldo = entradas - saídas - investimentos
  getBalance: () => get().transactions.reduce((sum, t) => {
    if (t.type === 'income') return sum + t.amount
    return sum - t.amount // expense e investment diminuem saldo
  }, 0),

  getTotalPatrimony: () => get().patrimony.reduce((s,p) => s + p.balance, 0),

  // Cofres: soma APENAS entradas da categoria (investimentos NÃO diminuem)
  getCofreTotal: (category: string) => {
    return get().transactions
      .filter(t => t.type === 'income' && (
        category === 'Entrada'
          ? !['Salário FGL Brasil','Contratos / Instalações','TikTok Shop','Outras receitas'].includes(t.category)
          : t.category === category
      ))
      .reduce((s, t) => s + t.amount, 0)
  },

  getToday: () => {
    const today = new Date().toISOString().split('T')[0]
    const txs = get().transactions.filter(t => t.date === today)
    return {
      income: txs.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t => t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getLast7Days: () => {
    const start = daysBefore(7)
    const txs = get().transactions.filter(t => t.date >= start)
    return {
      income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getThisMonth: () => {
    const now = new Date()
    const txs = get().transactions.filter(t => {
      const d = new Date(t.date+'T12:00:00')
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
    })
    return {
      income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
      expense: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
      investment: txs.filter(t=>t.type==='investment').reduce((s,t)=>s+t.amount,0),
      transactions: txs,
    }
  },

  getByCategory: (days=30) => {
    const start = daysBefore(days)
    const txs = get().transactions.filter(t => t.type==='expense' && t.date>=start)
    const result: Record<string,number> = {}
    txs.forEach(t => { result[t.category] = (result[t.category]||0) + t.amount })
    return result
  },

  getInsights: () => {
    const {transactions: last7} = get().getLast7Days()
    const expenses = last7.filter(t=>t.type==='expense')
    const byCategory = get().getByCategory(7)
    const total7 = expenses.reduce((s,t)=>s+t.amount,0)
    const dailyAverage = total7/7
    const mostSpentCategory = Object.entries(byCategory).sort(([,a],[,b])=>b-a)[0]?.[0] ?? '-'
    const biggestExpense = expenses.length>0 ? expenses.reduce((m,t)=>t.amount>m.amount?t:m,expenses[0]) : null
    return { dailyAverage, projectedMonthly: dailyAverage*30, mostSpentCategory, biggestExpense }
  },
}))

export default useFinanceStore
