const express = require('express');
const { query, body } = require('express-validator');
const legalNewsController = require('../controllers/legalNewsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/legal-news
 * @desc    Get latest legal news items with pagination
 * @access  Private (Authenticated users, e.g., Lawyers)
 */
router.get(
    '/',
    authenticate, // All authenticated users can view news
    [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
    ],
    legalNewsController.getNews
);

/**
 * @route   POST /api/legal-news
 * @desc    Add a new news item (Admin/System only)
 * @access  Private (Admin only) - Protected by authorize middleware
 */
router.post(
    '/',
    authenticate,
    authorize(['support', 'manager']), // Only admins can add news items directly via API
    [
        body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 500 }),
        body('link').notEmpty().withMessage('Link is required').isURL().withMessage('Link must be a valid URL'),
        body('source').optional({ nullable: true }).trim().isLength({ max: 255 }),
        body('pubDate').optional({ nullable: true }).isISO8601().withMessage('Publication date must be a valid ISO 8601 date string'),
        body('description').optional({ nullable: true }).trim()
    ],
    legalNewsController.addNewsItem
);

// Add routes for deleting/managing news items later if needed (likely admin only)

module.exports = router;