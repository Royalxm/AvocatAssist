const express = require('express');
const { body, param, query } = require('express-validator');
const documentController = require('../controllers/documentController');
const { auth, isAdmin } = require('../middleware/auth');
const { uploadSingleDocument } = require('../middleware/upload');

const router = express.Router();

/**
 * @route POST /api/documents/upload
 * @desc Upload document
 * @access Private
 */
router.post(
  '/upload',
  auth,
  uploadSingleDocument,
  documentController.uploadDocument
);

/**
 * @route GET /api/documents
 * @desc Get user documents
 * @access Private
 */
router.get(
  '/',
  auth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100')
  ],
  documentController.getUserDocuments
);

/**
 * @route GET /api/documents/search
 * @desc Search documents
 * @access Private
 */
router.get(
  '/search',
  auth,
  [
    query('query').notEmpty().withMessage('Le paramètre de recherche est requis'),
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100')
  ],
  documentController.searchDocuments
);

/**
 * @route GET /api/documents/all
 * @desc Get all documents (admin only)
 * @access Private (Admin only)
 */
router.get(
  '/all',
  auth,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100'),
    query('userId').optional().isInt().withMessage('L\'ID utilisateur doit être un nombre entier')
  ],
  documentController.getAllDocuments
);

/**
 * @route GET /api/documents/:id
 * @desc Get document by ID
 * @access Private
 */
router.get(
  '/:id',
  auth,
  [
    param('id').isInt().withMessage('ID document invalide')
  ],
  documentController.getDocumentById
);

/**
 * @route GET /api/documents/:id/download
 * @desc Download document
 * @access Private
 */
router.get(
  '/:id/download',
  auth,
  [
    param('id').isInt().withMessage('ID document invalide')
  ],
  documentController.downloadDocument
);

/**
 * @route DELETE /api/documents/:id
 * @desc Delete document
 * @access Private
 */
router.delete(
  '/:id',
  auth,
  [
    param('id').isInt().withMessage('ID document invalide')
  ],
  documentController.deleteDocument
);

/**
 * @route PUT /api/documents/:id/extract-text
 * @desc Update document extracted text
 * @access Private
 */
router.put(
  '/:id/extract-text',
  auth,
  [
    param('id').isInt().withMessage('ID document invalide'),
    body('extractedText').notEmpty().withMessage('Le texte extrait est requis')
  ],
  documentController.updateExtractedText
);

module.exports = router;
