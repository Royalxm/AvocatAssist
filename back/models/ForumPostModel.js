const { db } = require('../config/database');

/**
 * Create a new forum post
 * @param {Object} postData - { topicId, lawyerId, content }
 * @param {Function} callback - Callback function (err, { postId })
 */
exports.createPost = (postData, callback) => {
  const { topicId, lawyerId, content } = postData;
  // The trigger 'update_forum_topic_activity' will update ForumTopics.lastActivityAt
  const sql = `INSERT INTO ForumPosts (topicId, lawyerId, content) VALUES (?, ?, ?)`;
  db.run(sql, [topicId, lawyerId, content], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { postId: this.lastID });
  });
};

/**
 * Get posts for a specific topic with pagination and author info
 * @param {Number} topicId - Topic ID
 * @param {Object} options - { page, limit, order = 'ASC' } // Default to ASC for chronological order
 * @param {Function} callback - Callback function (err, { posts, pagination })
 */
exports.getPostsByTopicId = (topicId, options, callback) => {
  const { page = 1, limit = 20, order = 'ASC' } = options; // Default order ASC
  const offset = (page - 1) * limit;
  const validOrder = ['ASC', 'DESC'];
  const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

  const countSql = 'SELECT COUNT(*) as total FROM ForumPosts WHERE topicId = ?';
  const dataSql = `
    SELECT
      fp.*,
      u.name as lawyerName
    FROM ForumPosts fp
    JOIN Users u ON fp.lawyerId = u.id
    WHERE fp.topicId = ?
    ORDER BY fp.createdAt ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  db.get(countSql, [topicId], (err, row) => {
    if (err) {
      return callback(err);
    }
    const total = row.total;
    const totalPages = Math.ceil(total / limit);

    db.all(dataSql, [topicId, limit, offset], (err, posts) => {
      if (err) {
        return callback(err);
      }
      callback(null, {
        posts,
        pagination: { page, limit, total, totalPages }
      });
    });
  });
};

/**
 * Get a specific forum post by ID
 * @param {Number} postId - Post ID
 * @param {Function} callback - Callback function (err, post)
 */
exports.getPostById = (postId, callback) => {
  const sql = `
    SELECT
      fp.*,
      u.name as lawyerName
    FROM ForumPosts fp
    JOIN Users u ON fp.lawyerId = u.id
    WHERE fp.id = ?
  `;
  db.get(sql, [postId], callback);
};

/**
 * Update a forum post
 * @param {Number} postId - Post ID
 * @param {String} content - New content
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.updatePost = (postId, content, callback) => {
    const sql = `UPDATE ForumPosts SET content = ? WHERE id = ?`;
    db.run(sql, [content, postId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};

/**
 * Delete a forum post
 * @param {Number} postId - Post ID
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.deletePost = (postId, callback) => {
    const sql = `DELETE FROM ForumPosts WHERE id = ?`;
    db.run(sql, [postId], function(err) {
        if (err) {
            return callback(err);
        }
        // Note: Deleting a post doesn't update ForumTopics.lastActivityAt automatically
        // This might be acceptable, or require more complex logic if needed.
        callback(null, { changes: this.changes });
    });
};