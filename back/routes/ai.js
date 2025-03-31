const express = require('express');
const { body, param, query } = require('express-validator');
const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/ai/ask
 * @desc Ask a question to the AI
 * @access Private
 */
router.post(
  '/ask',
  auth,
  [
    body('question')
      .notEmpty()
      .withMessage('La question est requise')
      .isString()
      .withMessage('La question doit être une chaîne de caractères')
      .isLength({ min: 5, max: 1000 })
      .withMessage('La question doit contenir entre 5 et 1000 caractères'),
    
    body('documentIds')
      .optional()
      .isArray()
      .withMessage('Les IDs de documents doivent être un tableau'),
    
    // Make chatId optional, but validate if present
    body('chatId')
      .optional()
      .isInt()
      .withMessage('L\'ID du chat doit être un nombre entier'),

    // Make conversationId optional, but validate if present
    body('conversationId')
      .optional()
      .isInt()
      .withMessage('L\'ID de la conversation doit être un nombre entier'),

    // Custom validation to ensure exactly one ID is provided
    body().custom((value, { req }) => {
      const { chatId, conversationId } = req.body;
      const chatIdPresent = chatId !== undefined && chatId !== null && chatId !== '';
      const conversationIdPresent = conversationId !== undefined && conversationId !== null && conversationId !== '';

      if (!chatIdPresent && !conversationIdPresent) {
        throw new Error('L\'ID du chat ou de la conversation est requis.');
      }
      if (chatIdPresent && conversationIdPresent) {
        throw new Error('Fournir soit l\'ID du chat, soit l\'ID de la conversation, mais pas les deux.');
      }
      // If exactly one is present, validation passes (type check is handled above)
      return true;
    })
  ],
  aiController.askQuestion
);

/**
 * @route GET /api/ai/queries
 * @desc Get user queries
 * @access Private
 */
router.get(
  '/queries',
  auth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un nombre entier positif'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être un nombre entier entre 1 et 100')
  ],
  aiController.getUserQueries
);

/**
 * @route GET /api/ai/queries/:id
 * @desc Get query by ID
 * @access Private
 */
router.get(
  '/queries/:id',
  auth,
  [
    param('id')
      .isInt()
      .withMessage('ID de requête invalide')
  ],
  aiController.getQueryById
);

/**
 * @route POST /api/ai/summarize
 * @desc Generate document summary
 * @access Private
 */
router.post(
  '/summarize',
  auth,
  [
    body('documentId')
      .notEmpty()
      .withMessage('L\'ID du document est requis')
      .isInt()
      .withMessage('L\'ID du document doit être un nombre entier')
  ],
  aiController.generateDocumentSummary
);

/**
 * @route POST /api/ai/legal-request-summary
 * @desc Generate legal request summary
 * @access Private
 */
router.post(
  '/legal-request-summary',
  auth,
  [
    body('description')
      .notEmpty()
      .withMessage('La description est requise')
      .isString()
      .withMessage('La description doit être une chaîne de caractères')
      .isLength({ min: 50, max: 5000 })
      .withMessage('La description doit contenir entre 50 et 5000 caractères')
  ],
  aiController.generateLegalRequestSummary
);

/**
 * @route POST /api/ai/generate-document
 * @desc Generate document from template
 * @access Private
 */
router.post(
  '/generate-document',
  auth,
  [
    body('templateName')
      .notEmpty()
      .withMessage('Le nom du modèle est requis')
      .isString()
      .withMessage('Le nom du modèle doit être une chaîne de caractères'),
    
    body('variables')
      .notEmpty()
      .withMessage('Les variables sont requises')
      .isObject()
      .withMessage('Les variables doivent être un objet')
  ],
  aiController.generateDocumentFromTemplate
);

/**
 * @route GET /api/ai/templates
 * @desc Get available templates
 * @access Private
 */
router.get(
  '/templates',
  auth,
  aiController.getAvailableTemplates
);

module.exports = router;
