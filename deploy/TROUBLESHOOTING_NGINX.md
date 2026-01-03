# Troubleshooting Erro 500 no Nginx

## Diagnóstico Rápido

Execute estes comandos no servidor para identificar o problema:

```bash
# 1. Verificar se os arquivos existem
ls -la /root/automais.io/front.io/dist/
ls -la /root/automais.io/front.io/dist/index.html

# 2. Verificar permissões
ls -ld /root/automais.io/front.io/dist

# 3. Ver logs de erro do nginx
sudo tail -50 /var/log/nginx/automais-front-error.log

# 4. Verificar se o nginx consegue ler o diretório
sudo -u www-data ls /root/automais.io/front.io/dist/
```

## Problemas Comuns e Soluções

### 1. Problema de Permissões

O nginx roda como usuário `www-data` e pode não ter permissão para acessar `/root/`.

**Solução A: Ajustar permissões (Recomendado)**

```bash
# Dar permissão de leitura para o diretório
sudo chmod 755 /root
sudo chmod 755 /root/automais.io
sudo chmod 755 /root/automais.io/front.io
sudo chmod 755 /root/automais.io/front.io/dist

# Dar permissão de leitura para os arquivos
sudo chmod -R 644 /root/automais.io/front.io/dist/*
sudo chmod 755 /root/automais.io/front.io/dist
```

**Solução B: Mover para local padrão (Melhor prática)**

```bash
# Criar diretório padrão do nginx
sudo mkdir -p /var/www/automais.io

# Mover arquivos
sudo mv /root/automais.io/front.io/dist/* /var/www/automais.io/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/automais.io
sudo chmod -R 755 /var/www/automais.io

# Atualizar nginx
sudo nano /etc/nginx/sites-available/automais-front
# Mudar: root /root/automais.io/front.io/dist;
# Para: root /var/www/automais.io;
```

### 2. Arquivo index.html não existe

```bash
# Verificar se existe
ls -la /root/automais.io/front.io/dist/index.html

# Se não existir, verificar se o build foi feito corretamente
cd /root/automais.io/front.io
ls -la dist/
```

### 3. Verificar logs detalhados

```bash
# Ver último erro
sudo tail -100 /var/log/nginx/automais-front-error.log

# Ver acessos
sudo tail -50 /var/log/nginx/automais-front-access.log

# Ver logs gerais do nginx
sudo tail -50 /var/log/nginx/error.log
```

### 4. Testar configuração do nginx

```bash
# Verificar sintaxe
sudo nginx -t

# Ver configuração carregada
sudo nginx -T | grep -A 20 "automais-front"
```

### 5. Verificar se o nginx está rodando

```bash
sudo systemctl status nginx
```

## Solução Rápida (Mover para /var/www)

Execute estes comandos:

```bash
# 1. Criar diretório
sudo mkdir -p /var/www/automais.io

# 2. Copiar arquivos
sudo cp -r /root/automais.io/front.io/dist/* /var/www/automais.io/

# 3. Ajustar permissões
sudo chown -R www-data:www-data /var/www/automais.io
sudo chmod -R 755 /var/www/automais.io

# 4. Atualizar nginx
sudo nano /etc/nginx/sites-available/automais-front
# Mudar a linha:
# root /root/automais.io/front.io/dist;
# Para:
# root /var/www/automais.io;

# 5. Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

## Atualizar Deploy para usar /var/www

Depois de mover, atualize o workflow de deploy para copiar diretamente para `/var/www/automais.io` ao invés de `/root/automais.io/front.io/dist`.

