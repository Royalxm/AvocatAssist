/**
 * Conversations Routes
 * API endpoints for conversations (quick AI assistance)
 */
const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/ConversationController');
const { auth } = require('../middleware/auth'); // Destructure the auth middleware

// All routes require authentication
router.use(auth);

// Get all conversations for the authenticated user
router.get('/', ConversationController.getAll);

// Get a conversation by ID
router.get('/:id', ConversationController.getById);

// Create a new conversation
router.post('/', ConversationController.create);

// Update a conversation
router.put('/:id', ConversationController.update);

// Delete a conversation
router.delete('/:id', ConversationController.delete);

// Add a message to a conversation
router.post('/:id/messages', ConversationController.addMessage);

// Update a message
router.put('/:conversationId/messages/:messageId', ConversationController.updateMessage);

// Delete a message
router.delete('/:conversationId/messages/:messageId', ConversationController.deleteMessage);

module.exports = router;
