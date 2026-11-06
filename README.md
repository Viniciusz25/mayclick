# Mayclick Photography Platform

Um sistema completo (Full-Stack) construído para gerenciar o site, o portfólio, os orçamentos e os contratos do negócio de fotografia **Mayclick**.

O sistema é dividido em duas partes principais:
1. **Frontend (Site & Painel Administrativo):** Interface moderna e responsiva focada em conversão, orçamentos e facilidade de gerenciamento.
2. **Backend (API):** Servidor seguro e rápido responsável por processar os orçamentos, gerar contratos em PDF, validar logins de administradores e salvar tudo no banco de dados.

## 🚀 Tecnologias Utilizadas

### Frontend
* **React + Vite:** Para uma construção e carregamento de páginas ultrarrápido.
* **Vanilla CSS:** Arquitetura de estilos personalizada e otimizada, garantindo total flexibilidade no design visual.
* **Lucide React:** Biblioteca de ícones moderna e leve.
* **React Router:** Gerenciamento de rotas e navegação fluída.

### Backend
* **Node.js + Express:** Framework robusto para a criação da API REST.
* **PostgreSQL:** Banco de dados relacional sólido hospedado na nuvem.
* **Supabase:** Plataforma de banco de dados e infraestrutura.
* **pg-pool:** Gerenciador de conexão com o PostgreSQL nativo.
* **Bcryptjs & JWT:** Criptografia de senhas e autenticação segura (JSON Web Tokens).

### Hospedagem (Produção)
* **Cloudflare Pages + Pages Functions:** Hospedagem unificada do Frontend (`dist/`) e do Backend Serverless (`functions/api/[[route]].js`) na borda (Edge) da Cloudflare, sem *cold starts* de hibernação.
* **Supabase:** Banco de dados PostgreSQL e Storage de imagens/documentos.

---

## ⚙️ Principais Funcionalidades

1. **Gestão de Orçamentos (Automática):** O cliente preenche um formulário no site e o orçamento é salvo automaticamente no banco de dados, aparecendo no painel do administrador.
2. **Geração de Contratos em PDF:** Orçamentos que são marcados como "Aprovados" podem gerar um contrato em PDF automaticamente preenchido com os dados do cliente e da empresa.
3. **Página Inicial Dinâmica (Builder):** O painel administrativo permite alterar os textos da página inicial, banners de depoimentos e até as imagens em destaque sem tocar em uma linha de código.
4. **Portfólio Gerenciável:** Permite adicionar categorias e fotos ao portfólio com opção de upload em massa.
5. **Políticas e Termos Editáveis:** Editor de texto dentro do painel para alterar contratos base e políticas de privacidade.

---

## 🛠️ Como rodar o projeto localmente (Ambiente de Desenvolvimento)

### Pré-requisitos
* Node.js (v18 ou superior recomendado)
* Um banco de dados PostgreSQL (recomenda-se criar um projeto grátis no [Supabase](https://supabase.com/))

### 1. Clonar e Instalar as Dependências

```bash
# Clone o repositório
git clone https://github.com/Viniciusz25/mayclick.git
cd mayclick

# Instale as dependências do Frontend (Raiz do projeto)
npm install

# Entre na pasta do backend e instale as dependências
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente (.env)

Crie um arquivo `.env` dentro da pasta `server/` contendo:
```env
PORT=4001
NODE_ENV=development
DATABASE_URL=Sua_URL_do_Postgres_Supabase_Aqui?sslmode=require
JWT_SECRET=Uma_Senha_Super_Secreta_Para_Logins
CORS_ORIGIN=http://localhost:5173
```

Crie um arquivo `.env.production` (ou use `.env.local` se estiver testando localmente com variáveis dinâmicas) na pasta **raiz** (Frontend) contendo:
```env
VITE_API_URL=http://localhost:4001
```

### 3. Migrar e Popular o Banco de Dados

Dentro da pasta `server/`, rode os comandos abaixo para criar as tabelas e injetar as informações iniciais e o usuário Administrador:

```bash
# Cria as tabelas necessárias
npm run migrate

# Preenche configurações básicas e cria o Administrador Padrão
npm run seed
```
*(As credenciais iniciais geradas ficam gravadas em log no momento do seed ou podem ser configuradas via `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` do servidor).*

### 4. Iniciar os Servidores

Você precisará de dois terminais abertos rodando simultaneamente:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
# Na raiz do projeto
npm run dev
```

O site estará disponível em `http://localhost:5173` e o painel administrativo em `http://localhost:5173/admin`.

---

## 📦 Como Lançar para Produção (Cloudflare Pages)

O projeto está configurado para rodar **Frontend + Backend (API)** juntos no **Cloudflare Pages** (usando *Cloudflare Pages Functions* em `functions/api/[[route]].js` e `wrangler.toml`):

1. No painel da **Cloudflare** (`Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`), selecione o repositório do projeto.
2. Em **Build settings**, configure:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
3. Em **Settings -> Environment variables** (Production & Preview), adicione as variáveis do seu servidor:
   * `DATABASE_URL`: URL de conexão do PostgreSQL do Supabase (recomendado usar a URL do **Transaction Pooler** porta `6543`)
   * `JWT_SECRET`: Sua chave secreta para assinatura dos tokens JWT
   * `SUPABASE_URL`: URL do projeto no Supabase
   * `SUPABASE_SERVICE_KEY`: Chave `service_role` do Supabase (para upload de fotos e PDFs)
   * `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` *(opcionais, caso use a integração com Google Calendar)*
4. Faça o deploy — a flag `nodejs_compat` já está configurada automaticamente via `wrangler.toml`, o roteamento SPA está em `public/_redirects`, e todas as chamadas `/api/*` são roteadas automaticamente pela função `functions/api/[[route]].js`.
