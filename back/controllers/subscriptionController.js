const SubscriptionModel = require('../models/SubscriptionModel');

/**
 * Get all subscription plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPlans = (req, res) => {
  SubscriptionModel.getAllPlans((err, plans) => {
    if (err) {
      console.error('Erreur lors de la récupération des plans d\'abonnement:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des plans d\'abonnement'
      });
    }
    
    res.status(200).json({
      success: true,
      plans
    });
  });
};

/**
 * Get subscription plan by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPlanById = (req, res) => {
  const { id } = req.params;
  
  SubscriptionModel.getPlanById(id, (err, plan) => {
    if (err) {
      console.error('Erreur lors de la récupération du plan d\'abonnement:', err.message);
      
      if (err.message === 'Plan d\'abonnement non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du plan d\'abonnement'
      });
    }
    
    res.status(200).json({
      success: true,
      plan
    });
  });
};

/**
 * Create a new subscription plan (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPlan = (req, res) => {
  const { name, price, tokenLimit, features } = req.body;
  
  // Validate input
  if (!name || price === undefined || tokenLimit === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir tous les champs requis'
    });
  }
  
  // Validate price
  if (isNaN(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Le prix doit être un nombre positif ou nul'
    });
  }
  
  // Validate token limit
  if (isNaN(tokenLimit) || tokenLimit < 0) {
    return res.status(400).json({
      success: false,
      message: 'La limite de jetons doit être un nombre positif ou nul'
    });
  }
  
  // Create plan
  SubscriptionModel.createPlan(
    {
      name,
      price,
      tokenLimit,
      features: features || null
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la création du plan d\'abonnement:', err.message);
        
        if (err.message === 'Un plan avec ce nom existe déjà') {
          return res.status(400).json({
            success: false,
            message: 'Un plan avec ce nom existe déjà'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du plan d\'abonnement'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Plan d\'abonnement créé avec succès',
        planId: result.planId
      });
    }
  );
};

/**
 * Update subscription plan (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePlan = (req, res) => {
  const { id } = req.params;
  const { name, price, tokenLimit, features } = req.body;
  
  // Validate price if provided
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Le prix doit être un nombre positif ou nul'
    });
  }
  
  // Validate token limit if provided
  if (tokenLimit !== undefined && (isNaN(tokenLimit) || tokenLimit < 0)) {
    return res.status(400).json({
      success: false,
      message: 'La limite de jetons doit être un nombre positif ou nul'
    });
  }
  
  // Update plan
  SubscriptionModel.updatePlan(
    id,
    {
      name,
      price,
      tokenLimit,
      features
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du plan d\'abonnement:', err.message);
        
        if (err.message === 'Plan d\'abonnement non trouvé') {
          return res.status(404).json({
            success: false,
            message: 'Plan d\'abonnement non trouvé'
          });
        }
        
        if (err.message === 'Un plan avec ce nom existe déjà') {
          return res.status(400).json({
            success: false,
            message: 'Un plan avec ce nom existe déjà'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour du plan d\'abonnement'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Plan d\'abonnement mis à jour avec succès',
        planId: result.planId
      });
    }
  );
};

/**
 * Delete subscription plan (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePlan = (req, res) => {
  const { id } = req.params;
  
  SubscriptionModel.deletePlan(id, (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du plan d\'abonnement:', err.message);
      
      if (err.message === 'Plan d\'abonnement non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
      }
      
      if (err.message === 'Ce plan est actuellement utilisé par des avocats et ne peut pas être supprimé') {
        return res.status(400).json({
          success: false,
          message: 'Ce plan est actuellement utilisé par des avocats et ne peut pas être supprimé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du plan d\'abonnement'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Plan d\'abonnement supprimé avec succès',
      planId: result.planId
    });
  });
};

/**
 * Subscribe user to a plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.subscribeToPlan = (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;
  
  // Validate input
  if (!planId) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID du plan d\'abonnement'
    });
  }
  
  // Check if user is a lawyer
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({
      success: false,
      message: 'Seuls les avocats peuvent souscrire à un plan'
    });
  }
  
  // Subscribe to plan
  SubscriptionModel.subscribeToPlan(userId, planId, (err, result) => {
    if (err) {
      console.error('Erreur lors de la souscription au plan d\'abonnement:', err.message);
      
      if (err.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      if (err.message === 'Plan d\'abonnement non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
      }
      
      if (err.message === 'Seuls les avocats peuvent souscrire à un plan') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les avocats peuvent souscrire à un plan'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la souscription au plan d\'abonnement'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Souscription au plan d\'abonnement effectuée avec succès',
      userId: result.userId,
      planId: result.planId,
      planName: result.planName
    });
  });
};

/**
 * Get user subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserSubscription = (req, res) => {
  const userId = req.user.id;
  
  // Check if user is a lawyer
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({
      success: false,
      message: 'Seuls les avocats peuvent avoir un abonnement'
    });
  }
  
  SubscriptionModel.getUserSubscription(userId, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'abonnement de l\'utilisateur:', err.message);
      
      if (err.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      if (err.message === 'Seuls les avocats peuvent avoir un abonnement') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les avocats peuvent avoir un abonnement'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'abonnement de l\'utilisateur'
      });
    }
    
    res.status(200).json({
      success: true,
      subscription: result.subscription
    });
  });
};

/**
 * Update user token balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTokenBalance = (req, res) => {
  const { userId, amount } = req.body;
  
  // Validate input
  if (userId === undefined || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID de l\'utilisateur et le montant'
    });
  }
  
  // Validate amount
  if (isNaN(amount)) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être un nombre'
    });
  }
  
  // Check if user is an admin
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  // Update token balance
  SubscriptionModel.updateTokenBalance(userId, amount, (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du solde de jetons:', err.message);
      
      if (err.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      if (err.message === 'Seuls les avocats peuvent avoir un solde de jetons') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les avocats peuvent avoir un solde de jetons'
        });
      }
      
      if (err.message === 'Profil d\'avocat non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Profil d\'avocat non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du solde de jetons'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Solde de jetons mis à jour avec succès',
      userId: result.userId,
      newBalance: result.newBalance
    });
  });
};

/**
 * Reset token balances for all users with a specific plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resetTokenBalances = (req, res) => {
  const { planName } = req.body;
  
  // Validate input
  if (!planName) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir le nom du plan d\'abonnement'
    });
  }
  
  // Check if user is an admin
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  // Reset token balances
  SubscriptionModel.resetTokenBalances(planName, (err, result) => {
    if (err) {
      console.error('Erreur lors de la réinitialisation des soldes de jetons:', err.message);
      
      if (err.message === 'Plan d\'abonnement non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation des soldes de jetons'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Soldes de jetons réinitialisés avec succès',
      planName: result.planName,
      tokenLimit: result.tokenLimit,
      usersUpdated: result.usersUpdated
    });
  });
};
