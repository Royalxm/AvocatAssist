const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User model
 * Handles database operations for users
 */
const UserModel = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {Function} callback - Callback function
   */
  createUser: (userData, callback) => {
    const { name, email, password, role } = userData;
    
    // Hash password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return callback(err);
      }
      
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return callback(err);
        }
        
        // Start a transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // Insert user
          const sql = `
            INSERT INTO Users (name, email, password, role)
            VALUES (?, ?, ?, ?)
          `;
          
          db.run(sql, [name, email, hash, role], function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            const userId = this.lastID;
            
            // If user is a lawyer, create lawyer profile
            if (role === 'lawyer') {
              const lawyerSql = `
                INSERT INTO LawyerProfiles (userId)
                VALUES (?)
              `;
              
              db.run(lawyerSql, [userId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return callback(err);
                }
                
                // Commit transaction
                db.run('COMMIT');
                
                // Get the created user
                UserModel.getUserById(userId, callback);
              });
            } else {
              // Commit transaction
              db.run('COMMIT');
              
              // Get the created user
              UserModel.getUserById(userId, callback);
            }
          });
        });
      });
    });
  },
  
  /**
   * Get user by ID
   * @param {Number} id - User ID
   * @param {Function} callback - Callback function
   */
  getUserById: (id, callback) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.creditBalance, u.createdAt,
             lp.id as lawyerProfileId, lp.specialties, lp.experience, lp.baseRate, lp.subscriptionPlan, lp.tokenBalance
      FROM Users u
      LEFT JOIN LawyerProfiles lp ON u.id = lp.userId
      WHERE u.id = ?
    `;
    
    db.get(sql, [id], (err, user) => {
      if (err) {
        return callback(err);
      }
      
      if (!user) {
        return callback(null, null);
      }
      
      // Format user object
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        creditBalance: user.creditBalance,
        createdAt: user.createdAt
      };
      
      // Add lawyer profile if exists
      if (user.lawyerProfileId) {
        formattedUser.lawyerProfile = {
          id: user.lawyerProfileId,
          specialties: user.specialties,
          experience: user.experience,
          baseRate: user.baseRate,
          subscriptionPlan: user.subscriptionPlan,
          tokenBalance: user.tokenBalance
        };
      }
      
      callback(null, formattedUser);
    });
  },
  
  /**
   * Get user by email
   * @param {String} email - User email
   * @param {Function} callback - Callback function
   */
  getUserByEmail: (email, callback) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.password, u.role, u.creditBalance, u.createdAt,
             lp.id as lawyerProfileId, lp.specialties, lp.experience, lp.baseRate, lp.subscriptionPlan, lp.tokenBalance
      FROM Users u
      LEFT JOIN LawyerProfiles lp ON u.id = lp.userId
      WHERE u.email = ?
    `;
    
    db.get(sql, [email], (err, user) => {
      if (err) {
        return callback(err);
      }
      
      if (!user) {
        return callback(null, null);
      }
      
      // Format user object
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        creditBalance: user.creditBalance,
        createdAt: user.createdAt
      };
      
      // Add lawyer profile if exists
      if (user.lawyerProfileId) {
        formattedUser.lawyerProfile = {
          id: user.lawyerProfileId,
          specialties: user.specialties,
          experience: user.experience,
          baseRate: user.baseRate,
          subscriptionPlan: user.subscriptionPlan,
          tokenBalance: user.tokenBalance
        };
      }
      
      callback(null, formattedUser);
    });
  },
  
  /**
   * Get all users
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getAllUsers: (options = {}, callback) => {
    const { page = 1, limit = 10, role, search } = options;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.creditBalance, u.createdAt,
             lp.id as lawyerProfileId, lp.specialties, lp.experience, lp.baseRate, lp.subscriptionPlan, lp.tokenBalance
      FROM Users u
      LEFT JOIN LawyerProfiles lp ON u.id = lp.userId
    `;
    
    const params = [];
    
    // Add filters
    const conditions = [];
    
    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }
    
    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add pagination
    sql += ' ORDER BY u.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, users) => {
      if (err) {
        return callback(err);
      }
      
      // Format users
      const formattedUsers = users.map(user => {
        const formattedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          creditBalance: user.creditBalance,
          createdAt: user.createdAt
        };
        
        // Add lawyer profile if exists
        if (user.lawyerProfileId) {
          formattedUser.lawyerProfile = {
            id: user.lawyerProfileId,
            specialties: user.specialties,
            experience: user.experience,
            baseRate: user.baseRate,
            subscriptionPlan: user.subscriptionPlan,
            tokenBalance: user.tokenBalance
          };
        }
        
        return formattedUser;
      });
      
      // Get total count
      let countSql = 'SELECT COUNT(*) as count FROM Users u';
      
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
          users: formattedUsers,
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
   * Get lawyers
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getLawyers: (options = {}, callback) => {
    const { page = 1, limit = 10, specialties, search } = options;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.createdAt,
             lp.id as lawyerProfileId, lp.specialties, lp.experience, lp.baseRate, lp.subscriptionPlan
      FROM Users u
      JOIN LawyerProfiles lp ON u.id = lp.userId
      WHERE u.role = 'lawyer'
    `;
    
    const params = [];
    
    // Add filters
    if (specialties) {
      sql += ' AND lp.specialties LIKE ?';
      params.push(`%${specialties}%`);
    }
    
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR lp.specialties LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    // Add pagination
    sql += ' ORDER BY u.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, lawyers) => {
      if (err) {
        return callback(err);
      }
      
      // Format lawyers
      const formattedLawyers = lawyers.map(lawyer => {
        return {
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          role: lawyer.role,
          createdAt: lawyer.createdAt,
          lawyerProfile: {
            id: lawyer.lawyerProfileId,
            specialties: lawyer.specialties,
            experience: lawyer.experience,
            baseRate: lawyer.baseRate,
            subscriptionPlan: lawyer.subscriptionPlan
          }
        };
      });
      
      // Get total count
      let countSql = `
        SELECT COUNT(*) as count
        FROM Users u
        JOIN LawyerProfiles lp ON u.id = lp.userId
        WHERE u.role = 'lawyer'
      `;
      
      const countParams = [];
      
      if (specialties) {
        countSql += ' AND lp.specialties LIKE ?';
        countParams.push(`%${specialties}%`);
      }
      
      if (search) {
        countSql += ' AND (u.name LIKE ? OR u.email LIKE ? OR lp.specialties LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      db.get(countSql, countParams, (err, result) => {
        if (err) {
          return callback(err);
        }
        
        const totalCount = result.count;
        const totalPages = Math.ceil(totalCount / limit);
        
        callback(null, {
          lawyers: formattedLawyers,
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
   * Update user
   * @param {Number} id - User ID
   * @param {Object} userData - User data
   * @param {Function} callback - Callback function
   */
  updateUser: (id, userData, callback) => {
    // Get user to check role
    UserModel.getUserById(id, (err, user) => {
      if (err) {
        return callback(err);
      }
      
      if (!user) {
        return callback(new Error('Utilisateur non trouvé'));
      }
      
      // Start a transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Update user
        const userFields = [];
        const userParams = [];
        
        if (userData.name) {
          userFields.push('name = ?');
          userParams.push(userData.name);
        }
        
        if (userData.email) {
          userFields.push('email = ?');
          userParams.push(userData.email);
        }
        
        if (userFields.length > 0) {
          const userSql = `
            UPDATE Users
            SET ${userFields.join(', ')}
            WHERE id = ?
          `;
          
          userParams.push(id);
          
          db.run(userSql, userParams, function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            // If user is a lawyer, update lawyer profile
            if (user.role === 'lawyer') {
              const lawyerFields = [];
              const lawyerParams = [];
              
              if (userData.specialties) {
                lawyerFields.push('specialties = ?');
                lawyerParams.push(userData.specialties);
              }
              
              if (userData.experience) {
                lawyerFields.push('experience = ?');
                lawyerParams.push(userData.experience);
              }
              
              if (userData.baseRate !== undefined) {
                lawyerFields.push('baseRate = ?');
                lawyerParams.push(userData.baseRate);
              }
              
              if (lawyerFields.length > 0) {
                const lawyerSql = `
                  UPDATE LawyerProfiles
                  SET ${lawyerFields.join(', ')}
                  WHERE userId = ?
                `;
                
                lawyerParams.push(id);
                
                db.run(lawyerSql, lawyerParams, function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    return callback(err);
                  }
                  
                  // Commit transaction
                  db.run('COMMIT');
                  
                  // Get the updated user
                  UserModel.getUserById(id, callback);
                });
              } else {
                // Commit transaction
                db.run('COMMIT');
                
                // Get the updated user
                UserModel.getUserById(id, callback);
              }
            } else {
              // Commit transaction
              db.run('COMMIT');
              
              // Get the updated user
              UserModel.getUserById(id, callback);
            }
          });
        } else {
          // No fields to update
          db.run('ROLLBACK');
          
          // Get the user
          UserModel.getUserById(id, callback);
        }
      });
    });
  },
  
  /**
   * Update password
   * @param {Number} id - User ID
   * @param {String} password - New password
   * @param {Function} callback - Callback function
   */
  updatePassword: (id, password, callback) => {
    // Hash password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return callback(err);
      }
      
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return callback(err);
        }
        
        // Update password
        const sql = `
          UPDATE Users
          SET password = ?
          WHERE id = ?
        `;
        
        db.run(sql, [hash, id], function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { success: true, message: 'Mot de passe mis à jour' });
        });
      });
    });
  },
  
  /**
   * Delete user
   * @param {Number} id - User ID
   * @param {Function} callback - Callback function
   */
  deleteUser: (id, callback) => {
    // Delete user
    const sql = `
      DELETE FROM Users
      WHERE id = ?
    `;
    
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err);
      }
      
      callback(null, { success: true, message: 'Utilisateur supprimé' });
    });
  },
  
  /**
   * Compare password
   * @param {String} password - Password to compare
   * @param {String} hash - Hashed password
   * @param {Function} callback - Callback function
   */
  comparePassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, isMatch);
    });
  },
  
  /**
   * Update credit balance
   * @param {Number} userId - User ID
   * @param {Number} amount - Amount to add/subtract
   * @param {String} transactionType - Transaction type (credit/debit)
   * @param {String} description - Transaction description
   * @param {Function} callback - Callback function
   */
  updateCreditBalance: (userId, amount, transactionType, description, callback) => {
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Get current balance
      db.get('SELECT creditBalance FROM Users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          db.run('ROLLBACK');
          return callback(err);
        }
        
        if (!user) {
          db.run('ROLLBACK');
          return callback(new Error('Utilisateur non trouvé'));
        }
        
        // Calculate new balance
        let newBalance = user.creditBalance;
        
        if (transactionType === 'credit') {
          newBalance += amount;
        } else if (transactionType === 'debit') {
          newBalance -= amount;
          
          // Check if user has enough credits
          if (newBalance < 0) {
            db.run('ROLLBACK');
            return callback(new Error('Solde insuffisant'));
          }
        } else {
          db.run('ROLLBACK');
          return callback(new Error('Type de transaction invalide'));
        }
        
        // Update balance
        db.run(
          'UPDATE Users SET creditBalance = ? WHERE id = ?',
          [newBalance, userId],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            // Record transaction
            db.run(
              'INSERT INTO CreditTransactions (userId, amount, transactionType, description) VALUES (?, ?, ?, ?)',
              [userId, amount, transactionType, description],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return callback(err);
                }
                
                // Commit transaction
                db.run('COMMIT');
                
                callback(null, {
                  success: true,
                  message: 'Solde mis à jour',
                  newBalance,
                  transactionId: this.lastID
                });
              }
            );
          }
        );
      });
    });
  },
  
  /**
   * Get credit transactions
   * @param {Number} userId - User ID
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getCreditTransactions: (userId, options = {}, callback) => {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT id, userId, amount, transactionType, description, timestamp
      FROM CreditTransactions
      WHERE userId = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [userId, limit, offset], (err, transactions) => {
      if (err) {
        return callback(err);
      }
      
      // Get total count
      db.get(
        'SELECT COUNT(*) as count FROM CreditTransactions WHERE userId = ?',
        [userId],
        (err, result) => {
          if (err) {
            return callback(err);
          }
          
          const totalCount = result.count;
          const totalPages = Math.ceil(totalCount / limit);
          
          callback(null, {
            transactions,
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
  }
};

module.exports = UserModel;
