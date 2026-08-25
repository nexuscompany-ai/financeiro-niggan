# Niggan Finances 2.0

App de finanças pessoais 100% mobile-first com integração de IA (Mia).

## 🎯 Features

✅ **Mobile First** - Otimizado completamente para celular  
✅ **IA Mia** - Digite transações em linguagem natural  
✅ **TikTok Shop Automático** - Adiciona renda toda quarta-feira  
✅ **Cores Minimalistas** - Branco + Verde Oliva  
✅ **UX Extrema** - Interface intuitiva e rápida  
✅ **Vercel Deploy** - Pronto para produção  
✅ **Integração Total** - API de IA funcionando em tempo real  

## 🚀 Quick Start

### Instalação

```bash
npm install
```

### Configurar variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_aqui
```

### Rodar localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📱 Como Usar

### Escrever Transações para Mia

Simplesmente escreva o que gastou/ganhou:

- "gastei 50 em comida"
- "recebi 1500 de salário"
- "paguei 30 no transporte"
- "ganhei 100 com freelancer"

Mia processa automaticamente e coloca no sistema!

### TikTok Shop Automático

Toda quarta-feira, um modal aparece pedindo o ganho da semana. Basta digitar o valor e confirmar.

## 🏗️ Estrutura do Projeto

```
niggan-improved/
├── pages/
│   ├── _app.tsx          # Layout principal
│   ├── index.tsx         # Dashboard
│   └── api/
│       └── mia.ts        # API da IA
├── components/
│   ├── TransactionInput.tsx   # Campo de entrada
│   ├── BalanceCard.tsx        # Saldo
│   └── TransactionsList.tsx   # Histórico
├── lib/
│   └── store.ts          # Zustand store
├── styles/
│   └── globals.css       # Estilos globais
└── public/               # Assets
```

## 🎨 Cores

- **Branco**: `#FFFFFF`
- **Verde Oliva Escuro**: `#4F4838`
- **Verde Oliva Claro**: `#A89A7E`
- **Neutro**: `#F3F4F6` até `#111827`

## 🔐 Segurança

- API Key guardada no servidor
- Dados armazenados localmente (localStorage)
- Sem conexão externa desnecessária

## 📦 Deploy no Vercel

```bash
npm run build
vercel --prod
```

Ou conecte seu GitHub ao Vercel para CI/CD automático.

## 🔄 API Mia

`POST /api/mia`

Request:
```json
{
  "message": "gastei 50 em comida"
}
```

Response:
```json
{
  "success": true,
  "transaction": {
    "type": "expense",
    "amount": 50,
    "category": "Alimentação",
    "description": "Gasto em comida",
    "date": "2026-08-24",
    "processed": true
  }
}
```

## 🛠️ Desenvolvido com

- **Next.js 14** - Framework React
- **React 18** - UI
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Anthropic API** - IA (Claude)
- **TypeScript** - Type safety
- **date-fns** - Data handling

## 📝 Licença

Privado - Felipe

## 🤝 Suporte

Para issues ou sugestões, abra uma PR no repositório.

---

**Niggan 2.0** - Finanças inteligentes no seu celular 📱✨
