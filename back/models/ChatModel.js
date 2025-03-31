const { db } = require('../config/database');

class ChatModel {
  // Create a new chat, associated with either a project or a conversation
  static create(userId, options = {}) {
    return new Promise((resolve, reject) => {
      // Check that either projectId or conversationId is provided, but not both
      const { projectId, conversationId, title = 'New Chat' } = options;
      
      if ((projectId && conversationId) || (!projectId && !conversationId)) {
        return reject(new Error('Either projectId OR conversationId must be provided, but not both.'));
      }
      
      const sql = 'INSERT INTO Chats (userId, projectId, conversationId, title) VALUES (?, ?, ?, ?)';
      db.run(sql, [userId, projectId, conversationId, title], function (err) {
        if (err) {
          console.error('Error creating chat:', err.message);
          return reject(err);
        }
        resolve({ 
          id: this.lastID, 
          userId, 
          projectId, 
          conversationId, 
          title 
        });
      });
    });
  }

  // Find chats by user ID, optionally filtering by projectId or conversationId, ordered by last updated
  static findByUserId(userId, options = {}) {
    return new Promise((resolve, reject) => {
      const { projectId, conversationId } = options;
      let sql = 'SELECT * FROM Chats WHERE userId = ?';
      const params = [userId];

      if (projectId) {
        sql += ' AND projectId = ?';
        params.push(projectId);
      } else if (conversationId) {
        sql += ' AND conversationId = ?';
        params.push(conversationId);
      }

      sql += ' ORDER BY updatedAt DESC';

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error finding chats by user ID:', err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Find a single chat by ID and user ID
  static findById(chatId, userId) {
    return new Promise((resolve, reject) => {
      // Select all fields including projectId and conversationId
      const sql = 'SELECT * FROM Chats WHERE id = ? AND userId = ?';
      db.get(sql, [chatId, userId], (err, row) => {
        if (err) {
          console.error('Error finding chat by ID:', err.message);
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Update chat title
  static updateTitle(chatId, userId, newTitle) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE Chats SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?';
      db.run(sql, [newTitle, chatId, userId], function (err) {
        if (err) {
          console.error('Error updating chat title:', err.message);
          return reject(err);
        }
        resolve(this.changes > 0); // Returns true if a row was updated
      });
    });
  }

  // Delete a chat
  static delete(chatId, userId) {
    return new Promise((resolve, reject) => {
      // Note: Messages associated with this chat will be deleted automatically due to ON DELETE CASCADE
      const sql = 'DELETE FROM Chats WHERE id = ? AND userId = ?';
      db.run(sql, [chatId, userId], function (err) {
        if (err) {
          console.error('Error deleting chat:', err.message);
          return reject(err);
        }
        resolve(this.changes > 0); // Returns true if a row was deleted
      });
    });
  }
}

module.exports = ChatModel;
