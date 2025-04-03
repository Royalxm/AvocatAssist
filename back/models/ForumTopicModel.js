const { db } = require('../config/database');

/**
 * Create a new forum topic
 * @param {Object} topicData - { lawyerId, title, category }
 * @param {Function} callback - Callback function (err, { topicId })
 */
exports.createTopic = (topicData, callback) => {
  const { lawyerId, title, category } = topicData;
  const sql = `INSERT INTO ForumTopics (lawyerId, title, category, lastActivityAt)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
  db.run(sql, [lawyerId, title, category || null], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { topicId: this.lastID });
  });
};

/**
 * Get forum topics with pagination and author info
 * @param {Object} options - { page, limit, sortBy = 'lastActivityAt', order = 'DESC' }
 * @param {Function} callback - Callback function (err, { topics, pagination })
 */
exports.getTopics = (options, callback) => {
  const { page = 1, limit = 15, sortBy = 'lastActivityAt', order = 'DESC' } = options;
  const offset = (page - 1) * limit;
  const validSortColumns = ['lastActivityAt', 'createdAt', 'title', 'category'];
  const validOrder = ['ASC', 'DESC'];

  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'lastActivityAt';
  const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const countSql = 'SELECT COUNT(*) as total FROM ForumTopics';
  const dataSql = `
    SELECT
      ft.*,
      u.name as lawyerName,
      (SELECT COUNT(*) FROM ForumPosts fp WHERE fp.topicId = ft.id) as postCount
    FROM ForumTopics ft
    JOIN Users u ON ft.lawyerId = u.id
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  db.get(countSql, [], (err, row) => {
    if (err) {
      return callback(err);
    }
    const total = row.total;
    const totalPages = Math.ceil(total / limit);

    db.all(dataSql, [limit, offset], (err, topics) => {
      if (err) {
        return callback(err);
      }
      callback(null, {
        topics,
        pagination: { page, limit, total, totalPages }
      });
    });
  });
};

/**
 * Get a specific forum topic by ID, including author info
 * @param {Number} topicId - Topic ID
 * @param {Function} callback - Callback function (err, topic)
 */
exports.getTopicById = (topicId, callback) => {
  const sql = `
    SELECT
      ft.*,
      u.name as lawyerName
    FROM ForumTopics ft
    JOIN Users u ON ft.lawyerId = u.id
    WHERE ft.id = ?
  `;
  db.get(sql, [topicId], callback);
};

// Add updateTopic and deleteTopic functions later if needed