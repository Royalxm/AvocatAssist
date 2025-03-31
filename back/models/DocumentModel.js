const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * Document model
 * Handles database operations for documents
 */
const DocumentModel = {
  /**
   * Create a new document
   * @param {Object} documentData - Document data
   * @param {Function} callback - Callback function
   */
  createDocument: (documentData, callback) => {
    // Include projectId and summary in the destructuring and query
    const { userId, projectId, filePath, fileName, fileType, fileSize, extractedText, summary } = documentData;
    
    const sql = `
      INSERT INTO Documents (userId, projectId, filePath, fileName, fileType, fileSize, extractedText, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [userId, projectId, filePath, fileName, fileType, fileSize, extractedText || null, summary || null],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        // Get the created document
        DocumentModel.getDocumentById(this.lastID, callback);
      }
    );
  },
  
  /**
   * Get document by ID
   * @param {Number} id - Document ID
   * @param {Function} callback - Callback function
   */
  getDocumentById: (id, callback) => {
    // Select projectId as well
    const sql = `
      SELECT d.id, d.userId, d.projectId, d.filePath, d.fileName, d.fileType, d.fileSize, d.extractedText, d.summary, d.uploadedAt,
             u.name as userName, u.email as userEmail
      FROM Documents d
      JOIN Users u ON d.userId = u.id
      WHERE d.id = ?
    `;
    
    db.get(sql, [id], (err, document) => {
      if (err) {
        return callback(err);
      }
      
      if (!document) {
        return callback(null, null);
      }
      
      callback(null, document);
    });
  },
  
  /**
   * Get documents by user ID
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
 * @param {Function} callback - Callback function
 */
getDocumentsByUserId: (userId, options = {}, callback) => {
  // Add projectId to options destructuring
  const { page = 1, limit = 10, fileType, projectId } = options; 
  const offset = (page - 1) * limit;
  
  // Select projectId as well
  let sql = `
    SELECT id, userId, projectId, filePath, fileName, fileType, fileSize, summary, uploadedAt
    FROM Documents
    WHERE userId = ?
  `;
  
  const params = [userId];
  const countParams = [userId]; // Separate params for count query

  // Add projectId filter if provided
  if (projectId) {
    sql += ' AND projectId = ?';
    params.push(projectId);
    countParams.push(projectId); // Add to count params as well
  }
  
  // Add file type filter
  if (fileType) {
    sql += ' AND fileType = ?';
    params.push(fileType);
    countParams.push(fileType); // Add to count params as well
  }
  
  // Add pagination
    sql += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, documents) => {
      if (err) {
        return callback(err);
      }
      
  // Get total count - build query based on filters
  let countSql = 'SELECT COUNT(*) as count FROM Documents WHERE userId = ?';
  if (projectId) {
    countSql += ' AND projectId = ?';
  }
  if (fileType) {
    countSql += ' AND fileType = ?';
  }
  
  db.get(countSql, countParams, (err, result) => {
        if (err) {
          return callback(err);
        }
        
        const totalCount = result.count;
        const totalPages = Math.ceil(totalCount / limit);
        
        callback(null, {
          documents,
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
   * Update document
   * @param {Number} id - Document ID
   * @param {Object} documentData - Document data
   * @param {Function} callback - Callback function
   */
  updateDocument: (id, documentData, callback) => {
    // Include summary and potentially projectId in the update (though projectId usually shouldn't change)
    const { extractedText, summary, projectId } = documentData;
    
    let sql = 'UPDATE Documents SET ';
    const params = [];
    
    if (extractedText !== undefined) {
      sql += 'extractedText = ?, ';
      params.push(extractedText);
    }
    if (summary !== undefined) {
      sql += 'summary = ?, ';
      params.push(summary);
    }
    // Add projectId update if needed, though less common
    if (projectId !== undefined) { 
      sql += 'projectId = ?, ';
      params.push(projectId);
    }

    // Remove trailing comma and space if fields were added
    if (params.length > 0) {
      sql = sql.slice(0, -2); 
    } else {
      // No fields to update
      return callback(null, { documentId: id, changes: 0 });
    }

    sql += ' WHERE id = ?';
    params.push(id);
    
    db.run(sql, params, function(err) {
      if (err) {
        return callback(err);
      }
      
      // Get the updated document
      DocumentModel.getDocumentById(id, callback);
    });
  },
  
  /**
   * Delete document
   * @param {Number} id - Document ID
   * @param {Function} callback - Callback function
   */
  deleteDocument: async (id, callback) => {
    try {
      // Get document to delete file
      db.get('SELECT filePath FROM Documents WHERE id = ?', [id], async (err, document) => {
        if (err) {
          return callback(err);
        }
        
        if (!document) {
          return callback(new Error('Document non trouvé'));
        }
        
        // Delete file if it exists
        if (document.filePath) {
          const fullPath = path.resolve(document.filePath);
          
          try {
            if (fs.existsSync(fullPath)) {
              await unlinkAsync(fullPath);
            }
          } catch (fileErr) {
            console.error('Error deleting file:', fileErr);
            // Continue with database deletion even if file deletion fails
          }
        }
        
        // Delete document from database
        const sql = `
          DELETE FROM Documents
          WHERE id = ?
        `;
        
        db.run(sql, [id], function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { success: true, message: 'Document supprimé' });
        });
      });
    } catch (err) {
      callback(err);
    }
  },
  
  /**
   * Search documents
   * @param {Number} userId - User ID
   * @param {String} query - Search query
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  searchDocuments: (userId, query, options = {}, callback) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    // Select projectId as well
    const sql = `
      SELECT id, userId, projectId, filePath, fileName, fileType, fileSize, summary, uploadedAt
      FROM Documents
      WHERE userId = ? AND (
        fileName LIKE ? OR
        extractedText LIKE ?
      )
      ORDER BY uploadedAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const searchTerm = `%${query}%`;
    
    db.all(sql, [userId, searchTerm, searchTerm, limit, offset], (err, documents) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      const countSql = `
        SELECT COUNT(*) as count
        FROM Documents
        WHERE userId = ? AND (
          fileName LIKE ? OR
          extractedText LIKE ?
        )
      `;
      
      db.get(countSql, [userId, searchTerm, searchTerm], (err, result) => {
        if (err) {
          return callback(err);
        }
        
        const totalCount = result.count;
        const totalPages = Math.ceil(totalCount / limit);
        
        callback(null, {
          documents,
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
   * Get all documents
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getAllDocuments: (options = {}, callback) => {
    const { page = 1, limit = 10, userId, fileType } = options;
    const offset = (page - 1) * limit;
    
    // Select projectId as well
    let sql = `
      SELECT d.id, d.userId, d.projectId, d.filePath, d.fileName, d.fileType, d.fileSize, d.summary, d.uploadedAt,
             u.name as userName, u.email as userEmail
      FROM Documents d
      JOIN Users u ON d.userId = u.id
    `;
    
    const params = [];
    
    // Add filters
    const conditions = [];
    
    if (userId) {
      conditions.push('d.userId = ?');
      params.push(userId);
    }
    
    if (fileType) {
      conditions.push('d.fileType = ?');
      params.push(fileType);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add pagination
    sql += ' ORDER BY d.uploadedAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, documents) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      let countSql = `
        SELECT COUNT(*) as count
        FROM Documents d
      `;
      
      const countParams = [];
      
      if (conditions.length > 0) {
        countSql += ' WHERE ' + conditions.join(' AND ');
        countParams.push(...params.slice(0, -2)); // Exclude limit and offset
      }
      
      db.get(countSql, countParams, (err, result) => {
        if (err) {
          return callback(err);
        }
        
        const totalCount = result.count;
        const totalPages = Math.ceil(totalCount / limit);
        
        callback(null, {
          documents,
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
   * Get documents by project ID
   * @param {Number} projectId - Project ID
   * @param {Function} callback - Callback function
   */
  getDocumentsByProjectId: (projectId, callback) => {
    const sql = `
      SELECT id, userId, projectId, filePath, fileName, fileType, fileSize, extractedText, summary, uploadedAt
      FROM Documents
      WHERE projectId = ?
      ORDER BY uploadedAt DESC
    `;
    
    db.all(sql, [projectId], (err, documents) => {
      if (err) {
        return callback(err);
      }
      callback(null, documents);
    });
  }
};

module.exports = DocumentModel;
