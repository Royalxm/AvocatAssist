const SubscriptionModel = require('../models/SubscriptionModel');
const UserModel = require('../models/UserModel'); // Needed for role checks

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
// Renaming this to be specific to lawyers
exports.subscribeLawyerToPlan = (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!planId) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID du plan d\'abonnement'
    });
  }

  // This route is specifically for lawyers now
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  // Using the original lawyer-specific model function
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
// Renaming this to be specific to lawyers
exports.getLawyerSubscription = (req, res) => {
  const userId = req.user.id;

  // This route is specifically for lawyers now
  if (req.user.role !== 'lawyer') {
     return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  // Using the original lawyer-specific model function
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


// --- Client Subscription Controllers ---

/**
 * Initiate subscription process for a client
 * Creates a 'pending_payment' subscription record.
 * @param {Object} req - Express request object (expects planId in body)
 * @param {Object} res - Express response object
 */
exports.subscribeClientToPlan = (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'client') {
    return res.status(403).json({ success: false, message: 'Seuls les clients peuvent souscrire à un abonnement' });
  }

  if (!planId) {
    return res.status(400).json({ success: false, message: 'Veuillez fournir l\'ID du plan' });
  }

  // Fetch details of the target plan
  SubscriptionModel.getPlanById(planId, (err, targetPlan) => {
    if (err || !targetPlan) {
      return res.status(404).json({ success: false, message: 'Plan cible non trouvé' });
    }

    // Check if user already has an active subscription
    SubscriptionModel.getClientSubscriptionByUserId(userId, (err, currentSubResult) => {
      if (err) {
        console.error('Erreur vérification abonnement existant:', err.message);
        return res.status(500).json({ success: false, message: 'Erreur serveur lors de la vérification de l\'abonnement existant' });
      }

      const currentSubscription = currentSubResult?.subscription;

      // --- Upgrade Logic ---
      if (currentSubscription && currentSubscription.status === 'active') {
        // User has an active sub, check if it's an upgrade
        if (targetPlan.price <= currentSubscription.planPrice) {
          // Disallow downgrade or choosing the same plan for now
          return res.status(400).json({ success: false, message: 'Vous ne pouvez qu\'améliorer votre plan actuel.' });
        }

        // It's an upgrade! Cancel the old one first.
        SubscriptionModel.cancelClientSubscription(userId, currentSubscription.id, (cancelErr, cancelResult) => {
          if (cancelErr) {
            console.error('Erreur lors de l\'annulation de l\'ancien plan (upgrade):', cancelErr.message);
            return res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à niveau (annulation échouée)' });
          }
          console.log(`Ancien abonnement ${currentSubscription.id} annulé pour upgrade.`);
          // Proceed to create the new pending subscription
          createPendingSubscription(userId, planId, res);
        });
      } else {
        // No active subscription or not active, proceed normally
        createPendingSubscription(userId, planId, res);
      }
    });
  });
};

// Helper function to create the pending subscription record
function createPendingSubscription(userId, planId, res) {
   const subscriptionData = {
    userId,
    planId,
    status: 'pending_payment', // Initial status
    // startDate, endDate, paymentProvider, paymentSubscriptionId will be set upon successful payment
    planId,
    status: 'pending_payment', // Initial status
  };
   SubscriptionModel.createClientSubscription(subscriptionData, (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de l\'abonnement client (pending):', err.message);
      if (err.message.includes('non trouvé') || err.message.includes('Seuls les clients')) {
         return res.status(400).json({ success: false, message: err.message });
      }
      // Handle potential unique constraint errors if cancellation logic fails somehow
      if (err.code === 'SQLITE_CONSTRAINT') {
         return res.status(400).json({ success: false, message: 'Un problème est survenu lors de la création du nouvel abonnement.' });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'initiation de l\'abonnement' });
    }

    res.status(201).json({
      success: true,
      message: 'Abonnement initié, en attente de paiement',
      subscriptionId: result.subscriptionId,
      planId: planId
    });
  });
}

/**
 * Simulate handling a successful payment callback/webhook
 * Updates the subscription status to 'active' and sets dates.
 * @param {Object} req - Express request object (expects subscriptionId, paymentProvider, paymentSubscriptionId in body)
 * @param {Object} res - Express response object
 */
exports.handleSubscriptionPayment = (req, res) => {
  // In a real app, this endpoint would be protected (e.g., webhook signature verification)
  // And likely triggered by the payment provider, not directly by the client frontend.
  const { subscriptionId, paymentProvider, paymentSubscriptionId, duration = 'monthly' } = req.body; // duration could be 'monthly' or 'yearly'
  const userId = req.user.id; // Ensure the user making the request owns the subscription

   if (!subscriptionId || !paymentProvider || !paymentSubscriptionId) {
    return res.status(400).json({ success: false, message: 'Données de paiement manquantes' });
  }

  // Verify the subscription belongs to the user and is pending
   SubscriptionModel.getClientSubscriptionByUserId(userId, (err, result) => {
     if (err || !result || !result.subscription || result.subscription.id !== parseInt(subscriptionId)) {
        return res.status(404).json({ success: false, message: 'Abonnement en attente non trouvé pour cet utilisateur' });
     }
     if (result.subscription.status !== 'pending_payment') {
        return res.status(400).json({ success: false, message: 'Cet abonnement n\'est pas en attente de paiement' });
     }

     // Calculate start and end dates
     const startDate = new Date();
     let endDate = new Date(startDate);
     if (duration === 'yearly') {
       endDate.setFullYear(startDate.getFullYear() + 1);
     } else { // Default to monthly
       endDate.setMonth(startDate.getMonth() + 1);
     }

     const updateData = {
       status: 'active',
       startDate: startDate.toISOString(),
       endDate: endDate.toISOString(),
       paymentProvider,
       paymentSubscriptionId
     };

     SubscriptionModel.updateClientSubscription(subscriptionId, updateData, (err, updateResult) => {
       if (err) {
         console.error('Erreur lors de l\'activation de l\'abonnement client:', err.message);
         return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'activation de l\'abonnement' });
       }

       res.status(200).json({
         success: true,
         message: 'Abonnement activé avec succès',
         subscriptionId: subscriptionId,
         endDate: updateData.endDate
       });
     });
   });
};


/**
 * Get the current client's subscription details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClientSubscription = (req, res) => {
  const userId = req.user.id;

  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  SubscriptionModel.getClientSubscriptionByUserId(userId, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'abonnement client:', err.message);
       if (err.message.includes('non trouvé') || err.message.includes('Seuls les clients')) {
         return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération de l\'abonnement' });
    }

    res.status(200).json({
      success: true,
      subscription: result.subscription // This will be null if no active/pending subscription exists
    });
  });
};

/**
 * Get the subscription history for the current client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClientSubscriptionHistory = (req, res) => {
  const userId = req.user.id;

  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  SubscriptionModel.getClientSubscriptionHistoryByUserId(userId, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'historique d\'abonnement client:', err.message);
       if (err.message.includes('non trouvé') || err.message.includes('Seuls les clients')) {
         return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération de l\'historique' });
    }

    res.status(200).json({
      success: true,
      history: result.history // This will be an array
    });
  });
};

/**
 * Cancel the current client's active subscription (sets status to pending_cancellation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelClientSubscription = (req, res) => {
  const userId = req.user.id;

  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  // We call the model function to cancel the latest active subscription for this user
  // The model now sets status to 'pending_cancellation'
  SubscriptionModel.cancelClientSubscription(userId, (err, result) => {
    if (err) {
      console.error('Erreur lors de la demande d\'annulation de l\'abonnement client:', err.message);
      if (err.message.includes('Aucun abonnement actif trouvé')) {
         return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur lors de la demande d\'annulation' });
    }

    res.status(200).json({
      success: true,
      // Updated message as requested
      message: 'Votre abonnement sera annulé à la fin de la période en cours.',
      cancelledSubscriptionId: result.cancelledSubscriptionId
    });
  });
};

/**
 * Cancel the current client's active subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelClientSubscription = (req, res) => {
  const userId = req.user.id;

  if (req.user.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Accès non autorisé pour ce rôle' });
  }

  // We call the model function to cancel the latest active subscription for this user
  SubscriptionModel.cancelClientSubscription(userId, (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'annulation de l\'abonnement client:', err.message);
      if (err.message.includes('Aucun abonnement actif trouvé')) {
         return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'annulation de l\'abonnement' });
    }

    res.status(200).json({
      success: true,
      message: 'Abonnement annulé avec succès',
      cancelledSubscriptionId: result.cancelledSubscriptionId
    });
  });
};
