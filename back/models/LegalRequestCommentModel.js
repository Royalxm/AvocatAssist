const { db } = require('../config/database');

/**
 * Create a new comment for a legal request
 * @param {Object} commentData - Comment data
 * @param {Function} callback - Callback function
 */
exports.createComment = (commentData, callback) => {
  const { userId, legalRequestId, content } = commentData;
  
  // Insert comment
  db.run(
    'INSERT INTO LegalRequestComments (userId, legalRequestId, content, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [userId, legalRequestId, content],
    function(err) {
      if (err) {
        return callback(err);
      }
      
      // Get the created comment with user info
      exports.getCommentById(this.lastID, callback);
    }
  );
};

/**
 * Get comment by ID
 * @param {Number} id - Comment ID
 * @param {Function} callback - Callback function
 */
exports.getCommentById = (id, callback) => {
  const query = `
    SELECT c.*, u.name as userName, u.role as userRole
    FROM LegalRequestComments c
    JOIN Users u ON c.userId = u.id
    WHERE c.id = ?
  `;
  
  db.get(query, [id], (err, comment) => {
    if (err) {
      return callback(err);
    }
    
    if (!comment) {
      return callback(new Error('Commentaire non trouvé'));
    }
    
    callback(null, comment);
  });
};

/**
 * Get comments by legal request ID
 * @param {Number} legalRequestId - Legal request ID
 * @param {Function} callback - Callback function
 */
exports.getCommentsByLegalRequestId = (legalRequestId, callback) => {
  const query = `
    SELECT c.*, u.name as userName, u.role as userRole
    FROM LegalRequestComments c
    JOIN Users u ON c.userId = u.id
    WHERE c.legalRequestId = ?
    ORDER BY c.createdAt DESC
  `;
  
  db.all(query, [legalRequestId], (err, comments) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, comments || []);
  });
};

/**
 * Delete comment
 * @param {Number} id - Comment ID
 * @param {Number} userId - User ID (for authorization)
 * @param {Function} callback - Callback function
 */
exports.deleteComment = (id, userId, callback) => {
  // Check if comment exists and belongs to user
  db.get('SELECT * FROM LegalRequestComments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      return callback(err);
    }
    
    if (!comment) {
      return callback(new Error('Commentaire non trouvé'));
    }
    
    // Only the comment author can delete it
    if (comment.userId !== userId) {
      return callback(new Error('Non autorisé à supprimer ce commentaire'));
    }
    
    // Delete comment
    db.run('DELETE FROM LegalRequestComments WHERE id = ?', [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { id, deleted: true });
    });
  });
};