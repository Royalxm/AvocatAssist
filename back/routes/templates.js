const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/templates
 * @desc    Get all document templates
 * @access  Private
 */
router.get('/', authenticate, templateController.getAllTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get document template by ID
 * @access  Private
 */
router.get('/:id', authenticate, templateController.getTemplateById);

/**
 * @route   GET /api/templates/category/:category
 * @desc    Get document templates by category
 * @access  Private
 */
router.get('/category/:category', authenticate, templateController.getTemplatesByCategory);

/**
 * @route   POST /api/templates/generate
 * @desc    Generate document from template
 * @access  Private
 */
router.post('/generate', authenticate, templateController.generateDocument);

/**
 * @route   GET /api/templates/categories
 * @desc    Get template categories
 * @access  Private
 */
router.get('/categories', authenticate, templateController.getTemplateCategories);

/**
 * @route   GET /api/templates/:id/variables
 * @desc    Get template variables
 * @access  Private
 */
router.get('/:id/variables', authenticate, templateController.getTemplateVariables);

/**
 * @route   GET /api/templates/search
 * @desc    Search templates
 * @access  Private
 */
router.get('/search', authenticate, templateController.searchTemplates);

module.exports = router;
