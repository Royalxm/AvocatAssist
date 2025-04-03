const { db } = require('../config/database');

/**
 * Create a new direct message
 * @param {Object} messageData - { senderId, receiverId, content }
 * @param {Function} callback - Callback function (err, { messageId })
 */
exports.createMessage = (messageData, callback) => {
  const { senderId, receiverId, content } = messageData;
  const sql = `INSERT INTO DirectMessages (senderId, receiverId, content) VALUES (?, ?, ?)`;
  db.run(sql, [senderId, receiverId, content], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { messageId: this.lastID });
  });
};

/**
 * Get messages between two users (a conversation)
 * @param {Number} userId1 - ID of the first user
 * @param {Number} userId2 - ID of the second user
 * @param {Object} options - { page, limit }
 * @param {Function} callback - Callback function (err, { messages, pagination })
 */
exports.getConversation = (userId1, userId2, options, callback) => {
  const { page = 1, limit = 50 } = options; // Default limit higher for chat
  const offset = (page - 1) * limit;

  // Messages involving either user sending or receiving from the other
  const countSql = `
    SELECT COUNT(*) as total
    FROM DirectMessages
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
  `;
  const dataSql = `
    SELECT dm.*, sender.name as senderName, receiver.name as receiverName
    FROM DirectMessages dm
    JOIN Users sender ON dm.senderId = sender.id
    JOIN Users receiver ON dm.receiverId = receiver.id
    WHERE (dm.senderId = ? AND dm.receiverId = ?) OR (dm.senderId = ? AND dm.receiverId = ?)
    ORDER BY dm.createdAt ASC -- Show messages chronologically
    LIMIT ? OFFSET ?
  `;
  const params = [userId1, userId2, userId2, userId1];

  db.get(countSql, params, (err, row) => {
    if (err) {
      return callback(err);
    }
    const total = row.total;
    const totalPages = Math.ceil(total / limit);

    db.all(dataSql, [...params, limit, offset], (err, messages) => {
      if (err) {
        return callback(err);
      }
      callback(null, {
        messages,
        pagination: { page, limit, total, totalPages }
      });
    });
  });
};

/**
 * Get a list of recent conversations for a user
 * @param {Number} userId - The user's ID
 * @param {Function} callback - Callback function (err, conversations)
 */
exports.getRecentConversations = (userId, callback) => {
    // This query finds the latest message for each conversation partner
    // and joins with user details for the partner.
    const sql = `
        SELECT
            other_user.id as partnerId,
            other_user.name as partnerName,
            last_message.content as lastMessageContent,
            last_message.createdAt as lastMessageTimestamp,
            last_message.senderId as lastMessageSenderId,
            (SELECT COUNT(*) FROM DirectMessages dm_unread
             WHERE dm_unread.receiverId = ? AND dm_unread.senderId = other_user.id AND dm_unread.readAt IS NULL) as unreadCount
        FROM (
            SELECT
                CASE
                    WHEN senderId = ? THEN receiverId
                    ELSE senderId
                END as partner_id,
                MAX(createdAt) as max_createdAt
            FROM DirectMessages
            WHERE senderId = ? OR receiverId = ?
            GROUP BY partner_id
        ) as latest_conv
        JOIN DirectMessages last_message ON
            ( (last_message.senderId = ? AND last_message.receiverId = latest_conv.partner_id) OR
              (last_message.senderId = latest_conv.partner_id AND last_message.receiverId = ?) ) AND
            last_message.createdAt = latest_conv.max_createdAt
        JOIN Users other_user ON other_user.id = latest_conv.partner_id
        ORDER BY last_message.createdAt DESC;
    `;
    // Parameters: userId repeated multiple times for the query logic
    db.all(sql, [userId, userId, userId, userId, userId, userId], callback);
};


/**
 * Mark messages as read in a conversation
 * @param {Number} receiverId - The ID of the user reading the messages
 * @param {Number} senderId - The ID of the user who sent the messages
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.markAsRead = (receiverId, senderId, callback) => {
  const sql = `UPDATE DirectMessages SET readAt = CURRENT_TIMESTAMP
               WHERE receiverId = ? AND senderId = ? AND readAt IS NULL`;
  db.run(sql, [receiverId, senderId], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { changes: this.changes });
  });
};

// Note: Delete functionality might need careful consideration (e.g., delete for one user or both?)
// Add update functionality if needed (e.g., editing messages)