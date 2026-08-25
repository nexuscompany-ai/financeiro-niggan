#!/bin/bash

# 🚀 PUSH PARA GITHUB - AUTOMÁTICO
# Este script faz push de tudo para o GitHub

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              NIGGAN - PUSH PARA GITHUB                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório git!"
    echo "   Execute isto na pasta niggan-improved/"
    exit 1
fi

echo "📝 Configurando remoto do GitHub..."

# Remover remoto antigo se existir
git remote remove origin 2>/dev/null

# Adicionar novo remoto
git remote add origin https://github.com/felipealmeidasouza0777-collab/NIGGAN-FINANCES.git

echo "✅ Remoto configurado!"

echo ""
echo "🔄 Renomeando branch para 'main'..."
git branch -M main

echo "✅ Branch renomeado para 'main'!"

echo ""
echo "📤 Fazendo push para GitHub (pode pedir sua senha)..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              ✅ PUSH REALIZADO COM SUCESSO!                  ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Seu repositório GitHub foi atualizado!"
    echo ""
    echo "Acesse: https://github.com/felipealmeidasouza0777-collab/NIGGAN-FINANCES"
    echo ""
    echo "Próximos passos:"
    echo "1. Configure Vercel conectando seu GitHub"
    echo "2. Adicione NEXT_PUBLIC_ANTHROPIC_API_KEY nas variáveis"
    echo "3. Clique Deploy!"
else
    echo ""
    echo "❌ Erro ao fazer push!"
    echo "   Verifique sua conexão de internet e suas credenciais do GitHub"
fi
