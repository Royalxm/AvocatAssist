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
    const { userId, filePath, fileName, fileType, fileSize, extractedText } = documentData;
    
    const sql = `
      INSERT INTO Documents (userId, filePath, fileName, fileType, fileSize, extractedText)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [userId, filePath, fileName, fileType, fileSize, extractedText || null],
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
    const sql = `
      SELECT d.id, d.userId, d.filePath, d.fileName, d.fileType, d.fileSize, d.extractedText, d.uploadedAt,
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
    const { page = 1, limit = 10, fileType } = options;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT id, userId, filePath, fileName, fileType, fileSize, uploadedAt
      FROM Documents
      WHERE userId = ?
    `;
    
    const params = [userId];
    
    // Add file type filter
    if (fileType) {
      sql += ' AND fileType = ?';
      params.push(fileType);
    }
    
    // Add pagination
    sql += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, documents) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      let countSql = 'SELECT COUNT(*) as count FROM Documents WHERE userId = ?';
      const countParams = [userId];
      
      if (fileType) {
        countSql += ' AND fileType = ?';
        countParams.push(fileType);
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
    const { extractedText } = documentData;
    
    const sql = `
      UPDATE Documents
      SET extractedText = ?
      WHERE id = ?
    `;
    
    db.run(sql, [extractedText, id], function(err) {
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
    
    const sql = `
      SELECT id, userId, filePath, fileName, fileType, fileSize, uploadedAt
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
    
    let sql = `
      SELECT d.id, d.userId, d.filePath, d.fileName, d.fileType, d.fileSize, d.uploadedAt,
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
  }
};

module.exports = DocumentModel;
