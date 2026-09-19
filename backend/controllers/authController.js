const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository, ExcuseRepository } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'O nome é obrigatório.' });
      }

      // Validação estrita de e-mail via regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Forneça um e-mail válido no formato correto (ex: nome@dominio.com).' });
      }

      // Validação de confirmação de senha (se enviada)
      if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'A confirmação de senha não coincide com a senha digitada.' });
      }

      // Validação de requisitos de senha forte
      const hasLength = password && password.length >= 8;
      const hasUpper = /[A-Z]/.test(password || '');
      const hasLower = /[a-z]/.test(password || '');
      const hasNumber = /[0-9]/.test(password || '');
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || '');

      if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        return res.status(400).json({
          success: false,
          message: 'A senha não atende aos requisitos de segurança. Ela deve ter no mínimo 8 caracteres, contendo letras maiúsculas, minúsculas, números e pelo menos um caractere especial (!@#$...).'
        });
      }

      const existing = UserRepository.findByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'Já existe uma conta cadastrada com este e-mail.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = UserRepository.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash
      });

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao processar cadastro.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
      }

      const user = UserRepository.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: `Bem-vindo(a) de volta, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao autenticar.' });
    }
  },

  async getMe(req, res) {
    try {
      const user = UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }

      const excuses = ExcuseRepository.findByUserId(user.id);
      const favoritesCount = excuses.filter(e => e.isFavorite).length;

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
          totalSavedExcuses: excuses.length,
          totalFavorites: favoritesCount
        }
      });
    } catch (error) {
      console.error('Erro no getMe:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar dados do usuário.' });
    }
  }
};

module.exports = authController;
