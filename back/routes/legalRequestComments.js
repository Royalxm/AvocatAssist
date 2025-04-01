const express = require('express');
const router = express.Router();
const legalRequestCommentController = require('../controllers/legalRequestCommentController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/legal-requests/:legalRequestId/comments
 * @desc    Create a new comment for a legal request
 * @access  Private
 */
router.post('/:legalRequestId/comments', authenticate, legalRequestCommentController.createComment);

/**
 * @route   GET /api/legal-requests/:legalRequestId/comments
 * @desc    Get comments for a legal request
 * @access  Private
 */
router.get('/:legalRequestId/comments', authenticate, legalRequestCommentController.getComments);

/**
 * @route   DELETE /api/legal-requests/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/comments/:commentId', authenticate, legalRequestCommentController.deleteComment);

module.exports = router;