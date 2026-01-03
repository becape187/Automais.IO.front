#!/bin/bash
# Script para mover frontend para /var/www/automais.io

echo "=== Movendo frontend para /var/www/ ==="

# Criar diretório
sudo mkdir -p /var/www/automais.io

# Copiar arquivos
echo "Copiando arquivos..."
sudo cp -r /root/automais.io/front.io/dist/* /var/www/automais.io/

# Ajustar permissões
echo "Ajustando permissões..."
sudo chown -R www-data:www-data /var/www/automais.io
sudo chmod -R 755 /var/www/automais.io

# Verificar
echo "Verificando..."
ls -la /var/www/automais.io/ | head -10

echo "✓ Arquivos movidos para /var/www/automais.io"
echo ""
echo "Agora atualize o nginx:"
echo "  sudo nano /etc/nginx/sites-available/automais-front"
echo "  Mude: root /root/automais.io/front.io/dist;"
echo "  Para: root /var/www/automais.io;"
echo ""
echo "Depois:"
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"

