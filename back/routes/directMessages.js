const express = require('express');
const { body, param, query } = require('express-validator');
const directMessageController = require('../controllers/directMessageController');
const { authenticate, isLawyer } = require('../middleware/auth'); // Use isLawyer middleware

const router = express.Router();

// Apply authentication and lawyer check to all routes in this file
router.use(authenticate);
router.use(isLawyer); // Ensure only lawyers can access direct messaging features

/**
 * @route   GET /api/direct-messages/conversations
 * @desc    Get recent conversations list for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.get(
    '/conversations',
    directMessageController.getConversations
);

/**
 * @route   GET /api/direct-messages/:otherUserId
 * @desc    Get messages between logged-in lawyer and another lawyer
 * @access  Private (Lawyer only)
 */
router.get(
    '/:otherUserId',
    [
        param('otherUserId').isInt({ min: 1 }).withMessage('Invalid User ID'),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    ],
    directMessageController.getMessagesWithUser
);

/**
 * @route   POST /api/direct-messages/:receiverId
 * @desc    Send a direct message to another lawyer
 * @access  Private (Lawyer only)
 */
router.post(
    '/:receiverId',
    [
        param('receiverId').isInt({ min: 1 }).withMessage('Invalid Receiver ID'),
        body('content').notEmpty().withMessage('Message content cannot be empty').trim().isLength({ min: 1 })
    ],
    directMessageController.sendMessage
);

/**
 * @route   PUT /api/direct-messages/:senderId/read
 * @desc    Mark messages from a specific sender as read
 * @access  Private (Lawyer only)
 */
router.put(
    '/:senderId/read',
     [
        param('senderId').isInt({ min: 1 }).withMessage('Invalid Sender ID')
    ],
    directMessageController.markMessagesAsRead
);

module.exports = router;