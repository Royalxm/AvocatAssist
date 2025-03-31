const { db } = require('../config/database');

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @param {Function} callback - Callback function
 */
exports.createTransaction = (transactionData, callback) => {
  const { proposalId, clientId, amount, commission } = transactionData;
  
  // Check if proposal exists and is accepted
  db.get(
    'SELECT p.*, lr.clientId FROM Proposals p JOIN LegalRequests lr ON p.requestId = lr.id WHERE p.id = ?',
    [proposalId],
    (err, proposal) => {
      if (err) {
        return callback(err);
      }
      
      if (!proposal) {
        return callback(new Error('Proposition non trouvée'));
      }
      
      if (proposal.status !== 'acceptée') {
        return callback(new Error('La proposition n\'est pas acceptée'));
      }
      
      if (proposal.clientId !== clientId) {
        return callback(new Error('Le client ne correspond pas à la demande juridique'));
      }
      
      // Check if transaction already exists for this proposal
      db.get('SELECT id FROM Transactions WHERE proposalId = ?', [proposalId], (err, existingTransaction) => {
        if (err) {
          return callback(err);
        }
        
        if (existingTransaction) {
          return callback(new Error('Une transaction existe déjà pour cette proposition'));
        }
        
        // Insert transaction
        db.run(
          'INSERT INTO Transactions (proposalId, clientId, amount, commission, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [proposalId, clientId, amount, commission],
          function(err) {
            if (err) {
              return callback(err);
            }
            
            const transactionId = this.lastID;
            
            // Update client credit balance
            db.run(
              'UPDATE Users SET creditBalance = creditBalance - ? WHERE id = ?',
              [amount, clientId],
              function(err) {
                if (err) {
                  return callback(err);
                }
                
                // Record credit transaction for client
                db.run(
                  'INSERT INTO CreditTransactions (userId, amount, transactionType) VALUES (?, ?, ?)',
                  [clientId, amount, 'debit'],
                  function(err) {
                    if (err) {
                      return callback(err);
                    }
                    
                    // Update lawyer credit balance (amount - commission)
                    const lawyerAmount = amount - commission;
                    
                    db.run(
                      'UPDATE Users SET creditBalance = creditBalance + ? WHERE id = ?',
                      [lawyerAmount, proposal.lawyerId],
                      function(err) {
                        if (err) {
                          return callback(err);
                        }
                        
                        // Record credit transaction for lawyer
                        db.run(
                          'INSERT INTO CreditTransactions (userId, amount, transactionType) VALUES (?, ?, ?)',
                          [proposal.lawyerId, lawyerAmount, 'credit'],
                          function(err) {
                            if (err) {
                              return callback(err);
                            }
                            
                            callback(null, { transactionId });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    }
  );
};

/**
 * Get transaction by ID
 * @param {Number} id - Transaction ID
 * @param {Function} callback - Callback function
 */
exports.getTransactionById = (id, callback) => {
  db.get('SELECT * FROM Transactions WHERE id = ?', [id], (err, transaction) => {
    if (err) {
      return callback(err);
    }
    
    if (!transaction) {
      return callback(new Error('Transaction non trouvée'));
    }
    
    // Get proposal information
    db.get('SELECT * FROM Proposals WHERE id = ?', [transaction.proposalId], (err, proposal) => {
      if (err) {
        return callback(err);
      }
      
      transaction.proposal = proposal;
      
      // Get legal request information
      db.get('SELECT * FROM LegalRequests WHERE id = ?', [proposal.requestId], (err, request) => {
        if (err) {
          return callback(err);
        }
        
        transaction.request = request;
        
        // Get client information
        db.get('SELECT id, name, email FROM Users WHERE id = ?', [transaction.clientId], (err, client) => {
          if (err) {
            return callback(err);
          }
          
          transaction.client = client;
          
          // Get lawyer information
          db.get('SELECT id, name, email FROM Users WHERE id = ?', [proposal.lawyerId], (err, lawyer) => {
            if (err) {
              return callback(err);
            }
            
            transaction.lawyer = lawyer;
            
            callback(null, transaction);
          });
        });
      });
    });
  });
};

/**
 * Get transactions by client ID with pagination
 * @param {Number} clientId - Client ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of transactions per page
 * @param {Function} callback - Callback function
 */
exports.getTransactionsByClientId = (clientId, page, limit, callback) => {
  const query = `
    SELECT t.*, p.lawyerId, p.price, p.proposalText, lr.description as requestDescription
    FROM Transactions t
    JOIN Proposals p ON t.proposalId = p.id
    JOIN LegalRequests lr ON p.requestId = lr.id
    WHERE t.clientId = ?
    ORDER BY t.timestamp DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = 'SELECT COUNT(*) as total FROM Transactions WHERE clientId = ?';
  
  // Get total count
  db.get(countQuery, [clientId], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get transactions
    db.all(query, [clientId, limit, (page - 1) * limit], (err, transactions) => {
      if (err) {
        return callback(err);
      }
      
      // Get lawyer information for each transaction
      const lawyerIds = transactions.map(transaction => transaction.lawyerId);
      
      if (lawyerIds.length === 0) {
        return callback(null, {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const placeholders = lawyerIds.map(() => '?').join(',');
      const lawyersQuery = `
        SELECT id, name, email FROM Users 
        WHERE id IN (${placeholders})
      `;
      
      db.all(lawyersQuery, lawyerIds, (err, lawyers) => {
        if (err) {
          return callback(err);
        }
        
        // Add lawyer information to each transaction
        const lawyersMap = {};
        lawyers.forEach(lawyer => {
          lawyersMap[lawyer.id] = lawyer;
        });
        
        transactions.forEach(transaction => {
          transaction.lawyer = lawyersMap[transaction.lawyerId] || {};
        });
        
        callback(null, {
          transactions,
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
 * Get transactions by lawyer ID with pagination
 * @param {Number} lawyerId - Lawyer ID
 * @param {Number} page - Page number
 * @param {Number} limit - Number of transactions per page
 * @param {Function} callback - Callback function
 */
exports.getTransactionsByLawyerId = (lawyerId, page, limit, callback) => {
  const query = `
    SELECT t.*, p.lawyerId, p.price, p.proposalText, lr.description as requestDescription
    FROM Transactions t
    JOIN Proposals p ON t.proposalId = p.id
    JOIN LegalRequests lr ON p.requestId = lr.id
    WHERE p.lawyerId = ?
    ORDER BY t.timestamp DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM Transactions t
    JOIN Proposals p ON t.proposalId = p.id
    WHERE p.lawyerId = ?
  `;
  
  // Get total count
  db.get(countQuery, [lawyerId], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get transactions
    db.all(query, [lawyerId, limit, (page - 1) * limit], (err, transactions) => {
      if (err) {
        return callback(err);
      }
      
      // Get client information for each transaction
      const clientIds = transactions.map(transaction => transaction.clientId);
      
      if (clientIds.length === 0) {
        return callback(null, {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const placeholders = clientIds.map(() => '?').join(',');
      const clientsQuery = `
        SELECT id, name, email FROM Users 
        WHERE id IN (${placeholders})
      `;
      
      db.all(clientsQuery, clientIds, (err, clients) => {
        if (err) {
          return callback(err);
        }
        
        // Add client information to each transaction
        const clientsMap = {};
        clients.forEach(client => {
          clientsMap[client.id] = client;
        });
        
        transactions.forEach(transaction => {
          transaction.client = clientsMap[transaction.clientId] || {};
        });
        
        callback(null, {
          transactions,
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
 * Get all transactions with pagination (for admin)
 * @param {Number} page - Page number
 * @param {Number} limit - Number of transactions per page
 * @param {Function} callback - Callback function
 */
exports.getAllTransactions = (page, limit, callback) => {
  const query = `
    SELECT t.*, p.lawyerId, p.price, p.proposalText, lr.description as requestDescription
    FROM Transactions t
    JOIN Proposals p ON t.proposalId = p.id
    JOIN LegalRequests lr ON p.requestId = lr.id
    ORDER BY t.timestamp DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = 'SELECT COUNT(*) as total FROM Transactions';
  
  // Get total count
  db.get(countQuery, [], (err, result) => {
    if (err) {
      return callback(err);
    }
    
    const total = result.total;
    
    // Get transactions
    db.all(query, [limit, (page - 1) * limit], (err, transactions) => {
      if (err) {
        return callback(err);
      }
      
      // Get user information for each transaction
      const userIds = [];
      transactions.forEach(transaction => {
        userIds.push(transaction.clientId);
        userIds.push(transaction.lawyerId);
      });
      
      if (userIds.length === 0) {
        return callback(null, {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }
      
      const uniqueUserIds = [...new Set(userIds)];
      const placeholders = uniqueUserIds.map(() => '?').join(',');
      const usersQuery = `
        SELECT id, name, email FROM Users 
        WHERE id IN (${placeholders})
      `;
      
      db.all(usersQuery, uniqueUserIds, (err, users) => {
        if (err) {
          return callback(err);
        }
        
        // Add user information to each transaction
        const usersMap = {};
        users.forEach(user => {
          usersMap[user.id] = user;
        });
        
        transactions.forEach(transaction => {
          transaction.client = usersMap[transaction.clientId] || {};
          transaction.lawyer = usersMap[transaction.lawyerId] || {};
        });
        
        callback(null, {
          transactions,
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
 * Get transaction statistics
 * @param {Function} callback - Callback function
 */
exports.getTransactionStats = (callback) => {
  const query = `
    SELECT 
      COUNT(*) as totalTransactions,
      SUM(amount) as totalAmount,
      SUM(commission) as totalCommission,
      AVG(amount) as averageAmount,
      strftime('%Y-%m-%d', timestamp) as date,
      COUNT(*) as count,
      SUM(amount) as dailyAmount,
      SUM(commission) as dailyCommission
    FROM Transactions
    GROUP BY date
    ORDER BY date DESC
    LIMIT 30
  `;
  
  db.all(query, [], (err, stats) => {
    if (err) {
      return callback(err);
    }
    
    // Get total stats
    db.get(
      'SELECT COUNT(*) as total, SUM(amount) as totalAmount, SUM(commission) as totalCommission FROM Transactions',
      [],
      (err, totals) => {
        if (err) {
          return callback(err);
        }
        
        callback(null, {
          totals,
          dailyStats: stats
        });
      }
    );
  });
};
