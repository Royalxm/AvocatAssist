const DirectMessageModel = require('../models/DirectMessageModel');
const UserModel = require('../models/UserModel'); // To verify receiver exists and is a lawyer
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get recent direct message conversations for the logged-in lawyer
 * @route GET /api/direct-messages/conversations
 * @access Private (Lawyer)
 */
exports.getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Ensure user is a lawyer (redundant if route middleware handles it)
    if (req.user.role !== 'lawyer') {
        throw new AppError('Access denied.', 403);
    }

    DirectMessageModel.getRecentConversations(userId, (err, conversations) => {
        if (err) {
            throw new AppError('Failed to fetch conversations', 500, err);
        }
        res.status(200).json({ success: true, conversations });
    });
});

/**
 * Get messages between the logged-in lawyer and another lawyer
 * @route GET /api/direct-messages/:otherUserId
 * @access Private (Lawyer)
 */
exports.getMessagesWithUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const userId1 = req.user.id;
    const userId2 = parseInt(req.params.otherUserId, 10);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Ensure user is a lawyer
    if (req.user.role !== 'lawyer') {
        throw new AppError('Access denied.', 403);
    }
    // Ensure target user is also a lawyer (optional, based on requirements)
    // You might fetch the other user's role here if needed

    DirectMessageModel.getConversation(userId1, userId2, { page, limit }, (err, result) => {
        if (err) {
            throw new AppError('Failed to fetch messages', 500, err);
        }
        res.status(200).json({ success: true, ...result });
    });
});

/**
 * Send a direct message to another lawyer
 * @route POST /api/direct-messages/:receiverId
 * @access Private (Lawyer)
 */
exports.sendMessage = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const senderId = req.user.id;
    const receiverId = parseInt(req.params.receiverId, 10);
    const { content } = req.body;

    // Ensure sender is a lawyer
    if (req.user.role !== 'lawyer') {
        throw new AppError('Only lawyers can send direct messages.', 403);
    }
    // Ensure receiver is not the sender
    if (senderId === receiverId) {
        throw new AppError('Cannot send messages to yourself.', 400);
    }

    // Verify receiver exists and is a lawyer
    UserModel.getUserById(receiverId, (err, receiver) => {
        if (err) {
            throw new AppError('Error verifying receiver', 500, err);
        }
        if (!receiver) {
            throw new AppError('Receiver not found.', 404);
        }
        if (receiver.role !== 'lawyer') {
            throw new AppError('Can only send direct messages to other lawyers.', 403);
        }

        // Receiver is valid, create message
        DirectMessageModel.createMessage({ senderId, receiverId, content }, (err, result) => {
            if (err) {
                throw new AppError('Failed to send message', 500, err);
            }
            // TODO: Implement real-time notification (e.g., WebSockets)
            res.status(201).json({ success: true, message: 'Message sent successfully', messageId: result.messageId });
        });
    });
});

/**
 * Mark messages from a specific sender as read
 * @route PUT /api/direct-messages/:senderId/read
 * @access Private (Lawyer)
 */
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const receiverId = req.user.id; // The user marking messages as read
    const senderId = parseInt(req.params.senderId, 10);

     // Ensure user is a lawyer
    if (req.user.role !== 'lawyer') {
        throw new AppError('Access denied.', 403);
    }

    DirectMessageModel.markAsRead(receiverId, senderId, (err, result) => {
        if (err) {
            throw new AppError('Failed to mark messages as read', 500, err);
        }
        res.status(200).json({ success: true, message: 'Messages marked as read', changes: result.changes });
    });
});