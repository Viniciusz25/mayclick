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
* **HostGator:** Hospedagem dos arquivos estáticos do Frontend.
* **Render.com:** Servidor de hospedagem em tempo real (zero-downtime) do Backend (API).

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

## 📦 Como Lançar para Produção (Build)

1. Garanta que o seu arquivo `.env.production` na raiz aponte para a URL oficial da sua API no Render (Ex: `VITE_API_URL=https://sua-api.onrender.com`).
2. Na raiz do projeto, execute o build do frontend:
```bash
npm run build
```
3. Todo o conteúdo otimizado será gerado na pasta `dist/`. Basta enviar os arquivos dessa pasta (incluindo os ocultos como `.htaccess`) para o seu servidor da HostGator via cPanel ou FTP.
4. O Backend já terá sido atualizado automaticamente pelo Render após o seu `git push`.
