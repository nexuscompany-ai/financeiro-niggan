#!/usr/bin/env pwsh

# 🚀 NIGGAN FINANCES 2.0 - SETUP AUTOMÁTICO (PowerShell)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         NIGGAN FINANCES 2.0 - SETUP AUTOMÁTICO                ║" -ForegroundColor Cyan
Write-Host "║                  Deixa eu fazer tudo pra ti! 🚀               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# 2. Extrair arquivo
if (Test-Path "niggan-finances-v2.tar.gz") {
    Write-Host "📦 Descompactando projeto..." -ForegroundColor Yellow
    
    # Usar 7-Zip se disponível
    try {
        & 7z x niggan-finances-v2.tar.gz | Out-Null
        & 7z x niggan-finances-v2.tar -o./ | Out-Null
        Set-Location niggan-improved
        Write-Host "✅ Projeto descompactado!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Não consegui descompactar com 7-Zip" -ForegroundColor Yellow
        Write-Host "   Instale 7-Zip: https://7-zip.org/" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Arquivo niggan-finances-v2.tar.gz não encontrado" -ForegroundColor Yellow
    Write-Host "   Se já descompactou, entre na pasta: cd niggan-improved" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Instalando dependências (npm install)..." -ForegroundColor Yellow

npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "✅ Dependências instaladas!" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Configurando .env.local..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    @"
# Copie sua chave de API aqui:
# NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_aqui
NEXT_PUBLIC_ANTHROPIC_API_KEY=
"@ | Out-File -Encoding UTF8 ".env.local"
    
    Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edite .env.local e adicione sua chave de API" -ForegroundColor Yellow
    Write-Host "   Acesse: https://console.anthropic.com → Get API Key" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local já existe!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Verificando estrutura do projeto..." -ForegroundColor Yellow

if ((Test-Path "pages/index.tsx") -and (Test-Path "package.json")) {
    Write-Host "✅ Projeto está OK!" -ForegroundColor Green
} else {
    Write-Host "❌ Problema na estrutura do projeto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    🎉 SETUP COMPLETO!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📚 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Edite .env.local e adicione sua chave:" -ForegroundColor Yellow
Write-Host "   notepad .env.local" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Rode o app:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Abra no navegador:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Teste Mia (IA):" -ForegroundColor Yellow
Write-Host "   Escreva: 'gastei 50 em comida'" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Para fazer deploy no Vercel:" -ForegroundColor Yellow
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📖 Leia a documentação:" -ForegroundColor Cyan
Write-Host "   - COMECE-AQUI.md (guia rápido)" -ForegroundColor Gray
Write-Host "   - SETUP.md (setup detalhado)" -ForegroundColor Gray
Write-Host "   - DEPLOY.md (deploy no Vercel)" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Seu app está 100% pronto para usar!" -ForegroundColor Green
Write-Host ""
Write-Host "Desenvolvido com ❤️ para Felipe" -ForegroundColor Magenta
Write-Host ""

Read-Host "Pressione Enter para sair"
