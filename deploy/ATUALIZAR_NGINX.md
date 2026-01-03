# Atualizar Configuração do Nginx

## O que adicionar

Adicione o bloco de proxy para a API no arquivo `/etc/nginx/sites-available/automais-front`:

```nginx
# Proxy para API
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## Como atualizar

### Opção 1: Editar manualmente

```bash
# No servidor
sudo nano /etc/nginx/sites-available/automais-front
```

Adicione o bloco `location /api` **ANTES** do bloco `location /` (React Router).

### Opção 2: Usar o arquivo completo

```bash
# Copiar o arquivo completo (se preferir)
sudo cp nginx-automais-front-completo.conf /etc/nginx/sites-available/automais-front
```

## Ordem correta dos blocos location

```nginx
# 1. Proxy da API (deve vir primeiro)
location /api {
    ...
}

# 2. Cache de assets estáticos
location ~* \.(jpg|jpeg|...) {
    ...
}

# 3. React Router (deve vir por último)
location / {
    try_files $uri $uri/ /index.html;
}
```

## Após atualizar

```bash
# Testar configuração
sudo nginx -t

# Se estiver OK, recarregar
sudo systemctl reload nginx
```

## Verificar se está funcionando

```bash
# Testar API através do proxy
curl https://automais.io/api/health

# Ver logs
sudo tail -f /var/log/nginx/automais-front-access.log
sudo tail -f /var/log/nginx/automais-front-error.log
```

## Importante

- O bloco `location /api` deve vir **ANTES** do `location /` para que as requisições `/api/*` sejam capturadas pelo proxy
- Se o `location /` vier primeiro, ele vai tentar servir `/api` como arquivo estático

