# 🚀 Guia de Deploy - Niggan Finances

## Deploy no Vercel (Recomendado)

### Opção 1: Deploy Automático via GitHub

1. **Push seu código para GitHub**
```bash
git remote add origin https://github.com/seu-user/NIGGAN-FINANCES.git
git branch -M main
git push -u origin main
```

2. **Conectar Vercel ao GitHub**
   - Acesse https://vercel.com
   - Clique em "Add New..." → "Project"
   - Selecione seu repositório GitHub
   - Clique em "Import"

3. **Configurar variáveis de ambiente**
   - Em "Environment Variables", adicione:
   - Nome: `NEXT_PUBLIC_ANTHROPIC_API_KEY`
   - Valor: Sua chave da Anthropic
   - Clique em "Add"

4. **Deploy**
   - Clique em "Deploy"
   - Vercel fará o build e deploy automaticamente
   - Seu app estará disponível em `https://seu-projeto.vercel.app`

### Opção 2: Deploy via CLI

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Conectar domínio (opcional)**
```bash
vercel env add NEXT_PUBLIC_ANTHROPIC_API_KEY
vercel deploy --prod
```

## Variáveis de Ambiente

### Necessárias

```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_da_api_anthropic
```

### Opcionais

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

## Obter Chave da Anthropic

1. Acesse https://console.anthropic.com
2. Faça login ou crie uma conta
3. Vá para "API Keys"
4. Clique em "Create Key"
5. Copie a chave gerada

## Monitoramento Pós-Deploy

- **Analytics**: https://vercel.com/dashboard
- **Logs**: Vercel Dashboard → seu projeto → "Deployments"
- **Health Checks**: Vercel envia notificações se houver problemas

## Troubleshooting

### Erro: "API key not found"
- Verifique se a variável está em Environment Variables
- Reconstrua o projeto: `vercel rebuild`

### Erro: "Next.js build failed"
- Verifique o console do Vercel para detalhes
- Rode `npm run build` localmente
- Commita as correções e faça push novamente

### Slow Performance
- Abra Vercel Analytics
- Verifique se a API da Anthropic está respondendo
- Considere usar Edge Functions (premium)

## CI/CD Automático

Vercel detecta automaticamente:
- Push para main branch = Deploy automático
- Preview para PRs
- Rollback automático se houver erros

## Domínio Customizado

1. No Vercel Dashboard
2. Seu projeto → "Domains"
3. Adicione seu domínio
4. Configure DNS conforme instruções

## Backup de Dados

Dados são armazenados no localStorage do cliente. Para backup:

1. Abra Settings no app
2. Clique em "📊 Exportar Dados"
3. Arquivo JSON será baixado

## Segurança

✅ HTTPS automático  
✅ Certificado SSL/TLS  
✅ DDoS Protection  
✅ WAF (Web Application Firewall)  
✅ API Key protegida no servidor  

## Atualizações Futuras

Quando fizer mudanças:

```bash
# Desenvolver localmente
git add .
git commit -m "Sua mensagem"
git push origin main

# Vercel fará deploy automaticamente
```

## Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Status Page**: https://www.vercel-status.com
- **Community**: https://github.com/vercel

---

**Seu app está rodando em produção!** 🎉
