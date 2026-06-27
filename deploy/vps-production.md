# Mayclick - Checklist de VPS

## Ambiente de preview por IP

Frontend:

```env
VITE_API_URL=/api
```

Backend:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=4001
DATABASE_URL=postgresql://mayclick_user:SENHA_FORTE@127.0.0.1:5432/mayclick_db
JWT_SECRET=troque_por_uma_chave_aleatoria_forte_com_32_bytes_ou_mais
CORS_ORIGIN=http://IP_DA_VPS
APP_PUBLIC_URL=http://IP_DA_VPS
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
INFINITEPAY_WEBHOOK_SECRET=
SIGNATURE_WEBHOOK_SECRET=
SIGNATURE_PROVIDER=
SIGNATURE_API_KEY=
STORAGE_DIR=/var/www/mayclick/server/storage/documents
PORTFOLIO_STORAGE_DIR=/var/www/mayclick/server/storage/portfolio
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=
```

Nenhuma secret deve ser colocada em variavel `VITE_*`. Arquivos reais `.env`, `server/.env` e `.env.local` nao devem ser commitados.

## Ambiente com dominio e HTTPS

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
CORS_ORIGIN=https://www.mayclick.com.br,https://mayclick.com.br
APP_PUBLIC_URL=https://www.mayclick.com.br
```

## Nginx

Usar `deploy/nginx-mayclick.conf` como base.

```bash
sudo cp deploy/nginx-mayclick.conf /etc/nginx/sites-available/mayclick
sudo ln -s /etc/nginx/sites-available/mayclick /etc/nginx/sites-enabled/mayclick
sudo nginx -t
sudo systemctl reload nginx
```

A configuracao serve `/var/www/mayclick/dist`, faz proxy de `/api` para `127.0.0.1:4001`, bloqueia arquivos ocultos, `.env`, `/server` e `/storage`, e desativa directory listing.

## PM2

Executar o backend a partir da pasta `server`, para carregar o `server/.env`.

```bash
cd /var/www/mayclick/server
npm ci --omit=dev
npm run migrate
npm run seed
pm2 start src/server.js --name mayclick-api --update-env
pm2 save
pm2 startup
pm2 logs mayclick-api
```

Para atualizar:

```bash
cd /var/www/mayclick
npm ci
npm run build
cd /var/www/mayclick/server
npm ci --omit=dev
npm run migrate
pm2 restart mayclick-api --update-env
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 4001/tcp
sudo ufw deny 5432/tcp
sudo ufw enable
sudo ufw status verbose
```

O backend deve escutar em `127.0.0.1:4001`; Postgres e porta 4001 nao devem ficar expostos publicamente.

## Banco

```sql
CREATE DATABASE mayclick_db;
CREATE USER mayclick_user WITH PASSWORD 'SENHA_FORTE';
GRANT ALL PRIVILEGES ON DATABASE mayclick_db TO mayclick_user;
\c mayclick_db
GRANT USAGE, CREATE ON SCHEMA public TO mayclick_user;
```

Use nomes de banco e usuario dedicados ao Mayclick em producao.

## Storage

```bash
sudo mkdir -p /var/www/mayclick/server/storage/documents
sudo mkdir -p /var/www/mayclick/server/storage/portfolio
sudo chown -R deploy:www-data /var/www/mayclick/server/storage
sudo chmod -R 750 /var/www/mayclick/server/storage
```

Documentos devem ser baixados somente por rota autenticada. O Nginx nao deve servir `server/storage/documents` diretamente.

## Verificacao

```bash
npm run build
npm audit --audit-level=moderate
cd server
npm audit --audit-level=moderate
curl -i http://127.0.0.1:4001/api/health
curl -i http://127.0.0.1:4001/api/health/db
curl -i http://IP_DA_VPS/api/health
```

## Backup minimo

```bash
sudo mkdir -p /var/backups/mayclick
pg_dump "$DATABASE_URL" > /var/backups/mayclick/mayclick_db_$(date +%F).sql
tar -czf /var/backups/mayclick/mayclick_storage_$(date +%F).tar.gz /var/www/mayclick/server/storage
```

Documentar tambem o restore antes de considerar o backup confiavel.
