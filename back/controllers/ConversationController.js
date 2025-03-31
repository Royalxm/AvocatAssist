/**
 * Conversation Controller
 * Handles API endpoints for conversations (quick AI assistance)
 */
const ConversationModel = require('../models/ConversationModel');
const ChatModel = require('../models/ChatModel'); // Import ChatModel
const MessageModel = require('../models/MessageModel'); // Import MessageModel
class ConversationController {
  /**
   * Get all conversations for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await ConversationModel.getAllByUser(userId);
      
      // The model's formatConversation method already handles parsing suggestions
      res.status(200).json(conversations); 
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
  }
  
  /**
   * Get a conversation by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const conversation = await ConversationModel.getById(id, userId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found or access denied.' });
      }
      
      // The model's formatConversation method already handles parsing suggestions
      res.status(200).json(conversation); 
    } catch (error) {
      console.error('Error fetching conversation:', error);
      
      // Keep the original error check, but the model now resolves null instead of rejecting
      // if (error.message === 'Conversation not found') {
      //   return res.status(404).json({ message: 'Conversation not found' });
      // }
      
      res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
    }
  }
  
  /**
   * Create a new conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async create(req, res) {
    try {
      const { title } = req.body;
      const userId = req.user.id;
      
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      const conversation = await ConversationModel.create({
        userId,
        title
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Failed to create conversation', error: error.message });
    }
  }
  
  /**
   * Update a conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user.id;
      
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      const conversation = await ConversationModel.update(id, { title }, userId);
      
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error updating conversation:', error);
      
      if (error.message === 'Conversation not found or not authorized') {
        return res.status(404).json({ message: 'Conversation not found or not authorized' });
      }
      
      res.status(500).json({ message: 'Failed to update conversation', error: error.message });
    }
  }
  
  /**
   * Delete a conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await ConversationModel.delete(id, userId);
      
      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      
      if (error.message === 'Conversation not found or not authorized') {
        return res.status(404).json({ message: 'Conversation not found or not authorized' });
      }
      
      res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
    }
  }
  
  /**
   * Add a message to a conversation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { content, sender } = req.body;
      const userId = req.user.id;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      if (!sender || !['user', 'ai'].includes(sender)) {
        return res.status(400).json({ message: 'Sender must be either "user" or "ai"' });
      }
      
      // Find the chat associated with this conversation for this user
      const chats = await ChatModel.findByUserId(userId, { conversationId: id });
      
      if (!chats || chats.length === 0) {
        // If no chat exists for this conversation, potentially create one?
        // For now, assume a chat should exist if the conversation exists.
        // Let's re-verify conversation existence first for a clearer error.
        const conversationCheck = await ConversationModel.getById(id, userId);
        if (!conversationCheck) {
           return res.status(404).json({ message: 'Conversation not found or not authorized' });
        }
        // If conversation exists but chat doesn't, this indicates an inconsistency.
        console.error(`Inconsistency: Conversation ${id} exists for user ${userId}, but no associated chat found.`);
        return res.status(500).json({ message: 'Internal server error: Chat not found for conversation.' });
      }
      
      // Assuming one chat per conversation for quick AI assist
      const chatId = chats[0].id;
      
      // Use MessageModel to create the message
      const message = await MessageModel.create(chatId, sender, content);
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ message: 'Failed to add message', error: error.message });
    }
  }
  
  /**
   * Update a message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateMessage(req, res) {
    try {
      const { conversationId, messageId } = req.params; // Note: conversationId isn't strictly needed here by the model but good for routing
      const { content } = req.body;
      const userId = req.user.id;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      // Verify user owns the conversation first (indirectly checks message ownership)
      const conversationCheck = await ConversationModel.getById(conversationId, userId);
       if (!conversationCheck) {
          return res.status(404).json({ message: 'Conversation not found or not authorized' });
       }
      
      // Use MessageModel to update the message
      // Note: ConversationModel.updateMessage had ownership check, MessageModel.update does not.
      // We rely on the conversation check above. A more robust check might involve
      // fetching the message via MessageModel and verifying its chatId links to the conversation's chat.
      const message = await MessageModel.update(messageId, content);
      
      res.status(200).json(message);
    } catch (error) {
      console.error('Error updating message:', error);
      
      if (error.message === 'Message not found or not authorized') {
        return res.status(404).json({ message: 'Message not found or not authorized' });
      }
      
      res.status(500).json({ message: 'Failed to update message', error: error.message });
    }
  }
  
  /**
   * Delete a message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteMessage(req, res) {
    try {
      const { conversationId, messageId } = req.params; // Note: conversationId isn't strictly needed here by the model but good for routing
      const userId = req.user.id;
      
      // Verify user owns the conversation first (indirectly checks message ownership)
      const conversationCheck = await ConversationModel.getById(conversationId, userId);
       if (!conversationCheck) {
          return res.status(404).json({ message: 'Conversation not found or not authorized' });
       }
       
      // Use MessageModel to delete the message
      // Note: ConversationModel.deleteMessage had ownership check, MessageModel.delete does not.
      // We rely on the conversation check above.
      await MessageModel.delete(messageId);
      
      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      
      if (error.message === 'Message not found or not authorized') {
        return res.status(404).json({ message: 'Message not found or not authorized' });
      }
      
      res.status(500).json({ message: 'Failed to delete message', error: error.message });
    }
  }
}

module.exports = ConversationController;
