# 📋 Guia de Setup Inicial - Niggan Finances 2.0

## ⚡ Quick Start (3 passos)

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar variável de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_aqui
```

**Onde obter a chave:**
1. Acesse https://console.anthropic.com
2. Clique em "Get API Key"
3. Crie uma nova chave
4. Copie e cole aqui

### 3️⃣ Rodar o projeto
```bash
npm run dev
```

Acesse: **http://localhost:3000** 🎉

---

## 🎯 Próximos Passos

### Testar Localmente

1. **Tela Principal**
   - Veja seu saldo atual
   - Histórico de transações

2. **Testar Mia (IA)**
   - Escreva: "gastei 50 em comida"
   - Clique em "Enviar para Mia"
   - Veja a transação ser criada automaticamente ✨

3. **Testar TikTok Shop**
   - Mude a data do computador para quarta-feira (no navegador, simule)
   - Recarregue a página
   - Modal aparecerá pedindo o valor

4. **Explorar Settings**
   - Clique em ⚙️ (canto superior direito)
   - Veja dados, export backup, etc.

### Fazer Deploy

Quando estiver pronto para publicar:

```bash
# Opção 1: Deploy via CLI (rápido)
npm install -g vercel
vercel --prod

# Opção 2: Push para GitHub (automático)
git remote add origin https://github.com/seu-user/NIGGAN-FINANCES.git
git push -u origin main
# Depois conecte no Vercel Dashboard
```

Leia `DEPLOY.md` para detalhes completos.

---

## 📱 Teste no Celular

### Local Network
```bash
# Terminal mostrará:
# ➜  Local:   http://localhost:3000
# ➜  Network: http://192.168.1.XXX:3000
```

Abra o link Network no seu celular!

### Via Vercel (Produção)
Após fazer deploy no Vercel:
- Seu app estará em: `https://seu-projeto.vercel.app`
- Teste via QR Code ou compartilhe o link

---

## 🧪 Exemplos para Testar Mia

Tente essas frases para a IA reconhecer:

**Entradas:**
- "recebi 1500 de salário"
- "ganhei 100 de freelancer"
- "tiktok shop me pagou 50"
- "recebi um contrato de 500"

**Saídas:**
- "gastei 30 no uber"
- "paguei 50 em comida"
- "comprei algo por 100"
- "aluguel 1200"

**Especiais:**
- "entrou 200 de outros"
- "saiu 15 na subscripton"
- "recebi bônus de 300"

---

## 🐛 Troubleshooting

### "API Key not found"
```
❌ Problema: NEXT_PUBLIC_ANTHROPIC_API_KEY não foi configurada

✅ Solução:
1. Crie/verifique arquivo .env.local
2. Adicione: NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave
3. Reinicie: npm run dev
```

### "Mia não responde"
```
❌ Problema: Erro na integração com Claude API

✅ Solução:
1. Verifique sua chave de API no console.anthropic.com
2. Confirme se tem créditos disponíveis
3. Verifique console do navegador (F12) para erros
4. Tente novamente em alguns segundos
```

### "Dados não salvam"
```
❌ Problema: localStorage pode estar desabilitado

✅ Solução:
1. Verifique se cookies/storage estão habilitados
2. Tente em modo anônimo (incógnito)
3. Limpe cache: Ctrl+Shift+Delete
4. Tente em outro navegador
```

### "Erro ao fazer build"
```
❌ Problema: npm run build falha

✅ Solução:
1. Delete pasta node_modules: rm -rf node_modules
2. Limpe cache npm: npm cache clean --force
3. Reinstale: npm install
4. Tente build novamente: npm run build
```

---

## 📚 Estrutura de Pastas Explicada

```
niggan-improved/
├── pages/              # Páginas do app
│   ├── _app.tsx       # Layout global
│   ├── index.tsx      # Dashboard (home)
│   ├── settings.tsx   # Configurações
│   └── api/
│       └── mia.ts     # Endpoint da IA
│
├── components/        # Componentes React reutilizáveis
│   ├── Header.tsx     # Cabeçalho
│   ├── BalanceCard.tsx    # Card de saldo
│   ├── TransactionInput.tsx  # Input para Mia
│   └── TransactionsList.tsx  # Lista de transações
│
├── lib/              # Lógica e utilitários
│   ├── store.ts      # Estado (Zustand)
│   ├── useMia.ts     # Hook para IA
│   ├── types.ts      # Tipos TypeScript
│   └── utils.ts      # Funções utilitárias
│
├── styles/           # CSS global
│   └── globals.css   # Estilos do app
│
└── public/           # Arquivos estáticos
```

---

## 🎨 Customização

### Mudar Cores

Abra `tailwind.config.js` e modifique:

```js
olive: {
  // Cores verde oliva
  500: '#A89A7E',  // ← mude aqui
  700: '#6B6347',
  900: '#3C342A',
}
```

### Mudar Categorias

Abra `lib/types.ts`:

```ts
export const TRANSACTION_CATEGORIES = {
  income: ['Salário', 'TikTok Shop', ...],  // ← customize
  expense: ['Alimentação', 'Transporte', ...],
}
```

### Mudar Dia do TikTok Shop

Abra `pages/index.tsx`:

```ts
const dayOfWeek = today.getDay() // 0=Dom, 3=Qua, 4=Qui
if (dayOfWeek === 3) { ... } // ← mude o número
```

---

## 🔐 Segurança

✅ Dados armazenados localmente (não enviam para servidor)  
✅ API Key guardada no servidor (cliente nunca vê)  
✅ Conexão HTTPS em produção  
✅ Sem cookies de rastreamento  
✅ Sem ads ou coleta de dados  

---

## 💡 Dicas

1. **Backup Regular**
   - Va em Settings → "📊 Exportar Dados"
   - Salve o JSON em lugar seguro

2. **Modo Escuro (futuro)**
   - Já está preparado no CSS
   - Só precisa ativar em tailwind.config.js

3. **Adicione ao Home Screen (iOS/Android)**
   - Chrome: Menu → "Instalar app"
   - Safari: Compartilhar → "Tela de Início"

4. **Sincronizar entre Dispositivos**
   - Futuro: Integrar com banco de dados
   - Atualmente: Use export/import em DEPLOY.md

---

## 📞 Próximos Passos

1. ✅ Teste localmente (`npm run dev`)
2. ✅ Integre sua chave de API
3. ✅ Teste Mia com frases reais
4. ✅ Faça deploy no Vercel
5. ✅ Compartilhe o link com amigos!

---

**Bem-vindo ao Niggan Finances 2.0!** 🚀

Qualquer dúvida, abra uma issue no GitHub ou verifique DEPLOY.md.

---

**Desenvolvido com ❤️ para Felipe**
