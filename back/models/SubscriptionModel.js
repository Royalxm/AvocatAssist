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

/**
 * Create a new client subscription record
 * @param {Object} subscriptionData - Data for the new subscription { userId, planId, status, startDate, endDate, paymentProvider, paymentSubscriptionId }
 * @param {Function} callback - Callback function
 */
exports.createClientSubscription = (subscriptionData, callback) => {
  const { userId, planId, status = 'pending_payment', startDate, endDate, paymentProvider, paymentSubscriptionId } = subscriptionData;

  // Check if user exists and is a client
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(new Error('Utilisateur non trouvé'));
    if (user.role !== 'client') return callback(new Error('Seuls les clients peuvent avoir ce type d\'abonnement'));

    // Check if plan exists
    db.get('SELECT id FROM SubscriptionPlans WHERE id = ?', [planId], (err, plan) => {
      if (err) return callback(err);
      if (!plan) return callback(new Error('Plan d\'abonnement non trouvé'));

      // Check for existing active/pending subscription for this client
      db.get('SELECT id FROM ClientSubscriptions WHERE userId = ? AND status IN (?, ?)', [userId, 'active', 'pending_payment'], (err, existingSub) => {
        if (err) return callback(err);
        // Optionally handle existing subscriptions (e.g., prevent creating a new one if active)
        // For now, we allow creating a new one, assuming old ones might be cancelled/expired later.

        const sql = `
          INSERT INTO ClientSubscriptions
          (userId, planId, status, startDate, endDate, paymentProvider, paymentSubscriptionId)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [userId, planId, status, startDate, endDate, paymentProvider, paymentSubscriptionId];

        db.run(sql, params, function(err) {
          if (err) return callback(err);
          callback(null, { subscriptionId: this.lastID });
        });
      });
    });
  });
};

/**
 * Get client subscription details by User ID
 * @param {Number} userId - User ID
 * @param {Function} callback - Callback function
 */
exports.getClientSubscriptionByUserId = (userId, callback) => {
  // Check if user exists and is a client
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(new Error('Utilisateur non trouvé'));
    if (user.role !== 'client') return callback(new Error('Seuls les clients peuvent avoir ce type d\'abonnement'));

    // Get the most recent active or pending subscription for the client
    const sql = `
      SELECT cs.*, sp.name as planName, sp.price as planPrice, sp.features as planFeatures
      FROM ClientSubscriptions cs
      JOIN SubscriptionPlans sp ON cs.planId = sp.id
      -- Include pending_cancellation as a valid "current" state to display
      WHERE cs.userId = ? AND cs.status IN ('active', 'pending_payment', 'trial', 'pending_cancellation')
      ORDER BY cs.createdAt DESC
      LIMIT 1
    `;
    db.get(sql, [userId], (err, subscription) => {
      if (err) return callback(err);
      callback(null, { subscription }); // Returns null if no active/pending subscription found
    });
  });
};

/**
 * Update a client subscription record
 * @param {Number} subscriptionId - The ID of the subscription to update
 * @param {Object} updateData - Data to update { status, startDate, endDate, paymentProvider, paymentSubscriptionId }
 * @param {Function} callback - Callback function
 */
exports.updateClientSubscription = (subscriptionId, updateData, callback) => {
  const fields = [];
  const params = [];

  // Build query dynamically based on provided updateData
  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined && ['status', 'startDate', 'endDate', 'paymentProvider', 'paymentSubscriptionId'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) {
    return callback(new Error('Aucune donnée valide fournie pour la mise à jour'));
  }

  // Add updatedAt manually as the trigger only works on actual UPDATE statements
  fields.push('updatedAt = CURRENT_TIMESTAMP');
  params.push(subscriptionId); // Add the ID for the WHERE clause

  const sql = `UPDATE ClientSubscriptions SET ${fields.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) return callback(err);
    if (this.changes === 0) return callback(new Error('Abonnement client non trouvé ou aucune modification effectuée'));
    callback(null, { changes: this.changes });
  });
};


/**
 * Cancel a client subscription (sets status to 'cancelled')
 * @param {Number} userId - User ID of the client
 * @param {Number} [subscriptionId] - Optional: Specific subscription ID to cancel. If not provided, cancels the latest active one.
 * @param {Function} callback - Callback function
 */
exports.cancelClientSubscription = (userId, subscriptionId, callback) => {
  // Allow calling with (userId, callback)
  if (typeof subscriptionId === 'function') {
    callback = subscriptionId;
    subscriptionId = null;
  }

  // Find the subscription to cancel
  let findSql = 'SELECT id FROM ClientSubscriptions WHERE userId = ? AND status = ?';
  const findParams = [userId, 'active'];

  if (subscriptionId) {
    findSql += ' AND id = ?';
    findParams.push(subscriptionId);
  } else {
    // Find the latest active subscription if no specific ID is given
    findSql += ' ORDER BY createdAt DESC LIMIT 1';
  }

  db.get(findSql, findParams, (err, sub) => {
    if (err) return callback(err);
    if (!sub) return callback(new Error('Aucun abonnement actif trouvé pour cet utilisateur' + (subscriptionId ? ` avec l\'ID ${subscriptionId}` : '')));

    // Update the status to 'pending_cancellation'. The subscription remains active until endDate.
    // A background job/check would later change status to 'cancelled' after endDate.
    const updateSql = `
      UPDATE ClientSubscriptions
      SET status = 'pending_cancellation',
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active' -- Only cancel active subscriptions
    `;
    db.run(updateSql, [sub.id], function(err) {
      if (err) return callback(err);
      callback(null, { cancelledSubscriptionId: sub.id, changes: this.changes });
    });
  });
};

/**
 * Get all subscription history for a client user ID
 * @param {Number} userId - User ID
 * @param {Function} callback - Callback function
 */
exports.getClientSubscriptionHistoryByUserId = (userId, callback) => {
  // Check if user exists and is a client
  db.get('SELECT id, role FROM Users WHERE id = ?', [userId], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(new Error('Utilisateur non trouvé'));
    if (user.role !== 'client') return callback(new Error('Seuls les clients peuvent avoir un historique d\'abonnement'));

    // Get all subscriptions for the client, joining with plan details
    const sql = `
      SELECT cs.*, sp.name as planName, sp.price as planPrice
      FROM ClientSubscriptions cs
      JOIN SubscriptionPlans sp ON cs.planId = sp.id
      WHERE cs.userId = ?
      ORDER BY cs.createdAt DESC
    `;
    db.all(sql, [userId], (err, history) => {
      if (err) return callback(err);
      callback(null, { history }); // Returns an array, potentially empty
    });
  });
};
