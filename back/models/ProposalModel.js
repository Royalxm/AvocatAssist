const { db } = require('../config/database');

/**
 * Create a new proposal
 * @param {Object} proposalData - Proposal data
 * @param {Function} callback - Callback function
 */
exports.createProposal = (proposalData, callback) => {
  const { requestId, lawyerId, proposalText, price } = proposalData;
  
  // Check if legal request exists and is open
  db.get('SELECT status FROM LegalRequests WHERE id = ?', [requestId], (err, request) => {
    if (err) {
      return callback(err);
    }
    
    if (!request) {
      return callback(new Error('Demande juridique non trouvée'));
    }
    
    if (request.status !== 'ouverte') {
      return callback(new Error('La demande juridique n\'est pas ouverte'));
    }
    
    // Check if lawyer has already submitted a proposal for this request
    db.get(
      'SELECT id FROM Proposals WHERE requestId = ? AND lawyerId = ?',
      [requestId, lawyerId],
      (err, existingProposal) => {
        if (err) {
          return callback(err);
        }
        
        if (existingProposal) {
          return callback(new Error('Vous avez déjà soumis une proposition pour cette demande'));
        }
        
        // Insert proposal
        db.run(
          'INSERT INTO Proposals (requestId, lawyerId, proposalText, price, submittedAt, status) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
          [requestId, lawyerId, proposalText, price, 'en attente'],
          function(err) {
            if (err) {
              return callback(err);
            }
            
            callback(null, { proposalId: this.lastID });
          }
        );
      }
    );
  });
};

/**
 * Get proposal by ID
 * @param {Number} id - Proposal ID
 * @param {Function} callback - Callback function
 */
exports.getProposalById = (id, callback) => {
  db.get('SELECT * FROM Proposals WHERE id = ?', [id], (err, proposal) => {
    if (err) {
      return callback(err);
    }
    
    if (!proposal) {
      return callback(new Error('Proposition non trouvée'));
    }
    
    // Get lawyer information
    db.get('SELECT id, name, email FROM Users WHERE id = ?', [proposal.lawyerId], (err, lawyer) => {
      if (err) {
        return callback(err);
      }
      
      proposal.lawyer = lawyer;
      
      // Get lawyer profile
      db.get('SELECT * FROM LawyerProfiles WHERE userId = ?', [proposal.lawyerId], (err, profile) => {
        if (err) {
          return callback(err);
        }
        
        proposal.lawyerProfile = profile;
        
        // Get legal request information
        db.get('SELECT * FROM LegalRequests WHERE id = ?', [proposal.requestId], (err, request) => {
          if (err) {
            return callback(err);
          }
          
          proposal.request = request;
          
          // Get client information
          db.get('SELECT id, name, email FROM Users WHERE id = ?', [request.clientId], (err, client) => {
            if (err) {
              return callback(err);
            }
            
            proposal.client = client;
            
            callback(null, proposal);
          });
        });
      });
    });
  });
};

/**
 * Get proposals by request ID
 * @param {Number} requestId - Legal request ID
 * @param {Function} callback - Callback function
 */
exports.getProposalsByRequestId = (requestId, callback) => {
  const query = `
    SELECT p.*, u.name as lawyerName, u.email as lawyerEmail
    FROM Proposals p
    JOIN Users u ON p.lawyerId = u.id
    WHERE p.requestId = ?
    ORDER BY p.submittedAt DESC
  `;
  
  db.all(query, [requestId], (err, proposals) => {
    if (err) {
      return callback(err);
    }
    
    // Get lawyer profiles for each proposal
    const lawyerIds = proposals.map(proposal => proposal.lawyerId);
    
    if (lawyerIds.length === 0) {
      return callback(null, proposals);
    }
    
    const placeholders = lawyerIds.map(() => '?').join(',');
    const profilesQuery = `
      SELECT * FROM LawyerProfiles 
      WHERE userId IN (${placeholders})
    `;
    
    db.all(profilesQuery, lawyerIds, (err, profiles) => {
      if (err) {
        return callback(err);
      }
      
      // Add lawyer profile to each proposal
      const profilesMap = {};
      profiles.forEach(profile => {
        profilesMap[profile.userId] = profile;
      });
      
      proposals.forEach(proposal => {
        proposal.lawyerProfile = profilesMap[proposal.lawyerId] || {};
      });
      
      callback(null, proposals);
    });
  });
};

/**
 * Get proposals by lawyer ID with pagination
 * @param {Number} lawyerId - Lawyer ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of proposals per page
 * @param {Function} callback - Callback function
 */
exports.getProposalsByLawyerId = (lawyerId, page, limit, callback) => {
  const query = `
    SELECT p.*, lr.description as requestDescription, lr.status as requestStatus
    FROM Proposals p
    JOIN LegalRequests lr ON p.requestId = lr.id
    WHERE p.lawyerId = ?
    ORDER BY p.submittedAt DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = 'SELECT COUNT(*) as total FROM Proposals WHERE lawyerId = ?';
  
  // Get total count
  db.get(countQuery, [lawyerId], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get proposals
    db.all(query, [lawyerId, limit, (page - 1) * limit], (err, proposals) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, {
        proposals,
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
 * Update proposal
 * @param {Number} id - Proposal ID
 * @param {Object} proposalData - Proposal data to update
 * @param {Function} callback - Callback function
 */
exports.updateProposal = (id, proposalData, callback) => {
  const { proposalText, price, status } = proposalData;
  
  // Check if proposal exists
  db.get('SELECT id, status FROM Proposals WHERE id = ?', [id], (err, proposal) => {
    if (err) {
      return callback(err);
    }
    
    if (!proposal) {
      return callback(new Error('Proposition non trouvée'));
    }
    
    // If trying to update an accepted or rejected proposal
    if (proposal.status !== 'en attente' && status !== 'acceptée' && status !== 'refusée') {
      return callback(new Error('Impossible de modifier une proposition déjà acceptée ou refusée'));
    }
    
    // Update proposal
    let query = 'UPDATE Proposals SET';
    let params = [];
    
    if (proposalText !== undefined) {
      query += ' proposalText = ?,';
      params.push(proposalText);
    }
    
    if (price !== undefined) {
      query += ' price = ?,';
      params.push(price);
    }
    
    if (status !== undefined) {
      query += ' status = ?,';
      params.push(status);
    }
    
    // Remove trailing comma
    query = query.slice(0, -1);
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
      if (err) {
        return callback(err);
      }
      
      // If proposal is accepted, update legal request status
      if (status === 'acceptée') {
        db.get('SELECT requestId FROM Proposals WHERE id = ?', [id], (err, proposal) => {
          if (err) {
            return callback(err);
          }
          
          db.run(
            'UPDATE LegalRequests SET status = ? WHERE id = ?',
            ['en cours', proposal.requestId],
            function(err) {
              if (err) {
                return callback(err);
              }
              
              callback(null, { proposalId: id, changes: this.changes });
            }
          );
        });
      } else {
        callback(null, { proposalId: id, changes: this.changes });
      }
    });
  });
};

/**
 * Delete proposal
 * @param {Number} id - Proposal ID
 * @param {Function} callback - Callback function
 */
exports.deleteProposal = (id, callback) => {
  // Check if proposal exists
  db.get('SELECT id, status FROM Proposals WHERE id = ?', [id], (err, proposal) => {
    if (err) {
      return callback(err);
    }
    
    if (!proposal) {
      return callback(new Error('Proposition non trouvée'));
    }
    
    // Cannot delete accepted proposals
    if (proposal.status === 'acceptée') {
      return callback(new Error('Impossible de supprimer une proposition acceptée'));
    }
    
    // Delete proposal
    db.run('DELETE FROM Proposals WHERE id = ?', [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { proposalId: id, changes: this.changes });
    });
  });
};

/**
 * Get accepted proposal for a request
 * @param {Number} requestId - Legal request ID
 * @param {Function} callback - Callback function
 */
exports.getAcceptedProposalByRequestId = (requestId, callback) => {
  const query = `
    SELECT p.*, u.name as lawyerName, u.email as lawyerEmail
    FROM Proposals p
    JOIN Users u ON p.lawyerId = u.id
    WHERE p.requestId = ? AND p.status = 'acceptée'
  `;
  
  db.get(query, [requestId], (err, proposal) => {
    if (err) {
      return callback(err);
    }
    
    if (!proposal) {
      return callback(null, null);
    }
    
    // Get lawyer profile
    db.get('SELECT * FROM LawyerProfiles WHERE userId = ?', [proposal.lawyerId], (err, profile) => {
      if (err) {
        return callback(err);
      }
      
      proposal.lawyerProfile = profile || {};
      
      callback(null, proposal);
    });
  });
};

/**
 * Get proposal statistics
 * @param {Function} callback - Callback function
 */
exports.getProposalStats = (callback) => {
  const query = `
    SELECT 
      COUNT(*) as totalProposals,
      COUNT(DISTINCT lawyerId) as uniqueLawyers,
      AVG(price) as averagePrice,
      strftime('%Y-%m-%d', submittedAt) as date,
      COUNT(*) as count
    FROM Proposals
    GROUP BY date
    ORDER BY date DESC
    LIMIT 30
  `;
  
  db.all(query, [], (err, stats) => {
    if (err) {
      return callback(err);
    }
    
    // Get status counts
    db.all(
      'SELECT status, COUNT(*) as count FROM Proposals GROUP BY status',
      [],
      (err, statusCounts) => {
        if (err) {
          return callback(err);
        }
        
        callback(null, {
          dailyStats: stats,
          statusCounts
        });
      }
    );
  });
};
