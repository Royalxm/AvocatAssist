const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');

// Get chats for the logged-in user, optionally filtered by projectId or conversationId
exports.getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached by auth middleware
    const { projectId, conversationId } = req.query; // Get optional filter parameters

    const options = {};
    
    if (projectId) {
      options.projectId = parseInt(projectId, 10);
      if (isNaN(options.projectId)) {
        return res.status(400).json({ message: 'Invalid Project ID format in query parameter.' });
      }
    } else if (conversationId) {
      options.conversationId = parseInt(conversationId, 10);
      if (isNaN(options.conversationId)) {
        return res.status(400).json({ message: 'Invalid Conversation ID format in query parameter.' });
      }
    }

    // Pass userId and options to the model
    const chats = await ChatModel.findByUserId(userId, options);
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

// Get a specific chat and its messages
exports.getChatById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    if (isNaN(chatId)) {
        return res.status(400).json({ message: 'Invalid chat ID format.' });
    }

    const chat = await ChatModel.findById(chatId, userId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    const messages = await MessageModel.findByChatId(chatId);
    res.status(200).json({ ...chat, messages });
  } catch (error) {
    next(error);
  }
};

// Create a new chat linked to either a project or a conversation
exports.createChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, conversationId, title } = req.body;

    // Validate that either projectId or conversationId is provided, but not both
    if ((!projectId && !conversationId) || (projectId && conversationId)) {
      return res.status(400).json({ 
        message: 'Either Project ID OR Conversation ID must be provided, but not both.' 
      });
    }

    const options = { title };

    if (projectId) {
      options.projectId = parseInt(projectId, 10);
      if (isNaN(options.projectId)) {
        return res.status(400).json({ message: 'Invalid Project ID format.' });
      }
    } else {
      options.conversationId = parseInt(conversationId, 10);
      if (isNaN(options.conversationId)) {
        return res.status(400).json({ message: 'Invalid Conversation ID format.' });
      }
    }

    // Create the chat with the appropriate association
    const newChat = await ChatModel.create(userId, options);
    res.status(201).json(newChat);
  } catch (error) {
    // Handle potential foreign key constraint errors
    if (error.message.includes('FOREIGN KEY constraint failed')) {
       return res.status(400).json({ message: 'Invalid Project ID or Conversation ID provided.' });
    }
    next(error);
  }
};

// Update chat title
exports.updateChatTitle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);
    const { title } = req.body;

     if (isNaN(chatId)) {
        return res.status(400).json({ message: 'Invalid chat ID format.' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
    }

    const updated = await ChatModel.updateTitle(chatId, userId, title.trim());
    if (!updated) {
      return res.status(404).json({ message: 'Chat not found or failed to update.' });
    }
    res.status(200).json({ message: 'Chat title updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// Update a specific message within a chat
exports.updateMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);
    const messageId = parseInt(req.params.messageId, 10);
    const { content } = req.body;

    if (isNaN(chatId) || isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid chat or message ID format.' });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required and must be non-empty.' });
    }

    // 1. Verify user owns the chat
    const chat = await ChatModel.findById(chatId, userId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    // 2. TODO: Verify the message actually belongs to this chat and potentially the user (if only users can edit their own)
    //    For now, we assume if the user owns the chat, they can edit any message in it.
    //    A more robust check would involve fetching the message first:
    //    const message = await MessageModel.findById(messageId); // Need to add findById to MessageModel
    //    if (!message || message.chatId !== chatId) { return res.status(404).json({ message: 'Message not found in this chat.' }); }
    //    if (message.sender !== 'user') { return res.status(403).json({ message: 'Cannot edit AI messages.' }); }

    const updatedMessage = await MessageModel.update(messageId, content.trim());
    res.status(200).json({ message: 'Message updated successfully.', updatedMessage });

  } catch (error) {
     // Handle specific errors from the model, e.g., "Message not found"
     if (error.message.includes('Message not found')) {
        return res.status(404).json({ message: error.message });
     }
    next(error);
  }
};

// Delete a specific message within a chat
exports.deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);
    const messageId = parseInt(req.params.messageId, 10);

     if (isNaN(chatId) || isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid chat or message ID format.' });
    }

    // 1. Verify user owns the chat
    const chat = await ChatModel.findById(chatId, userId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    // 2. TODO: Add verification that the message belongs to the chat and potentially the user.
    //    Similar checks as in updateMessage apply here.

    const deletedResult = await MessageModel.delete(messageId);
    res.status(200).json({ message: 'Message deleted successfully.', deletedResult });

  } catch (error) {
    // Handle specific errors from the model, e.g., "Message not found"
     if (error.message.includes('Message not found')) {
        return res.status(404).json({ message: error.message });
     }
    next(error);
  }
};

// Delete a chat
exports.deleteChat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

     if (isNaN(chatId)) {
        return res.status(400).json({ message: 'Invalid chat ID format.' });
    }

    const deleted = await ChatModel.delete(chatId, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Chat not found or failed to delete.' });
    }
    res.status(200).json({ message: 'Chat deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
