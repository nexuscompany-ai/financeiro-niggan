# Niggan Finances 2.0

App de finanças pessoais 100% mobile-first com interface intuitiva.

## 🎯 Features Principais

✅ **Dashboard** - Saldo em destaque com resumo do dia/mês
✅ **Transações Manuais** - Adicionar entrada/saída facilmente
✅ **Histórico** - Filtros por tipo (Todas, Entradas, Saídas)
✅ **TikTok Shop Automático** - Toda quarta-feira
✅ **Settings** - Export/Import de dados
✅ **Mobile First** - 100% otimizado para celular
✅ **Offline** - Dados salvos localmente

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Rodar desenvolvimento
npm run dev

# 3. Abrir no navegador
http://localhost:3000
```

## 📱 Como Usar

### Adicionar Transação
1. Clique no botão "Saída" ou "Entrada"
2. Digite o valor
3. Escolha a categoria
4. Adicione descrição
5. Clique "Adicionar"

### Filtrar Transações
- Clique em "Todas", "Entradas" ou "Saídas"
- O histórico se atualiza automaticamente

### TikTok Shop
- Toda quarta-feira um modal aparece
- Digite o ganho da semana
- Automático na transações

### Backup de Dados
- Vá em Settings (⚙️)
- Clique "Exportar Dados"
- Arquivo JSON é baixado

## 🛠️ Tech Stack

- **Next.js 14** - Framework React
- **React 18** - UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling mobile-first
- **Zustand** - State management
- **date-fns** - Data handling

## 📦 Estrutura

```
pages/
├── index.tsx      # Dashboard
└── settings.tsx   # Configurações

components/
├── Header.tsx
├── BalanceCard.tsx
├── TransactionInput.tsx
└── TransactionsList.tsx

lib/
├── store.ts       # Zustand store
├── types.ts       # TypeScript types
└── utils.ts       # Funções úteis
```

## 🎨 Cores

- **Branco**: `#FFFFFF`
- **Verde Oliva**: `#6B6347` (principal)
- **Verde Oliva Claro**: `#A89A7E` (acentos)

## 📋 Roadmap (Futuro)

- [ ] Integração com IA (Mia)
- [ ] Análise gráfica de despesas
- [ ] Modo escuro
- [ ] Sincronização na nuvem
- [ ] App nativo (React Native)

## 🔒 Privacidade

✅ Todos os dados armazenados localmente
✅ Sem conexão com servidor (offline-first)
✅ Sem rastreamento
✅ Sem anúncios

## 📄 Licença

Privado - Felipe

---

**Desenvolvido com ❤️ para Felipe**
