const LegalNewsModel = require('../models/LegalNewsModel');
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get latest legal news items with pagination
 * @route GET /api/legal-news
 * @access Private (Authenticated users, e.g., Lawyers)
 */
exports.getNews = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    LegalNewsModel.getLatestNews({ page, limit }, (err, result) => {
        if (err) {
            throw new AppError('Failed to fetch legal news', 500, err);
        }
        res.status(200).json({ success: true, ...result });
    });
});

/**
 * Add a news item (Admin/Background Job access typically)
 * @route POST /api/legal-news
 * @access Private (Admin/System) - Requires appropriate authorization middleware
 */
exports.addNewsItem = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    // TODO: Add authorization check here - only admins or a system process should add news
    // Example: if (!['manager', 'support'].includes(req.user.role)) { throw new AppError('Unauthorized', 403); }

    const { title, link, source, pubDate, description } = req.body;

     if (!title || !link) {
         throw new AppError('Title and link are required for news items.', 400);
    }
     // Optional: Validate pubDate format if provided
     if (pubDate && isNaN(Date.parse(pubDate))) {
         throw new AppError('Invalid publication date format. Use ISO 8601.', 400);
     }

    const itemData = { title, link, source, pubDate, description };

    LegalNewsModel.addNewsItem(itemData, (err, result) => {
        if (err) {
            throw new AppError('Failed to add news item', 500, err);
        }
        if (result.inserted) {
            res.status(201).json({ success: true, message: 'News item added successfully', itemId: result.itemId });
        } else {
             res.status(200).json({ success: true, message: 'News item with this link already exists.', skipped: true });
        }
    });
});