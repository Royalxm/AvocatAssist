const express = require('express');
const chatController = require('../controllers/ChatController');
const authMiddleware = require('../middleware/auth'); // Assuming you have auth middleware

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authMiddleware.auth); // Use the correct exported function name 'auth'

// GET /api/chats - Get all chats for the logged-in user
router.get('/', chatController.getUserChats);

// POST /api/chats - Create a new chat
router.post('/', chatController.createChat);

// GET /api/chats/:chatId - Get a specific chat and its messages
router.get('/:chatId', chatController.getChatById);

// PUT /api/chats/:chatId - Update chat title
router.put('/:chatId', chatController.updateChatTitle);

// DELETE /api/chats/:chatId - Delete a chat
router.delete('/:chatId', chatController.deleteChat);

// --- Message Routes ---

// PUT /api/chats/:chatId/messages/:messageId - Update a specific message
router.put('/:chatId/messages/:messageId', chatController.updateMessage);

// DELETE /api/chats/:chatId/messages/:messageId - Delete a specific message
router.delete('/:chatId/messages/:messageId', chatController.deleteMessage);


module.exports = router;