#!/bin/bash

# 🚀 NIGGAN FINANCES 2.0 - SCRIPT DE SETUP AUTOMÁTICO
# Este script faz TUDO para você!

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         NIGGAN FINANCES 2.0 - SETUP AUTOMÁTICO                ║"
echo "║                  Deixa eu fazer tudo pra ti! 🚀               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. Extrair arquivo se existir
if [ -f "niggan-finances-v2.tar.gz" ]; then
    echo "📦 Descompactando projeto..."
    tar -xzf niggan-finances-v2.tar.gz
    cd niggan-improved
    echo "✅ Projeto descompactado!"
else
    echo "⚠️  Arquivo niggan-finances-v2.tar.gz não encontrado"
    echo "   Pulando extração..."
fi

echo ""
echo "🔧 Instalando dependências (npm install)..."
npm install --legacy-peer-deps

echo ""
echo "✅ Dependências instaladas!"

echo ""
echo "📝 Configurando .env.local..."

# Criar .env.local com placeholder
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'ENVEOF'
# Copie sua chave de API aqui:
# NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_aqui
NEXT_PUBLIC_ANTHROPIC_API_KEY=
ENVEOF
    echo "✅ Arquivo .env.local criado!"
    echo "⚠️  IMPORTANTE: Edite .env.local e adicione sua chave de API"
    echo "   Acesse: https://console.anthropic.com → Get API Key"
else
    echo "✅ .env.local já existe!"
fi

echo ""
echo "🧪 Verificando estrutura do projeto..."
if [ -f "pages/index.tsx" ] && [ -f "package.json" ]; then
    echo "✅ Projeto está OK!"
else
    echo "❌ Problema na estrutura do projeto"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 SETUP COMPLETO!                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Edite .env.local e adicione sua chave:"
echo "   nano .env.local"
echo "   (ou abra em um editor)"
echo ""
echo "2️⃣  Rode o app:"
echo "   npm run dev"
echo ""
echo "3️⃣  Abra no navegador:"
echo "   http://localhost:3000"
echo ""
echo "4️⃣  Teste Mia (IA):"
echo "   Escreva: 'gastei 50 em comida'"
echo ""
echo "5️⃣  Para fazer deploy no Vercel:"
echo "   vercel --prod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Leia a documentação:"
echo "   - COMECE-AQUI.md (guia rápido)"
echo "   - SETUP.md (setup detalhado)"
echo "   - DEPLOY.md (deploy no Vercel)"
echo ""
echo "🎉 Seu app está 100% pronto para usar!"
echo ""
echo "Desenvolvido com ❤️ para Felipe"
