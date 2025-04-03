const express = require('express');
const { body, param, query } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticate, isLawyer } = require('../middleware/auth'); // Use isLawyer middleware

const router = express.Router();

// Apply authentication and lawyer check to all contact routes
router.use(authenticate);
router.use(isLawyer); // Ensure only lawyers can access contact book features

/**
 * @route   GET /api/contacts
 * @desc    Get contacts for the logged-in lawyer with pagination and search
 * @access  Private (Lawyer only)
 */
router.get(
    '/',
    [ // Optional query param validation
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('searchTerm').optional().trim()
    ],
    contactController.getContacts
);

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Contact name is required').trim().isLength({ max: 255 }),
        body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email format').normalizeEmail(),
        body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
        body('company').optional({ nullable: true }).trim().isLength({ max: 255 }),
        body('notes').optional({ nullable: true }).trim(),
        body('isClient').optional().isBoolean().toBoolean(),
        body('clientId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid Client ID')
    ],
    contactController.createContact
);

/**
 * @route   GET /api/contacts/:contactId
 * @desc    Get a specific contact by ID
 * @access  Private (Lawyer only)
 */
router.get(
    '/:contactId',
    [
        param('contactId').isInt({ min: 1 }).withMessage('Invalid Contact ID')
    ],
    contactController.getContactById
);

/**
 * @route   PUT /api/contacts/:contactId
 * @desc    Update a contact for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.put(
    '/:contactId',
    [
        param('contactId').isInt({ min: 1 }).withMessage('Invalid Contact ID'),
        // Validation for update fields (all optional)
        body('name').optional().trim().isLength({ min:1, max: 255 }).withMessage('Name cannot be empty if provided'),
        body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email format').normalizeEmail(),
        body('phone').optional({ nullable: true }).trim().isLength({ max: 50 }),
        body('company').optional({ nullable: true }).trim().isLength({ max: 255 }),
        body('notes').optional({ nullable: true }).trim(),
        body('isClient').optional().isBoolean().toBoolean(),
        body('clientId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid Client ID')
    ],
    contactController.updateContact
);

/**
 * @route   DELETE /api/contacts/:contactId
 * @desc    Delete a contact for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.delete(
    '/:contactId',
    [
        param('contactId').isInt({ min: 1 }).withMessage('Invalid Contact ID')
    ],
    contactController.deleteContact
);

module.exports = router;