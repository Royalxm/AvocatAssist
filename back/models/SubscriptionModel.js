const { db } = require('../config/database');

/**
 * Get all subscription plans
 * @param {Function} callback - Callback function
 */
exports.getAllPlans = (callback) => {
  db.all('SELECT * FROM SubscriptionPlans ORDER BY price ASC', [], (err, plans) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, plans);
  });
};

/**
 * Get subscription plan by ID
 * @param {Number} id - Plan ID
 * @param {Function} callback - Callback function
 */
exports.getPlanById = (id, callback) => {
  db.get('SELECT * FROM SubscriptionPlans WHERE id = ?', [id], (err, plan) => {
    if (err) {
      return callback(err);
    }
    
    if (!plan) {
      return callback(new Error('Plan d\'abonnement non trouvé'));
    }
    
    callback(null, plan);
  });
};

/**
 * Get subscription plan by name
 * @param {String} name - Plan name
 * @param {Function} callback - Callback function
 */
exports.getPlanByName = (name, callback) => {
  db.get('SELECT * FROM SubscriptionPlans WHERE name = ?', [name], (err, plan) => {
    if (err) {
      return callback(err);
    }
    
    if (!plan) {
      return callback(new Error('Plan d\'abonnement non trouvé'));
    }
    
    callback(null, plan);
  });
};

/**
 * Create a new subscription plan
 * @param {Object} planData - Plan data
 * @param {Function} callback - Callback function
 */
exports.createPlan = (planData, callback) => {
  const { name, price, tokenLimit, features } = planData;
  
  // Check if plan name already exists
  db.get('SELECT id FROM SubscriptionPlans WHERE name = ?', [name], (err, existingPlan) => {
    if (err) {
      return callback(err);
    }
    
    if (existingPlan) {
      return callback(new Error('Un plan avec ce nom existe déjà'));
    }
    
    // Insert plan
    db.run(
      'INSERT INTO SubscriptionPlans (name, price, tokenLimit, features) VALUES (?, ?, ?, ?)',
      [name, price, tokenLimit, features],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { planId: this.lastID });
      }
    );
  });
};

/**
 * Update subscription plan
 * @param {Number} id - Plan ID
 * @param {Object} planData - Plan data to update
 * @param {Function} callback - Callback function
 */
exports.updatePlan = (id, planData, callback) => {
  const { name, price, tokenLimit, features } = planData;
  
  // Check if plan exists
  db.get('SELECT id FROM SubscriptionPlans WHERE id = ?', [id], (err, plan) => {
    if (err) {
      return callback(err);
    }
    
    if (!plan) {
      return callback(new Error('Plan d\'abonnement non trouvé'));
    }
    
    // Check if new name already exists (if name is being updated)
    if (name) {
      db.get('SELECT id FROM SubscriptionPlans WHERE name = ? AND id != ?', [name, id], (err, existingPlan) => {
        if (err) {
          return callback(err);
        }
        
        if (existingPlan) {
          return callback(new Error('Un plan avec ce nom existe déjà'));
        }
        
        updatePlanData();
      });
    } else {
      updatePlanData();
    }
    
    function updatePlanData() {
      let query = 'UPDATE SubscriptionPlans SET';
      let params = [];
      
      if (name !== undefined) {
        query += ' name = ?,';
        params.push(name);
      }
      
      if (price !== undefined) {
        query += ' price = ?,';
        params.push(price);
      }
      
      if (tokenLimit !== undefined) {
        query += ' tokenLimit = ?,';
        params.push(tokenLimit);
      }
      
      if (features !== undefined) {
        query += ' features = ?,';
        params.push(features);
      }
      
      // Remove trailing comma
      query = query.slice(0, -1);
      
      query += ' WHERE id = ?';
      params.push(id);
      
      db.run(query, params, function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { planId: id, changes: this.changes });
      });
    }
  });
};

/**
 * Delete subscription plan
 * @param {Number} id - Plan ID
 * @param {Function} callback - Callback function
 */
exports.deletePlan = (id, callback) => {
  // Check if plan exists
  db.get('SELECT id FROM SubscriptionPlans WHERE id = ?', [id], (err, plan) => {
    if (err) {
      return callback(err);
    }
    
    if (!plan) {
      return callback(new Error('Plan d\'abonnement non trouvé'));
    }
    
    // Check if plan is in use by any lawyer
    db.get('SELECT COUNT(*) as count FROM LawyerProfiles WHERE subscriptionPlan = ?', [id], (err, result) => {
      if (err) {
        return callback(err);
      }
      
      if (result.count > 0) {
        return callback(new Error('Ce plan est actuellement utilisé par des avocats et ne peut pas être supprimé'));
      }
      
      // Delete plan
      db.run('DELETE FROM SubscriptionPlans WHERE id = ?', [id], function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { planId: id, changes: this.changes });
      });
    });
  });
};

/**
 * Subscribe user to a plan
 * @param {Number} userId - User ID
 * @param {Number} planId - Plan ID
 * @param {Function} callback - Callback function
 */
exports.subscribeToPlan = (userId, planId, callback) => {
  // Check if user exists and is a lawyer
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return callback(err);
    }
    
    if (!user) {
      return callback(new Error('Utilisateur non trouvé'));
    }
    
    if (user.role !== 'lawyer') {
      return callback(new Error('Seuls les avocats peuvent souscrire à un plan'));
    }
    
    // Check if plan exists
    db.get('SELECT * FROM SubscriptionPlans WHERE id = ?', [planId], (err, plan) => {
      if (err) {
        return callback(err);
      }
      
      if (!plan) {
        return callback(new Error('Plan d\'abonnement non trouvé'));
      }
      
      // Update lawyer profile with new subscription plan
      db.get('SELECT id FROM LawyerProfiles WHERE userId = ?', [userId], (err, profile) => {
        if (err) {
          return callback(err);
        }
        
        if (!profile) {
          // Create lawyer profile if it doesn't exist
          db.run(
            'INSERT INTO LawyerProfiles (userId, subscriptionPlan, tokenBalance) VALUES (?, ?, ?)',
            [userId, plan.name, plan.tokenLimit],
            function(err) {
              if (err) {
                return callback(err);
              }
              
              callback(null, { userId, planId, planName: plan.name });
            }
          );
        } else {
          // Update existing profile
          db.run(
            'UPDATE LawyerProfiles SET subscriptionPlan = ?, tokenBalance = ? WHERE userId = ?',
            [plan.name, plan.tokenLimit, userId],
            function(err) {
              if (err) {
                return callback(err);
              }
              
              callback(null, { userId, planId, planName: plan.name });
            }
          );
        }
      });
    });
  });
};

/**
 * Get user subscription
 * @param {Number} userId - User ID
 * @param {Function} callback - Callback function
 */
exports.getUserSubscription = (userId, callback) => {
  // Check if user exists and is a lawyer
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return callback(err);
    }
    
    if (!user) {
      return callback(new Error('Utilisateur non trouvé'));
    }
    
    if (user.role !== 'lawyer') {
      return callback(new Error('Seuls les avocats peuvent avoir un abonnement'));
    }
    
    // Get lawyer profile
    db.get('SELECT * FROM LawyerProfiles WHERE userId = ?', [userId], (err, profile) => {
      if (err) {
        return callback(err);
      }
      
      if (!profile || !profile.subscriptionPlan) {
        return callback(null, { subscription: null });
      }
      
      // Get subscription plan details
      db.get('SELECT * FROM SubscriptionPlans WHERE name = ?', [profile.subscriptionPlan], (err, plan) => {
        if (err) {
          return callback(err);
        }
        
        if (!plan) {
          return callback(null, { subscription: null });
        }
        
        callback(null, {
          subscription: {
            plan,
            tokenBalance: profile.tokenBalance
          }
        });
      });
    });
  });
};

/**
 * Update user token balance
 * @param {Number} userId - User ID
 * @param {Number} amount - Amount to add (positive) or subtract (negative)
 * @param {Function} callback - Callback function
 */
exports.updateTokenBalance = (userId, amount, callback) => {
  // Check if user exists and is a lawyer
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return callback(err);
    }
    
    if (!user) {
      return callback(new Error('Utilisateur non trouvé'));
    }
    
    if (user.role !== 'lawyer') {
      return callback(new Error('Seuls les avocats peuvent avoir un solde de jetons'));
    }
    
    // Get lawyer profile
    db.get('SELECT * FROM LawyerProfiles WHERE userId = ?', [userId], (err, profile) => {
      if (err) {
        return callback(err);
      }
      
      if (!profile) {
        return callback(new Error('Profil d\'avocat non trouvé'));
      }
      
      // Calculate new balance
      const newBalance = (profile.tokenBalance || 0) + amount;
      
      // Update token balance
      db.run(
        'UPDATE LawyerProfiles SET tokenBalance = ? WHERE userId = ?',
        [newBalance, userId],
        function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { userId, newBalance });
        }
      );
    });
  });
};

/**
 * Reset token balances for all users with a specific plan
 * @param {String} planName - Plan name
 * @param {Function} callback - Callback function
 */
exports.resetTokenBalances = (planName, callback) => {
  // Get plan details
  db.get('SELECT * FROM SubscriptionPlans WHERE name = ?', [planName], (err, plan) => {
    if (err) {
      return callback(err);
    }
    
    if (!plan) {
      return callback(new Error('Plan d\'abonnement non trouvé'));
    }
    
    // Update token balances for all users with this plan
    db.run(
      'UPDATE LawyerProfiles SET tokenBalance = ? WHERE subscriptionPlan = ?',
      [plan.tokenLimit, planName],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { planName, tokenLimit: plan.tokenLimit, usersUpdated: this.changes });
      }
    );
  });
};
