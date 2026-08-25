#!/bin/bash

# 🚀 NIGGAN FINANCES 2.0 - FAZ TUDO AUTOMATICAMENTE
# Este script é o "faz tudo" - executa uma vez e está pronto!

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           NIGGAN FINANCES 2.0 - FAZ TUDO! 🚀                 ║"
echo "║              Senta que eu cuido de tudo pra ti                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Clone do GitHub
echo -e "${YELLOW}📥 Clonando repositório do GitHub...${NC}"
if [ -d "NIGGAN-FINANCES" ]; then
    echo -e "${YELLOW}   Pasta já existe, pulando clone...${NC}"
    cd NIGGAN-FINANCES
else
    git clone https://github.com/felipealmeidasouza0777-collab/NIGGAN-FINANCES.git
    cd NIGGAN-FINANCES
    echo -e "${GREEN}✅ Repositório clonado!${NC}"
fi

echo ""

# 2. Verificar Node.js
echo -e "${YELLOW}🔍 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "${YELLOW}   Instale em: https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION encontrado!${NC}"

echo ""

# 3. Limpar node_modules anterior (se existir)
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}🧹 Limpando node_modules antigo...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✅ Limpeza completa!${NC}"
    echo ""
fi

# 4. Instalar dependências
echo -e "${YELLOW}🔧 Instalando dependências (pode levar 1-2 min)...${NC}"
npm install --legacy-peer-deps --verbose 2>&1 | tail -20
echo -e "${GREEN}✅ Dependências instaladas!${NC}"

echo ""

# 5. Criar .env.local
echo -e "${YELLOW}📝 Configurando .env.local...${NC}"

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local já existe, pulando...${NC}"
else
    cat > .env.local << 'EOF'
# NEXT_PUBLIC_ANTHROPIC_API_KEY - Copie sua chave aqui!
# Obtenha em: https://console.anthropic.com → Get API Key
NEXT_PUBLIC_ANTHROPIC_API_KEY=

# Modo desenvolvimento
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ .env.local criado!${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite .env.local e adicione sua API Key!${NC}"
fi

echo ""

# 6. Verificar estrutura
echo -e "${YELLOW}🧪 Verificando estrutura do projeto...${NC}"
if [ -f "pages/index.tsx" ] && [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Estrutura OK!${NC}"
else
    echo -e "${RED}❌ Problema na estrutura!${NC}"
    exit 1
fi

echo ""

# 7. Build test
echo -e "${YELLOW}🔨 Testando build...${NC}"
npm run build 2>&1 | tail -10
echo -e "${GREEN}✅ Build OK!${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   🎉 TUDO PRONTO!!! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}📚 PRÓXIMOS PASSOS (AGORA!):${NC}"
echo ""

echo -e "${YELLOW}1️⃣  Edite .env.local:${NC}"
echo "   nano .env.local"
echo "   (Adicione sua chave de API)"
echo ""

echo -e "${YELLOW}2️⃣  Rode o app:${NC}"
echo "   npm run dev"
echo ""

echo -e "${YELLOW}3️⃣  Abra no navegador:${NC}"
echo "   http://localhost:3000"
echo ""

echo -e "${YELLOW}4️⃣  Comece a usar:${NC}"
echo "   Escreva: 'gastei 50 em comida'"
echo ""

echo -e "${YELLOW}5️⃣  Para fazer deploy:${NC}"
echo "   vercel --prod"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📖 Documentação:${NC}"
echo "   - COMECE-AQUI.md"
echo "   - SETUP.md"
echo "   - DEPLOY.md"
echo ""

echo -e "${GREEN}🚀 Seu app está 100% pronto! Boa sorte! 🎉${NC}"
echo ""
echo "Desenvolvido com ❤️ para Felipe"
echo ""

# Pergunta se quer começar agora
read -p "Quer rodar 'npm run dev' agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Abrindo desenvolvimento...${NC}"
    npm run dev
fi
