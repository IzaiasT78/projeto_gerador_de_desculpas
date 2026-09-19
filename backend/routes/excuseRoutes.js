const express = require('express');
const router = express.Router();
const excuseController = require('../controllers/excuseController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Rotas públicas
router.post('/generate', optionalAuth, excuseController.generate);
router.get('/options', excuseController.getOptions);
router.get('/stats', excuseController.getStats);

// Rotas protegidas (usuário autenticado)
router.post('/save', requireAuth, excuseController.save);
router.get('/my-excuses', requireAuth, excuseController.list);
router.patch('/:id/favorite', requireAuth, excuseController.toggleFavorite);
router.delete('/:id', requireAuth, excuseController.delete);

module.exports = router;
