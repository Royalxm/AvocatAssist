const { db } = require('../config/database');

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {Function} callback - Callback function
 */
exports.createProject = (projectData, callback) => {
  // Add type to destructuring and query
  const { userId, title, description, type } = projectData;
  
  // Insert project
  db.run(
    'INSERT INTO Projects (userId, title, description, type, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [userId, title, description || null, type || null],
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
  // Select all columns including type
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
  // Select project columns and the associated chat ID
  const query = `
    SELECT p.*, c.id as chatId
    FROM Projects p
    LEFT JOIN Chats c ON p.id = c.projectId
    WHERE p.userId = ?
    GROUP BY p.id -- Add GROUP BY to prevent duplicates from JOIN
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  // Count query remains the same, counting projects
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
  // Add type to destructuring
  const { title, description, type } = projectData;
  
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
    
    // Add type to update query
    if (type !== undefined) {
      query += ' type = ?,';
      params.push(type);
    }
    
    // Remove trailing comma if fields were added
    if (params.length > 0) {
      query = query.slice(0, -1);
    } else {
      // No fields to update
      return callback(null, { projectId: id, changes: 0 });
    }
    
    query += ', updatedAt = CURRENT_TIMESTAMP WHERE id = ?'; // Also update timestamp
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
      
      // Documents are now linked directly via projectId and will cascade delete if set up correctly in schema.
      // No need to delete from ProjectDocuments table anymore.
      callback(null, { projectId: id, changes: this.changes });
    });
  });
};

// Removed addDocumentToProject, removeDocumentFromProject, getProjectDocuments as they are obsolete

/**
 * Search projects by title, description or type
 * @param {Number} userId - User ID
 * @param {String} searchTerm - Search term
 * @param {Number} page - Page number
 * @param {Number} limit - Number of projects per page
 * @param {Function} callback - Callback function
 */
exports.searchProjects = (userId, searchTerm, page, limit, callback) => {
  // Select all columns including type
  // Search also in the type field
  const query = `
    SELECT * FROM Projects 
    WHERE userId = ? AND (
      title LIKE ? OR 
      description LIKE ? OR
      type LIKE ? 
    )
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total FROM Projects 
    WHERE userId = ? AND (
      title LIKE ? OR 
      description LIKE ? OR
      type LIKE ?
    )
  `;
  
  const searchPattern = `%${searchTerm}%`;
  
  // Get total count
  db.get(countQuery, [userId, searchPattern, searchPattern, searchPattern], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get projects
    db.all(
      query,
      [userId, searchPattern, searchPattern, searchPattern, limit, (page - 1) * limit],
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
