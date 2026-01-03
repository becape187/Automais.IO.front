#!/bin/bash
# Script para corrigir permissões do diretório do frontend

echo "=== Corrigindo permissões do frontend ==="

# Diretório do frontend
FRONTEND_DIR="/root/automais.io/front.io/dist"

# Verificar se o diretório existe
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERRO: Diretório $FRONTEND_DIR não encontrado!"
    exit 1
fi

echo "Ajustando permissões de diretórios..."
# Dar permissão de leitura/execução para diretórios
sudo chmod 755 /root
sudo chmod 755 /root/automais.io
sudo chmod 755 /root/automais.io/front.io
sudo chmod 755 "$FRONTEND_DIR"

echo "Ajustando permissões de arquivos..."
# Dar permissão de leitura para arquivos
sudo chmod -R 644 "$FRONTEND_DIR"/*
sudo find "$FRONTEND_DIR" -type d -exec chmod 755 {} \;

echo "Verificando se o nginx consegue ler..."
# Testar se www-data consegue ler
sudo -u www-data ls "$FRONTEND_DIR" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Nginx consegue ler o diretório"
else
    echo "✗ Nginx NÃO consegue ler o diretório"
    echo "Solução: Mover para /var/www/automais.io (veja TROUBLESHOOTING_NGINX.md)"
fi

echo "=== Permissões ajustadas ==="

