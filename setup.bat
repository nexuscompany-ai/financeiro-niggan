@echo off
REM 🚀 NIGGAN FINANCES 2.0 - SETUP AUTOMÁTICO (WINDOWS)

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         NIGGAN FINANCES 2.0 - SETUP AUTOMÁTICO (WINDOWS)       ║
echo ║                  Deixa eu fazer tudo pra ti! 🚀               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM 1. Verificar Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js nao encontrado!
    echo    Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado!
echo.

REM 2. Extrair arquivo se existir
if exist "niggan-finances-v2.tar.gz" (
    echo 📦 Descompactando projeto...
    REM Usar 7-Zip se disponível, caso contrário avisar
    where 7z >nul 2>nul
    if errorlevel 1 (
        echo ⚠️  7-Zip nao encontrado
        echo    Use: https://7-zip.org/
        echo    Ou copie manualmente a pasta niggan-improved/
        pause
    ) else (
        7z x niggan-finances-v2.tar.gz
        7z x niggan-finances-v2.tar
        cd niggan-improved
        echo ✅ Projeto descompactado!
    )
) else (
    echo ⚠️  Arquivo niggan-finances-v2.tar.gz nao encontrado
    echo    Se ja descompactou, entre na pasta: cd niggan-improved
)

echo.
echo 🔧 Instalando dependências (npm install)...
call npm install --legacy-peer-deps

if errorlevel 1 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas!

echo.
echo 📝 Configurando .env.local...

if not exist ".env.local" (
    (
        echo # Copie sua chave de API aqui:
        echo # NEXT_PUBLIC_ANTHROPIC_API_KEY=sua_chave_aqui
        echo NEXT_PUBLIC_ANTHROPIC_API_KEY=
    ) > .env.local
    echo ✅ Arquivo .env.local criado!
    echo ⚠️  IMPORTANTE: Edite .env.local e adicione sua chave de API
    echo    Acesse: https://console.anthropic.com ^> Get API Key
) else (
    echo ✅ .env.local ja existe!
)

echo.
echo 🧪 Verificando estrutura do projeto...
if exist "pages\index.tsx" (
    echo ✅ Projeto esta OK!
) else (
    echo ❌ Problema na estrutura do projeto
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    🎉 SETUP COMPLETO!                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📚 PROXIMOS PASSOS:
echo.
echo 1️⃣  Edite .env.local e adicione sua chave:
echo    notepad .env.local
echo.
echo 2️⃣  Rode o app:
echo    npm run dev
echo.
echo 3️⃣  Abra no navegador:
echo    http://localhost:3000
echo.
echo 4️⃣  Teste Mia (IA^):
echo    Escreva: 'gastei 50 em comida'
echo.
echo 5️⃣  Para fazer deploy no Vercel:
echo    npm install -g vercel
echo    vercel --prod
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📖 Leia a documentação:
echo    - COMECE-AQUI.md (guia rápido^)
echo    - SETUP.md (setup detalhado^)
echo    - DEPLOY.md (deploy no Vercel^)
echo.
echo 🎉 Seu app esta 100%% pronto para usar!
echo.
echo Desenvolvido com ❤️ para Felipe
echo.
pause
