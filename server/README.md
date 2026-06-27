# Mayclick Photography API

Backend robusto desenvolvido em Node.js + Express + PostgreSQL para a plataforma Mayclick Photography.

## 🛠️ Tecnologias
- **Node.js** & **Express**
- **PostgreSQL** (Banco de Dados)
- **JWT** (Autenticação)
- **Bcrypt** (Criptografia de Senhas)
- **Helmet** & **CORS** (Segurança)

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos
- Node.js instalado
- PostgreSQL rodando localmente

### 2. Configuração do Banco de Dados
Crie um banco de dados chamado `mayclick_db`:
```sql
CREATE DATABASE mayclick_db;
```

### 3. Instalação e Configuração
No diretório `/server`:
```bash
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:
```env
PORT=4000
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/mayclick_db
JWT_SECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=defina_uma_senha_forte
ADMIN_NAME=Administrador
```

### 4. Migrations e Seeds
Execute os comandos abaixo para criar as tabelas e popular dados iniciais:
```bash
npm run migrate
npm run seed
```

### 5. Iniciar o Servidor
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:4000`.

## 🔑 Acesso Administrativo
O seed de admin só cria usuário quando `ADMIN_EMAIL` e `ADMIN_PASSWORD` estão definidos no `.env`.
Não existe senha padrão segura para produção.

Para trocar a senha de um admin existente, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` e execute:
```bash
npm run reset-admin-password
```

## 🛣️ Rotas Principais

### Públicas
- `GET /api/health`: Check de saúde do sistema.
- `GET /api/public/packages`: Lista de pacotes ativos.
- `POST /api/public/submissions`: Envio de formulário pelo cliente.

### Autenticação
- `POST /api/auth/login`: Login administrativo.

### Privadas (Requerem Header Authorization: Bearer <token>)
- `GET /api/admin/submissions`: Lista todas as respostas.
- `GET /api/admin/settings`: Configurações do negócio.
- `PUT /api/admin/settings`: Atualizar configurações.
- `GET /api/admin/packages`: Gestão de pacotes.
