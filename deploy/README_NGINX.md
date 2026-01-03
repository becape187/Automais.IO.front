# Configuração Nginx para Frontend

## Arquivo de Configuração

O arquivo `nginx-automais-front.conf` contém a configuração do nginx para servir o frontend na porta 443 (HTTPS).

## Instalação

### 1. Copiar arquivo de configuração

```bash
# No servidor
sudo cp nginx-automais-front.conf /etc/nginx/sites-available/automais-front
```

### 2. Criar link simbólico

```bash
sudo ln -s /etc/nginx/sites-available/automais-front /etc/nginx/sites-enabled/automais-front
```

### 3. Ajustar configurações

Edite o arquivo conforme necessário:

```bash
sudo nano /etc/nginx/sites-available/automais-front
```

**Ajustes importantes:**
- `server_name`: Domínio ou IP do servidor
- `ssl_certificate` e `ssl_certificate_key`: Caminhos dos certificados SSL
- `root`: Caminho do diretório `dist` (já configurado para `/root/automais.io/front.io/dist`)

### 4. Testar configuração

```bash
sudo nginx -t
```

### 5. Recarregar nginx

```bash
sudo systemctl reload nginx
```

## Certificados SSL

### Opção 1: Let's Encrypt (Recomendado)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d automais.io -d www.automais.io

# Renovação automática (já configurado pelo certbot)
```

### Opção 2: Certificado Auto-assinado (Desenvolvimento)

```bash
# Criar diretório para certificados
sudo mkdir -p /etc/nginx/ssl

# Gerar certificado auto-assinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/automais.key \
  -out /etc/nginx/ssl/automais.crt

# Ajustar permissões
sudo chmod 600 /etc/nginx/ssl/automais.key
sudo chmod 644 /etc/nginx/ssl/automais.crt
```

## Verificação

### Verificar se está rodando

```bash
# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/automais-front-access.log
sudo tail -f /var/log/nginx/automais-front-error.log

# Testar acesso
curl -I https://automais.io
# ou
curl -I https://206.81.13.44
```

### Verificar porta 443

```bash
sudo netstat -tulpn | grep 443
# ou
sudo ss -tulpn | grep 443
```

## Troubleshooting

### Erro: "SSL certificate not found"

- Verifique se os certificados existem nos caminhos especificados
- Verifique as permissões dos arquivos de certificado
- Use certificado auto-assinado para testes

### Erro: "Permission denied"

- Verifique se o nginx tem permissão para ler o diretório `/root/automais.io/front.io/dist`
- Considere mover o diretório para `/var/www/automais.io` e ajustar permissões

### Frontend não carrega

- Verifique se os arquivos estão em `/root/automais.io/front.io/dist`
- Verifique os logs do nginx: `sudo tail -f /var/log/nginx/automais-front-error.log`
- Verifique se o `index.html` existe

### API não funciona

- Verifique se a API está rodando na porta 5000: `sudo systemctl status automais-api.service`
- Teste a API diretamente: `curl http://localhost:5000/health`

