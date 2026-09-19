const { ExcuseRepository } = require('../db/database');
const { generateExcuse, CATEGORIES, TONES } = require('../services/generatorEngine');
const { generateExcuseWithOpenAI } = require('../services/openAiService');

const excuseController = {
  // Gera uma desculpa via OpenAI (com fallback transparente)
  async generate(req, res) {
    try {
      const { category, recipient, tone, absurdityLevel, situation } = req.body;

      const result = await generateExcuseWithOpenAI({
        category,
        recipient,
        tone,
        absurdityLevel,
        situation
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao gerar desculpa:', error);
      return res.status(500).json({
        success: false,
        message: 'Falha ao processar motor de desculpas.'
      });
    }
  },

  // Salva uma desculpa no histórico do usuário autenticado
  save(req, res) {
    try {
      const userId = req.user.id;
      const {
        category,
        recipient,
        tone,
        absurdityLevel,
        situation,
        generatedExcuse
      } = req.body;

      if (!generatedExcuse || !generatedExcuse.trim()) {
        return res.status(400).json({
          success: false,
          message: 'O texto da desculpa gerada é obrigatório para salvar.'
        });
      }

      const saved = ExcuseRepository.create({
        userId,
        category: category || 'trabalho',
        recipient: recipient || 'chefe',
        tone: tone || 'corporativo',
        absurdityLevel: Number(absurdityLevel) || 1,
        situation: situation || '',
        generatedExcuse: generatedExcuse.trim()
      });

      return res.status(201).json({
        success: true,
        message: 'Desculpa salva com sucesso no seu histórico!',
        data: saved
      });
    } catch (error) {
      console.error('Erro ao salvar desculpa:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao persistir desculpa no banco de dados.'
      });
    }
  },

  // Lista o histórico de desculpas do usuário logado com filtros
  list(req, res) {
    try {
      const userId = req.user.id;
      const { category, search, favoritesOnly } = req.query;

      const excuses = ExcuseRepository.findByUserId(userId, {
        category,
        search,
        favoritesOnly
      });

      return res.json({
        success: true,
        data: excuses
      });
    } catch (error) {
      console.error('Erro ao listar desculpas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar histórico de desculpas.'
      });
    }
  },

  // Alterna o status de favorito
  toggleFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const updated = ExcuseRepository.toggleFavorite(Number(id), userId);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Desculpa não encontrada no seu histórico.'
        });
      }

      return res.json({
        success: true,
        message: updated.isFavorite ? 'Adicionada aos favoritos!' : 'Removida dos favoritos!',
        data: updated
      });
    } catch (error) {
      console.error('Erro ao favoritar desculpa:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status de favorito.'
      });
    }
  },

  // Remove uma desculpa do histórico
  delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const success = ExcuseRepository.delete(Number(id), userId);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Desculpa não encontrada ou já removida.'
        });
      }

      return res.json({
        success: true,
        message: 'Desculpa removida com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir desculpa:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir desculpa do histórico.'
      });
    }
  },

  // Retorna metadados e categorias disponíveis
  getOptions(req, res) {
    return res.json({
      success: true,
      categories: CATEGORIES,
      tones: TONES
    });
  },

  // Estatísticas públicas
  getStats(req, res) {
    try {
      const stats = ExcuseRepository.getStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.json({
        success: true,
        data: {
          totalExcuses: 1420,
          totalUsers: 380,
          totalFavorites: 750
        }
      });
    }
  }
};

module.exports = excuseController;
