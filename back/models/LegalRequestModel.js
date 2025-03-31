const { db } = require('../config/database');

/**
 * Create a new legal request
 * @param {Object} requestData - Legal request data
 * @param {Function} callback - Callback function
 */
exports.createLegalRequest = (requestData, callback) => {
  const { clientId, description, summaryAI } = requestData;
  
  // Insert legal request
  db.run(
    'INSERT INTO LegalRequests (clientId, description, summaryAI, createdAt, status) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
    [clientId, description, summaryAI || null, 'ouverte'],
    function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { requestId: this.lastID });
    }
  );
};

/**
 * Get legal request by ID
 * @param {Number} id - Legal request ID
 * @param {Function} callback - Callback function
 */
exports.getLegalRequestById = (id, callback) => {
  db.get('SELECT * FROM LegalRequests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return callback(err);
    }
    
    if (!request) {
      return callback(new Error('Demande juridique non trouvée'));
    }
    
    // Get client information
    db.get('SELECT id, name, email FROM Users WHERE id = ?', [request.clientId], (err, client) => {
      if (err) {
        return callback(err);
      }
      
      request.client = client;
      
      // Get proposals count
      db.get('SELECT COUNT(*) as count FROM Proposals WHERE requestId = ?', [id], (err, result) => {
        if (err) {
          return callback(err);
        }
        
        request.proposalsCount = result.count;
        
        callback(null, request);
      });
    });
  });
};

/**
 * Get legal requests by client ID with pagination
 * @param {Number} clientId - Client ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of requests per page
 * @param {Function} callback - Callback function
 */
exports.getLegalRequestsByClientId = (clientId, page, limit, callback) => {
  const query = 'SELECT * FROM LegalRequests WHERE clientId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  const countQuery = 'SELECT COUNT(*) as total FROM LegalRequests WHERE clientId = ?';
  
  // Get total count
  db.get(countQuery, [clientId], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get requests
    db.all(query, [clientId, limit, (page - 1) * limit], (err, requests) => {
      if (err) {
        return callback(err);
      }
      
      // Get proposals count for each request
      const requestIds = requests.map(request => request.id);
      
      if (requestIds.length === 0) {
        return callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const placeholders = requestIds.map(() => '?').join(',');
      const proposalsQuery = `
        SELECT requestId, COUNT(*) as count 
        FROM Proposals 
        WHERE requestId IN (${placeholders})
        GROUP BY requestId
      `;
      
      db.all(proposalsQuery, requestIds, (err, proposalCounts) => {
        if (err) {
          return callback(err);
        }
        
        // Add proposals count to each request
        const proposalsMap = {};
        proposalCounts.forEach(item => {
          proposalsMap[item.requestId] = item.count;
        });
        
        requests.forEach(request => {
          request.proposalsCount = proposalsMap[request.id] || 0;
        });
        
        callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      });
    });
  });
};

/**
 * Get open legal requests with pagination
 * @param {Number} page - Page number
 * @param {Number} limit - Number of requests per page
 * @param {Function} callback - Callback function
 */
exports.getOpenLegalRequests = (page, limit, callback) => {
  const query = `
    SELECT lr.*, u.name as clientName, u.email as clientEmail
    FROM LegalRequests lr
    JOIN Users u ON lr.clientId = u.id
    WHERE lr.status = 'ouverte'
    ORDER BY lr.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = 'SELECT COUNT(*) as total FROM LegalRequests WHERE status = ?';
  
  // Get total count
  db.get(countQuery, ['ouverte'], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get requests
    db.all(query, [limit, (page - 1) * limit], (err, requests) => {
      if (err) {
        return callback(err);
      }
      
      // Get proposals count for each request
      const requestIds = requests.map(request => request.id);
      
      if (requestIds.length === 0) {
        return callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const placeholders = requestIds.map(() => '?').join(',');
      const proposalsQuery = `
        SELECT requestId, COUNT(*) as count 
        FROM Proposals 
        WHERE requestId IN (${placeholders})
        GROUP BY requestId
      `;
      
      db.all(proposalsQuery, requestIds, (err, proposalCounts) => {
        if (err) {
          return callback(err);
        }
        
        // Add proposals count to each request
        const proposalsMap = {};
        proposalCounts.forEach(item => {
          proposalsMap[item.requestId] = item.count;
        });
        
        requests.forEach(request => {
          request.proposalsCount = proposalsMap[request.id] || 0;
        });
        
        callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      });
    });
  });
};

/**
 * Update legal request
 * @param {Number} id - Legal request ID
 * @param {Object} requestData - Legal request data to update
 * @param {Function} callback - Callback function
 */
exports.updateLegalRequest = (id, requestData, callback) => {
  const { description, status, summaryAI } = requestData;
  
  // Check if request exists
  db.get('SELECT id FROM LegalRequests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return callback(err);
    }
    
    if (!request) {
      return callback(new Error('Demande juridique non trouvée'));
    }
    
    // Update request
    let query = 'UPDATE LegalRequests SET';
    let params = [];
    
    if (description !== undefined) {
      query += ' description = ?,';
      params.push(description);
    }
    
    if (status !== undefined) {
      query += ' status = ?,';
      params.push(status);
    }
    
    if (summaryAI !== undefined) {
      query += ' summaryAI = ?,';
      params.push(summaryAI);
    }
    
    // Remove trailing comma
    query = query.slice(0, -1);
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { requestId: id, changes: this.changes });
    });
  });
};

/**
 * Delete legal request
 * @param {Number} id - Legal request ID
 * @param {Function} callback - Callback function
 */
exports.deleteLegalRequest = (id, callback) => {
  // Check if request exists
  db.get('SELECT id FROM LegalRequests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return callback(err);
    }
    
    if (!request) {
      return callback(new Error('Demande juridique non trouvée'));
    }
    
    // Delete request
    db.run('DELETE FROM LegalRequests WHERE id = ?', [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      // Delete proposals for this request
      db.run('DELETE FROM Proposals WHERE requestId = ?', [id], function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { requestId: id, changes: this.changes });
      });
    });
  });
};

/**
 * Search legal requests
 * @param {String} searchTerm - Search term
 * @param {String} status - Filter by status (optional)
 * @param {Number} page - Page number
 * @param {Number} limit - Number of requests per page
 * @param {Function} callback - Callback function
 */
exports.searchLegalRequests = (searchTerm, status, page, limit, callback) => {
  let query = `
    SELECT lr.*, u.name as clientName, u.email as clientEmail
    FROM LegalRequests lr
    JOIN Users u ON lr.clientId = u.id
    WHERE (
      lr.description LIKE ? OR 
      lr.summaryAI LIKE ? OR
      u.name LIKE ? OR
      u.email LIKE ?
    )
  `;
  
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM LegalRequests lr
    JOIN Users u ON lr.clientId = u.id
    WHERE (
      lr.description LIKE ? OR 
      lr.summaryAI LIKE ? OR
      u.name LIKE ? OR
      u.email LIKE ?
    )
  `;
  
  let params = [];
  const searchPattern = `%${searchTerm}%`;
  params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  
  // Add status filter if provided
  if (status) {
    query += ' AND lr.status = ?';
    countQuery += ' AND lr.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY lr.createdAt DESC LIMIT ? OFFSET ?';
  
  // Get total count
  db.get(countQuery, params, (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Add pagination parameters
    params.push(limit, (page - 1) * limit);
    
    // Get requests
    db.all(query, params, (err, requests) => {
      if (err) {
        return callback(err);
      }
      
      // Get proposals count for each request
      const requestIds = requests.map(request => request.id);
      
      if (requestIds.length === 0) {
        return callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const placeholders = requestIds.map(() => '?').join(',');
      const proposalsQuery = `
        SELECT requestId, COUNT(*) as count 
        FROM Proposals 
        WHERE requestId IN (${placeholders})
        GROUP BY requestId
      `;
      
      db.all(proposalsQuery, requestIds, (err, proposalCounts) => {
        if (err) {
          return callback(err);
        }
        
        // Add proposals count to each request
        const proposalsMap = {};
        proposalCounts.forEach(item => {
          proposalsMap[item.requestId] = item.count;
        });
        
        requests.forEach(request => {
          request.proposalsCount = proposalsMap[request.id] || 0;
        });
        
        callback(null, {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      });
    });
  });
};
