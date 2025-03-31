/**
 * Conversation Model
 * Handles database operations for conversations (quick AI assistance)
 */
const { db } = require('../config/database');

class ConversationModel {
  /**
   * Create a new conversation
   * @param {Object} data - Conversation data
   * @param {string} data.userId - User ID
   * @param {string} data.title - Conversation title
   * @returns {Promise<Object>} Created conversation
   */
  static create(data) {
    return new Promise((resolve, reject) => {
      const { userId, title } = data;
      
      if (!userId || !title) {
        return reject(new Error('User ID and title are required'));
      }
      
      const query = `
        INSERT INTO conversations (user_id, title, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `;
      
      db.run(query, [userId, title], function(err) {
        if (err) {
          console.error('Error creating conversation:', err.message);
          return reject(err);
        }
        
        // Get the created conversation
        db.get(
          'SELECT * FROM conversations WHERE id = ?',
          [this.lastID],
          (err, conversation) => {
            if (err) {
              console.error('Error fetching created conversation:', err.message);
              return reject(err);
            }
            
            resolve(this.formatConversation(conversation));
          }
        );
      });
    });
  }
  
  /**
   * Get all conversations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of conversations
   */
  static getAllByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
               (SELECT MAX(created_at) FROM messages m WHERE m.conversation_id = c.id) as last_message_at
        FROM conversations c
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
      `;
      
      db.all(query, [userId], (err, conversations) => {
        if (err) {
          console.error('Error fetching conversations:', err.message);
          return reject(err);
        }
        
        resolve(conversations.map(this.formatConversation));
      });
    });
  }
  
  /**
   * Get a conversation by ID
   * @param {string} id - Conversation ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Conversation with messages
   */
  static getById(id, userId) {
    return new Promise((resolve, reject) => {
      // First get the conversation
      const conversationQuery = `
        SELECT * FROM conversations
        WHERE id = ? AND user_id = ?
      `;
      
      db.get(conversationQuery, [id, userId], (err, conversation) => {
        if (err) {
          console.error('Error fetching conversation:', err.message);
          return reject(err);
        }
        
        if (!conversation) {
          return reject(new Error('Conversation not found'));
        }
        
        // Then get the messages for this conversation
        const messagesQuery = `
          SELECT * FROM messages
          WHERE conversation_id = ?
          ORDER BY created_at ASC
        `;
        
        db.all(messagesQuery, [id], (err, messages) => {
          if (err) {
            console.error('Error fetching messages:', err.message);
            return reject(err);
          }
          
          const formattedConversation = this.formatConversation(conversation);
          formattedConversation.messages = messages.map(this.formatMessage);
          
          resolve(formattedConversation);
        });
      });
    });
  }
  
  /**
   * Update a conversation
   * @param {string} id - Conversation ID
   * @param {Object} data - Updated data
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated conversation
   */
  static update(id, data, userId) {
    return new Promise((resolve, reject) => {
      const { title } = data;
      
      if (!title) {
        return reject(new Error('Title is required'));
      }
      
      const query = `
        UPDATE conversations
        SET title = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `;
      
      db.run(query, [title, id, userId], function(err) {
        if (err) {
          console.error('Error updating conversation:', err.message);
          return reject(err);
        }
        
        if (this.changes === 0) {
          return reject(new Error('Conversation not found or not authorized'));
        }
        
        // Get the updated conversation
        db.get(
          'SELECT * FROM conversations WHERE id = ?',
          [id],
          (err, conversation) => {
            if (err) {
              console.error('Error fetching updated conversation:', err.message);
              return reject(err);
            }
            
            resolve(this.formatConversation(conversation));
          }
        );
      });
    });
  }
  
  /**
   * Delete a conversation
   * @param {string} id - Conversation ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  static delete(id, userId) {
    return new Promise((resolve, reject) => {
      // First delete all messages in the conversation
      const deleteMessagesQuery = `
        DELETE FROM messages
        WHERE conversation_id = ?
      `;
      
      db.run(deleteMessagesQuery, [id], (err) => {
        if (err) {
          console.error('Error deleting messages:', err.message);
          return reject(err);
        }
        
        // Then delete the conversation
        const deleteConversationQuery = `
          DELETE FROM conversations
          WHERE id = ? AND user_id = ?
        `;
        
        db.run(deleteConversationQuery, [id, userId], function(err) {
          if (err) {
            console.error('Error deleting conversation:', err.message);
            return reject(err);
          }
          
          if (this.changes === 0) {
            return reject(new Error('Conversation not found or not authorized'));
          }
          
          resolve(true);
        });
      });
    });
  }
  
  /**
   * Add a message to a conversation
   * @param {Object} data - Message data
   * @param {string} data.conversationId - Conversation ID
   * @param {string} data.sender - Message sender (user or ai)
   * @param {string} data.content - Message content
   * @returns {Promise<Object>} Created message
   */
  static addMessage(data) {
    return new Promise((resolve, reject) => {
      const { conversationId, sender, content } = data;
      
      if (!conversationId || !sender || !content) {
        return reject(new Error('Conversation ID, sender, and content are required'));
      }
      
      // First update the conversation's updated_at timestamp
      const updateConversationQuery = `
        UPDATE conversations
        SET updated_at = datetime('now')
        WHERE id = ?
      `;
      
      db.run(updateConversationQuery, [conversationId], (err) => {
        if (err) {
          console.error('Error updating conversation timestamp:', err.message);
          return reject(err);
        }
        
        // Then insert the message
        const insertMessageQuery = `
          INSERT INTO messages (conversation_id, sender, content, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(insertMessageQuery, [conversationId, sender, content], function(err) {
          if (err) {
            console.error('Error adding message:', err.message);
            return reject(err);
          }
          
          // Get the created message
          db.get(
            'SELECT * FROM messages WHERE id = ?',
            [this.lastID],
            (err, message) => {
              if (err) {
                console.error('Error fetching created message:', err.message);
                return reject(err);
              }
              
              resolve(this.formatMessage(message));
            }
          );
        });
      });
    });
  }
  
  /**
   * Update a message
   * @param {string} id - Message ID
   * @param {Object} data - Updated data
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated message
   */
  static updateMessage(id, data, userId) {
    return new Promise((resolve, reject) => {
      const { content } = data;
      
      if (!content) {
        return reject(new Error('Content is required'));
      }
      
      // First check if the user owns the conversation containing this message
      const checkOwnershipQuery = `
        SELECT c.user_id
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ?
      `;
      
      db.get(checkOwnershipQuery, [id], (err, result) => {
        if (err) {
          console.error('Error checking message ownership:', err.message);
          return reject(err);
        }
        
        if (!result || result.user_id !== userId) {
          return reject(new Error('Message not found or not authorized'));
        }
        
        // Then update the message
        const updateMessageQuery = `
          UPDATE messages
          SET content = ?, updated_at = datetime('now')
          WHERE id = ?
        `;
        
        db.run(updateMessageQuery, [content, id], function(err) {
          if (err) {
            console.error('Error updating message:', err.message);
            return reject(err);
          }
          
          // Get the updated message
          db.get(
            'SELECT * FROM messages WHERE id = ?',
            [id],
            (err, message) => {
              if (err) {
                console.error('Error fetching updated message:', err.message);
                return reject(err);
              }
              
              resolve(this.formatMessage(message));
            }
          );
        });
      });
    });
  }
  
  /**
   * Delete a message
   * @param {string} id - Message ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  static deleteMessage(id, userId) {
    return new Promise((resolve, reject) => {
      // First check if the user owns the conversation containing this message
      const checkOwnershipQuery = `
        SELECT c.user_id
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ?
      `;
      
      db.get(checkOwnershipQuery, [id], (err, result) => {
        if (err) {
          console.error('Error checking message ownership:', err.message);
          return reject(err);
        }
        
        if (!result || result.user_id !== userId) {
          return reject(new Error('Message not found or not authorized'));
        }
        
        // Then delete the message
        const deleteMessageQuery = `
          DELETE FROM messages
          WHERE id = ?
        `;
        
        db.run(deleteMessageQuery, [id], function(err) {
          if (err) {
            console.error('Error deleting message:', err.message);
            return reject(err);
          }
          
          resolve(true);
        });
      });
    });
  }
  
  /**
   * Format a conversation object from the database
   * @param {Object} conversation - Conversation from database
   * @returns {Object} Formatted conversation
   */
  static formatConversation(conversation) {
    if (!conversation) return null;
    
    return {
      id: conversation.id,
      userId: conversation.user_id,
      title: conversation.title,
      messageCount: conversation.message_count || 0,
      lastMessageAt: conversation.last_message_at || null,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    };
  }
  
  /**
   * Format a message object from the database
   * @param {Object} message - Message from database
   * @returns {Object} Formatted message
   */
  static formatMessage(message) {
    if (!message) return null;
    
    return {
      id: message.id,
      conversationId: message.conversation_id,
      sender: message.sender,
      content: message.content,
      timestamp: message.created_at,
      updatedAt: message.updated_at
    };
  }
}

module.exports = ConversationModel;
