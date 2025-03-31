const { db } = require('../config/database');

/**
 * Query model
 * Handles database operations for AI queries
 */
const QueryModel = {
  /**
   * Create a new query
   * @param {Object} queryData - Query data
   * @param {Function} callback - Callback function
   */
  createQuery: (queryData, callback) => {
    const { userId, question, response, tokensUsed } = queryData;
    
    const sql = `
      INSERT INTO Queries (userId, question, response, tokensUsed)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [userId, question, response, tokensUsed || 0],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        // Get the created query
        QueryModel.getQueryById(this.lastID, callback);
      }
    );
  },
  
  /**
   * Get query by ID
   * @param {Number} id - Query ID
   * @param {Function} callback - Callback function
   */
  getQueryById: (id, callback) => {
    const sql = `
      SELECT q.id, q.userId, q.question, q.response, q.tokensUsed, q.createdAt,
             u.name as userName, u.email as userEmail
      FROM Queries q
      JOIN Users u ON q.userId = u.id
      WHERE q.id = ?
    `;
    
    db.get(sql, [id], (err, query) => {
      if (err) {
        return callback(err);
      }
      
      if (!query) {
        return callback(null, null);
      }
      
      callback(null, query);
    });
  },
  
  /**
   * Get queries by user ID
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getQueriesByUserId: (userId, options = {}, callback) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT id, userId, question, response, tokensUsed, createdAt
      FROM Queries
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [userId, limit, offset], (err, queries) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      db.get(
        'SELECT COUNT(*) as count FROM Queries WHERE userId = ?',
        [userId],
        (err, result) => {
          if (err) {
            return callback(err);
          }
          
          const totalCount = result.count;
          const totalPages = Math.ceil(totalCount / limit);
          
          callback(null, {
            queries,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages
            }
          });
        }
      );
    });
  },
  
  /**
   * Get all queries
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getAllQueries: (options = {}, callback) => {
    const { page = 1, limit = 10, userId } = options;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT q.id, q.userId, q.question, q.response, q.tokensUsed, q.createdAt,
             u.name as userName, u.email as userEmail
      FROM Queries q
      JOIN Users u ON q.userId = u.id
    `;
    
    const params = [];
    
    // Add user filter
    if (userId) {
      sql += ' WHERE q.userId = ?';
      params.push(userId);
    }
    
    // Add pagination
    sql += ' ORDER BY q.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, queries) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      let countSql = 'SELECT COUNT(*) as count FROM Queries';
      
      const countParams = [];
      
      if (userId) {
        countSql += ' WHERE userId = ?';
        countParams.push(userId);
      }
      
      db.get(countSql, countParams, (err, result) => {
        if (err) {
          return callback(err);
        }
        
        const totalCount = result.count;
        const totalPages = Math.ceil(totalCount / limit);
        
        callback(null, {
          queries,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages
          }
        });
      });
    });
  },
  
  /**
   * Delete query
   * @param {Number} id - Query ID
   * @param {Function} callback - Callback function
   */
  deleteQuery: (id, callback) => {
    const sql = `
      DELETE FROM Queries
      WHERE id = ?
    `;
    
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { success: true, message: 'Requête supprimée' });
    });
  },
  
  /**
   * Get user token usage
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getUserTokenUsage: (userId, options = {}, callback) => {
    const { startDate, endDate } = options;
    
    let sql = `
      SELECT SUM(tokensUsed) as totalTokens, COUNT(*) as totalQueries
      FROM Queries
      WHERE userId = ?
    `;
    
    const params = [userId];
    
    // Add date filters
    if (startDate) {
      sql += ' AND createdAt >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND createdAt <= ?';
      params.push(endDate);
    }
    
    db.get(sql, params, (err, result) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, {
        totalTokens: result.totalTokens || 0,
        totalQueries: result.totalQueries || 0
      });
    });
  },
  
  /**
   * Get token usage by day
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getTokenUsageByDay: (userId, options = {}, callback) => {
    const { startDate, endDate, limit = 30 } = options;
    
    let sql = `
      SELECT date(createdAt) as day, SUM(tokensUsed) as tokens, COUNT(*) as queries
      FROM Queries
      WHERE userId = ?
    `;
    
    const params = [userId];
    
    // Add date filters
    if (startDate) {
      sql += ' AND createdAt >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND createdAt <= ?';
      params.push(endDate);
    }
    
    sql += ' GROUP BY date(createdAt) ORDER BY day DESC LIMIT ?';
    params.push(limit);
    
    db.all(sql, params, (err, results) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, results);
    });
  }
};

module.exports = QueryModel;
