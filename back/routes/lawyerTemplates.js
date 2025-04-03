const express = require('express');
const { body, param, query } = require('express-validator');
const lawyerTemplateController = require('../controllers/lawyerTemplateController');
const { authenticate, isLawyer } = require('../middleware/auth'); // Use isLawyer middleware

const router = express.Router();

// Apply authentication and lawyer check to all routes in this file
router.use(authenticate);
router.use(isLawyer); // Ensure only lawyers can manage their custom templates

/**
 * @route   GET /api/lawyer-templates
 * @desc    Get custom templates for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.get(
    '/',
    [ // Optional query param validation
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('searchTerm').optional().trim(),
        query('category').optional().trim()
    ],
    lawyerTemplateController.getTemplates
);

/**
 * @route   POST /api/lawyer-templates
 * @desc    Create a new custom template for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Template name is required').trim().isLength({ max: 255 }),
        body('content').notEmpty().withMessage('Template content is required').trim(),
        body('description').optional({ nullable: true }).trim(),
        body('category').optional({ nullable: true }).trim().isLength({ max: 50 })
        // Variables are extracted automatically in the controller
    ],
    lawyerTemplateController.createTemplate
);

/**
 * @route   GET /api/lawyer-templates/:templateId
 * @desc    Get a specific custom template by ID
 * @access  Private (Lawyer only)
 */
router.get(
    '/:templateId',
    [
        param('templateId').isInt({ min: 1 }).withMessage('Invalid Template ID')
    ],
    lawyerTemplateController.getTemplateById
);

/**
 * @route   PUT /api/lawyer-templates/:templateId
 * @desc    Update a custom template for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.put(
    '/:templateId',
    [
        param('templateId').isInt({ min: 1 }).withMessage('Invalid Template ID'),
        // Validation for update fields (all optional)
        body('name').optional().trim().isLength({ min:1, max: 255 }).withMessage('Name cannot be empty if provided'),
        body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty if provided'),
        body('description').optional({ nullable: true }).trim(),
        body('category').optional({ nullable: true }).trim().isLength({ max: 50 })
    ],
    lawyerTemplateController.updateTemplate
);

/**
 * @route   DELETE /api/lawyer-templates/:templateId
 * @desc    Delete a custom template for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.delete(
    '/:templateId',
    [
        param('templateId').isInt({ min: 1 }).withMessage('Invalid Template ID')
    ],
    lawyerTemplateController.deleteTemplate
);

module.exports = router;