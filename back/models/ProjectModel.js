const { db } = require('../config/database');

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {Function} callback - Callback function
 */
exports.createProject = (projectData, callback) => {
  const { userId, title, description } = projectData;
  
  // Insert project
  db.run(
    'INSERT INTO Projects (userId, title, description, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [userId, title, description || null],
    function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { projectId: this.lastID });
    }
  );
};

/**
 * Get project by ID
 * @param {Number} id - Project ID
 * @param {Function} callback - Callback function
 */
exports.getProjectById = (id, callback) => {
  db.get('SELECT * FROM Projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      return callback(err);
    }
    
    if (!project) {
      return callback(new Error('Projet non trouvé'));
    }
    
    callback(null, project);
  });
};

/**
 * Get projects by user ID with pagination
 * @param {Number} userId - User ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of projects per page
 * @param {Function} callback - Callback function
 */
exports.getProjectsByUserId = (userId, page, limit, callback) => {
  const query = 'SELECT * FROM Projects WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  const countQuery = 'SELECT COUNT(*) as total FROM Projects WHERE userId = ?';
  
  // Get total count
  db.get(countQuery, [userId], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get projects
    db.all(query, [userId, limit, (page - 1) * limit], (err, projects) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
};

/**
 * Update project
 * @param {Number} id - Project ID
 * @param {Object} projectData - Project data to update
 * @param {Function} callback - Callback function
 */
exports.updateProject = (id, projectData, callback) => {
  const { title, description } = projectData;
  
  // Check if project exists
  db.get('SELECT id FROM Projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      return callback(err);
    }
    
    if (!project) {
      return callback(new Error('Projet non trouvé'));
    }
    
    // Update project
    let query = 'UPDATE Projects SET';
    let params = [];
    
    if (title !== undefined) {
      query += ' title = ?,';
      params.push(title);
    }
    
    if (description !== undefined) {
      query += ' description = ?,';
      params.push(description);
    }
    
    // Remove trailing comma
    query = query.slice(0, -1);
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { projectId: id, changes: this.changes });
    });
  });
};

/**
 * Delete project
 * @param {Number} id - Project ID
 * @param {Function} callback - Callback function
 */
exports.deleteProject = (id, callback) => {
  // Check if project exists
  db.get('SELECT id FROM Projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      return callback(err);
    }
    
    if (!project) {
      return callback(new Error('Projet non trouvé'));
    }
    
    // Delete project
    db.run('DELETE FROM Projects WHERE id = ?', [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      // Delete project documents
      db.run('DELETE FROM ProjectDocuments WHERE projectId = ?', [id], function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { projectId: id, changes: this.changes });
      });
    });
  });
};

/**
 * Add document to project
 * @param {Number} projectId - Project ID
 * @param {Number} documentId - Document ID
 * @param {Function} callback - Callback function
 */
exports.addDocumentToProject = (projectId, documentId, callback) => {
  // Check if project exists
  db.get('SELECT userId FROM Projects WHERE id = ?', [projectId], (err, project) => {
    if (err) {
      return callback(err);
    }
    
    if (!project) {
      return callback(new Error('Projet non trouvé'));
    }
    
    // Check if document exists and belongs to the same user
    db.get('SELECT userId FROM Documents WHERE id = ?', [documentId], (err, document) => {
      if (err) {
        return callback(err);
      }
      
      if (!document) {
        return callback(new Error('Document non trouvé'));
      }
      
      if (document.userId !== project.userId) {
        return callback(new Error('Le document n\'appartient pas à l\'utilisateur du projet'));
      }
      
      // Check if document is already in project
      db.get(
        'SELECT * FROM ProjectDocuments WHERE projectId = ? AND documentId = ?',
        [projectId, documentId],
        (err, projectDocument) => {
          if (err) {
            return callback(err);
          }
          
          if (projectDocument) {
            // Document already in project, return success
            return callback(null, { projectId, documentId });
          }
          
          // Add document to project
          db.run(
            'INSERT INTO ProjectDocuments (projectId, documentId) VALUES (?, ?)',
            [projectId, documentId],
            function(err) {
              if (err) {
                return callback(err);
              }
              
              callback(null, { projectId, documentId });
            }
          );
        }
      );
    });
  });
};

/**
 * Remove document from project
 * @param {Number} projectId - Project ID
 * @param {Number} documentId - Document ID
 * @param {Function} callback - Callback function
 */
exports.removeDocumentFromProject = (projectId, documentId, callback) => {
  // Check if document is in project
  db.get(
    'SELECT * FROM ProjectDocuments WHERE projectId = ? AND documentId = ?',
    [projectId, documentId],
    (err, projectDocument) => {
      if (err) {
        return callback(err);
      }
      
      if (!projectDocument) {
        return callback(new Error('Document non trouvé dans ce projet'));
      }
      
      // Remove document from project
      db.run(
        'DELETE FROM ProjectDocuments WHERE projectId = ? AND documentId = ?',
        [projectId, documentId],
        function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { projectId, documentId, changes: this.changes });
        }
      );
    }
  );
};

/**
 * Get project documents
 * @param {Number} projectId - Project ID
 * @param {Function} callback - Callback function
 */
exports.getProjectDocuments = (projectId, callback) => {
  const query = `
    SELECT d.* FROM Documents d
    JOIN ProjectDocuments pd ON d.id = pd.documentId
    WHERE pd.projectId = ?
    ORDER BY d.uploadedAt DESC
  `;
  
  db.all(query, [projectId], (err, documents) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, documents);
  });
};

/**
 * Search projects by title or description
 * @param {Number} userId - User ID
 * @param {String} searchTerm - Search term
 * @param {Number} page - Page number
 * @param {Number} limit - Number of projects per page
 * @param {Function} callback - Callback function
 */
exports.searchProjects = (userId, searchTerm, page, limit, callback) => {
  const query = `
    SELECT * FROM Projects 
    WHERE userId = ? AND (
      title LIKE ? OR 
      description LIKE ?
    )
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total FROM Projects 
    WHERE userId = ? AND (
      title LIKE ? OR 
      description LIKE ?
    )
  `;
  
  const searchPattern = `%${searchTerm}%`;
  
  // Get total count
  db.get(countQuery, [userId, searchPattern, searchPattern], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get projects
    db.all(
      query,
      [userId, searchPattern, searchPattern, limit, (page - 1) * limit],
      (err, projects) => {
        if (err) {
          return callback(err);
        }
        
        callback(null, {
          projects,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
    );
  });
};
