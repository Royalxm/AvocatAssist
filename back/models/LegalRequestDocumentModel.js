const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

/**
 * LegalRequestDocument model
 * Handles database operations for documents associated with legal requests
 */
const LegalRequestDocumentModel = {
  /**
   * Create a new document for a legal request
   * @param {Object} documentData - Document data
   * @param {Function} callback - Callback function
   */
  createDocument: (documentData, callback) => {
    const { userId, legalRequestId, filePath, fileName, fileType, fileSize, extractedText, summary } = documentData;
    
    const sql = `
      INSERT INTO LegalRequestDocuments (userId, legalRequestId, filePath, fileName, fileType, fileSize, extractedText, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [userId, legalRequestId, filePath, fileName, fileType, fileSize, extractedText || null, summary || null],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        // Get the created document
        LegalRequestDocumentModel.getDocumentById(this.lastID, callback);
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
      SELECT d.id, d.userId, d.legalRequestId, d.filePath, d.fileName, d.fileType, d.fileSize, d.extractedText, d.summary, d.uploadedAt,
             u.name as userName, u.email as userEmail
      FROM LegalRequestDocuments d
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
   * Get documents by legal request ID
   * @param {Number} legalRequestId - Legal Request ID
   * @param {Function} callback - Callback function
   */
  getDocumentsByLegalRequestId: (legalRequestId, callback) => {
    const sql = `
      SELECT id, userId, legalRequestId, filePath, fileName, fileType, fileSize, extractedText, summary, uploadedAt
      FROM LegalRequestDocuments
      WHERE legalRequestId = ?
      ORDER BY uploadedAt DESC
    `;
    
    db.all(sql, [legalRequestId], (err, documents) => {
      if (err) {
        return callback(err);
      }
      callback(null, documents);
    });
  },
  
  /**
   * Get documents by user ID
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getDocumentsByUserId: (userId, options = {}, callback) => {
    const { page = 1, limit = 10, fileType, legalRequestId } = options; 
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT id, userId, legalRequestId, filePath, fileName, fileType, fileSize, summary, uploadedAt
      FROM LegalRequestDocuments
      WHERE userId = ?
    `;
    
    const params = [userId];
    const countParams = [userId]; // Separate params for count query

    // Add legalRequestId filter if provided
    if (legalRequestId) {
      sql += ' AND legalRequestId = ?';
      params.push(legalRequestId);
      countParams.push(legalRequestId);
    }
    
    // Add file type filter
    if (fileType) {
      sql += ' AND fileType = ?';
      params.push(fileType);
      countParams.push(fileType);
    }
    
    // Add pagination
    sql += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, documents) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count - build query based on filters
      let countSql = 'SELECT COUNT(*) as count FROM LegalRequestDocuments WHERE userId = ?';
      if (legalRequestId) {
        countSql += ' AND legalRequestId = ?';
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
    const { extractedText, summary } = documentData;
    
    let sql = 'UPDATE LegalRequestDocuments SET ';
    const params = [];
    
    if (extractedText !== undefined) {
      sql += 'extractedText = ?, ';
      params.push(extractedText);
    }
    if (summary !== undefined) {
      sql += 'summary = ?, ';
      params.push(summary);
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
      LegalRequestDocumentModel.getDocumentById(id, callback);
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
      db.get('SELECT filePath FROM LegalRequestDocuments WHERE id = ?', [id], async (err, document) => {
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
          DELETE FROM LegalRequestDocuments
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
      SELECT id, userId, legalRequestId, filePath, fileName, fileType, fileSize, summary, uploadedAt
      FROM LegalRequestDocuments
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
        FROM LegalRequestDocuments
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
  }
};

module.exports = LegalRequestDocumentModel;
