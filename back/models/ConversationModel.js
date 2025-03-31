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
        INSERT INTO conversations (userId, title, createdAt, updatedAt)
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
            
            resolve(ConversationModel.formatConversation(conversation));
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
               (SELECT COUNT(*) FROM Messages m JOIN Chats ch ON m.chatId = ch.id WHERE ch.conversationId = c.id) as message_count,
               (SELECT MAX(m.createdAt) FROM Messages m JOIN Chats ch ON m.chatId = ch.id WHERE ch.conversationId = c.id) as last_message_at
        FROM Conversations c
        WHERE c.userId = ?
        ORDER BY c.updatedAt DESC
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
        SELECT * FROM Conversations
        WHERE id = ? AND userId = ?
      `;
      
      db.get(conversationQuery, [id, userId], (err, conversation) => {
        if (err) {
          console.error('Error fetching conversation:', err.message);
          return reject(err);
        }
        
        if (!conversation) {
          // Use reject for errors, resolve(null) for not found
          return resolve(null); 
        }
        
        // Then get the messages for this conversation
        // Fetch messages associated with the chat linked to this conversation
        const messagesQuery = `
          SELECT m.*
          FROM Messages m
          JOIN Chats c ON m.chatId = c.id
          WHERE c.conversationId = ?
          ORDER BY m.createdAt ASC
        `;
        
        db.all(messagesQuery, [id], (err, messages) => {
          if (err) {
            console.error('Error fetching messages:', err.message);
            return reject(err);
          }
          
          const formattedConversation = this.formatConversation(conversation);
          formattedConversation.messages = messages.map(ConversationModel.formatMessage); // Use static call
          
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
        UPDATE Conversations
        SET title = ?, updatedAt = datetime('now')
        WHERE id = ? AND userId = ?
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
            
            resolve(ConversationModel.formatConversation(conversation));
          }
        );
      });
    });
  }

  /**
   * Update last suggested questions for a conversation
   * @param {number} conversationId - Conversation ID
   * @param {Array<string>} suggestedQuestions - Array of suggested questions
   * @returns {Promise<boolean>} Success status
   */
  static updateLastSuggestedQuestions(conversationId, suggestedQuestions) {
    return new Promise((resolve, reject) => {
      const suggestionsJson = JSON.stringify(suggestedQuestions);
      const sql = 'UPDATE Conversations SET lastSuggestedQuestions = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
      db.run(sql, [suggestionsJson, conversationId], function (err) {
        if (err) {
          console.error('Error updating conversation suggestions:', err.message);
          return reject(err);
        }
        resolve(this.changes > 0); // Returns true if a row was updated
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
          DELETE FROM Conversations
          WHERE id = ? AND userId = ?
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
  
  // Note: addMessage functionality is handled by ChatModel.addMessage
  // Messages are linked via chatId, not directly to conversationId.
  
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
      // Check ownership by joining Messages and Chats tables
      const checkOwnershipQuery = `
        SELECT ch.userId
        FROM Messages m
        JOIN Chats ch ON m.chatId = ch.id
        WHERE m.id = ?
      `;
      
      db.get(checkOwnershipQuery, [id], (err, result) => {
        if (err) {
          console.error('Error checking message ownership:', err.message);
          return reject(err);
        }
        
        if (!result || result.userId !== userId) {
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
              
              resolve(ConversationModel.formatMessage(message));
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
      // Check ownership by joining Messages and Chats tables
      const checkOwnershipQuery = `
        SELECT ch.userId
        FROM Messages m
        JOIN Chats ch ON m.chatId = ch.id
        WHERE m.id = ?
      `;
      
      db.get(checkOwnershipQuery, [id], (err, result) => {
        if (err) {
          console.error('Error checking message ownership:', err.message);
          return reject(err);
        }
        
        if (!result || result.userId !== userId) {
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
    
    // Safely parse lastSuggestedQuestions
    let suggestions = [];
    if (conversation.lastSuggestedQuestions) {
      try {
        suggestions = JSON.parse(conversation.lastSuggestedQuestions);
        if (!Array.isArray(suggestions)) {
          suggestions = []; // Ensure it's an array
        }
      } catch (e) {
        console.error(`Error parsing suggestions for conversation ${conversation.id}:`, e);
        suggestions = []; // Default to empty array on error
      }
    }

    return {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      messageCount: conversation.message_count || 0,
      lastMessageAt: conversation.last_message_at || null,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      lastSuggestedQuestions: suggestions // Return parsed array
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
      chatId: message.chatId, // Use chatId as per schema
      sender: message.sender,
      content: message.content,
      timestamp: message.created_at,
      updatedAt: message.updated_at
    };
  }
}

module.exports = ConversationModel;
