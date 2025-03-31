const { db } = require('../config/database');

class MessageModel {
  // Create a new message in a chat
  static create(chatId, sender, content, tokensUsed = 0) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Messages (chatId, sender, content, tokensUsed) VALUES (?, ?, ?, ?)';
      db.run(sql, [chatId, sender, content, tokensUsed], function (err) {
        if (err) {
          console.error('Error creating message:', err.message);
          return reject(err);
        }
        // The trigger 'update_chat_timestamp' in database.js handles updating Chats.updatedAt
        resolve({ id: this.lastID, chatId, sender, content, tokensUsed });
      });
    });
  }

  // Find messages by chat ID, ordered by creation time
  static findByChatId(chatId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Messages WHERE chatId = ? ORDER BY createdAt ASC';
      db.all(sql, [chatId], (err, rows) => {
        if (err) {
          console.error('Error finding messages by chat ID:', err.message);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Delete all messages for a specific chat (usually handled by CASCADE delete on Chats)
  // This might be useful for specific cleanup tasks if needed separately.
  static deleteByChatId(chatId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Messages WHERE chatId = ?';
      db.run(sql, [chatId], function (err) {
        if (err) {
          console.error('Error deleting messages by chat ID:', err.message);
          return reject(err);
        }
        resolve(this.changes); // Returns the number of deleted rows
      });
    });
  }

  // Update the content of a specific message
  static update(messageId, newContent) {
    return new Promise((resolve, reject) => {
      // The trigger 'update_message_timestamp' will update the 'updatedAt' field automatically
      const sql = 'UPDATE Messages SET content = ? WHERE id = ?';
      db.run(sql, [newContent, messageId], function (err) {
        if (err) {
          console.error('Error updating message:', err.message);
          return reject(err);
        }
        if (this.changes === 0) {
          // It's useful to know if the message wasn't found or didn't need updating
          return reject(new Error('Message not found or content unchanged.'));
        }
        resolve({ id: messageId, content: newContent });
      });
    });
  }

  // Delete a specific message by its ID
  static delete(messageId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Messages WHERE id = ?';
      db.run(sql, [messageId], function (err) {
        if (err) {
          console.error('Error deleting message:', err.message);
          return reject(err);
        }
        if (this.changes === 0) {
          return reject(new Error('Message not found.'));
        }
        resolve({ id: messageId, deleted: true });
      });
    });
  }
}

module.exports = MessageModel;