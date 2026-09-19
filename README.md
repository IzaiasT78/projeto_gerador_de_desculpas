# 🎭 Gerador de Desculpas Inteligente (DesculpaMaster)

Aplicação web completa, moderna e bem-humorada para gerar desculpas convincentes e personalizadas para qualquer ocasião (trabalho, cancelamento de rolês, atrasos, encontros e família). Conta com sistema de autenticação seguro, histórico de desculpas salvas por usuário e banco de dados SQLite com arquitetura desacoplada pronta para migração futura (PostgreSQL / MySQL).

---

## 🚀 Funcionalidades Principais

1. **Página Inicial (Home)**:
   - Apresentação visual e bem-humorada do propósito do projeto.
   - **Test Drive Instantâneo**: Gerador rápido interativo diretamente na Home para visitantes testarem sem cadastro.
   - Estatísticas em tempo real (Total de desculpas geradas, usuários cadastrados e desculpas salvas).
   - Depoimentos bem-humorados e seções explicativas.

2. **Sistema de Autenticação**:
   - Cadastro e Login com criptografia de senhas via `bcryptjs`.
   - Autenticação stateless via `JSON Web Tokens (JWT)`.
   - Medidor de força de senha em tempo real e botão de exibição/ocultação de senha.

3. **Estúdio Gerador de Desculpas (`/app`)**:
   - **Categorias**: Trabalho & Reuniões, Amigos & Rolê, Relacionamento, Família e Estudos.
   - **Destinatários**: Chefe, Colega, Amigo(a), Crush, Mãe/Parente, Professor(a).
   - **Tons da Conversa**: Corporativo Polido, Dramático (Azar Cósmico), Cara de Pau, Filosófico e Curto & Direto.
   - **Calibragem de Cara de Pau (Slider de 1 a 5)**:
     - *Nível 1*: 100% Crível & Seguro 🛡️
     - *Nível 2*: Plausível com Detalhes ☕
     - *Nível 3*: Incomum / Arriscado ⚡
     - *Nível 4*: Cara de Pau Extrema 🕶️
     - *Nível 5*: Caos Cósmico / Ficção Científica 🛸
   - **Contexto Personalizado**: Campo livre para digitar a situação específica com chips de atalho rápido.
   - **Ações Rápidas**:
     - 📋 Copiar com 1 clique (com notificação toast)
     - 📲 Compartilhar no WhatsApp com texto pré-formatado
     - 💾 Salvar no histórico do usuário
     - 🔄 Gerar nova variação ou botão 🎲 Aleatório de Emergência

4. **Histórico do Usuário & Favoritos**:
   - Listagem de todas as desculpas salvas pelo usuário logado.
   - Busca textual em tempo real.
   - Filtro por categoria e filtro por apenas favoritas.
   - Botão para favoritar (estrela), copiar novamente ou excluir.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js com Express.js
- **Banco de Dados**: SQLite nativo com modo WAL e integridade referencial
- **Autenticação**: JWT (`jsonwebtoken`) e `bcryptjs`
- **Frontend**: HTML5 Semântico, Vanilla CSS Moderno (Glassmorphism, Dark Theme, Design Tokens) e JavaScript Modular (Fetch API, Toasts, LocalStorage)

---

## 📦 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js instalado (v18 ou superior, recomendado v22+)
- npm instalado

### 1. Clonar ou Acessar a Pasta
```bash
cd d:/projetos_antigravity/projeto_gerador_de_desculpas
```

### 2. Instalar as Dependências (caso ainda não estejam instaladas)
```bash
npm install
```

### 3. Iniciar o Servidor
```bash
npm start
```
Ou em modo de desenvolvimento com hot-reload:
```bash
npm run dev
```

### 4. Acessar no Navegador
Abra: **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Estrutura do Banco de Dados SQLite

O banco de dados é inicializado automaticamente no caminho `data/desculpas.db`.

### Tabela `users`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL UNIQUE (NOCASE)
- `password_hash`: TEXT NOT NULL
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### Tabela `excuses`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id`: INTEGER REFERENCES users(id) ON DELETE CASCADE
- `category`: TEXT NOT NULL
- `recipient`: TEXT NOT NULL
- `tone`: TEXT NOT NULL
- `absurdity_level`: INTEGER NOT NULL DEFAULT 1
- `situation`: TEXT
- `generated_excuse`: TEXT NOT NULL
- `is_favorite`: INTEGER NOT NULL DEFAULT 0
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 🔄 Como Migrar do SQLite para PostgreSQL no Futuro

A camada de acesso a dados em `backend/db/database.js` foi desenhada através do padrão **Repository** (`UserRepository` e `ExcuseRepository`), isolando completamente a lógica de negócio das consultas de banco.

Para migrar para PostgreSQL:
1. Instale o driver do PostgreSQL (`npm install pg` ou utilize `Prisma` com `npx prisma init --datasource-provider postgresql`).
2. Altere a conexão no arquivo `database.js` para apontar para o pool do PostgreSQL utilizando a variável `DATABASE_URL` no `.env`.
3. A sintaxe de SQL das queries já utiliza padrões compatíveis com ANSI SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`).

---

## 🧪 Como Executar os Testes Automatizados

Para rodar a suíte de testes de ponta a ponta (E2E):
```bash
node test_e2e.js
```
