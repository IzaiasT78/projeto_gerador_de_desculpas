require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');

const authRoutes = require('./backend/routes/authRoutes');
const excuseRoutes = require('./backend/routes/excuseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/excuses', excuseRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Redirecionamentos amigáveis para rotas limpas do frontend
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fallback para qualquer rota não mapeada na API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('Erro não tratado na aplicação:', err);
  res.status(500).json({
    success: false,
    message: 'Ocorreu um erro interno no servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`
  ======================================================
  🎭 GERADOR DE DESCULPAS - SERVIDOR ONLINE
  ======================================================
  🚀 Acesso local: http://localhost:${PORT}
  🗄️  Banco de Dados: SQLite (data/desculpas.db)
  🔒 Autenticação: JWT + Bcrypt
  ======================================================
  `);
});
