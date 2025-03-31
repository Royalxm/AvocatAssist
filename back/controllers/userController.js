const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');
const ProjectModel = require('../models/ProjectModel'); // Import ProjectModel
const LegalRequestModel = require('../models/LegalRequestModel'); // Import LegalRequestModel
const ProposalModel = require('../models/ProposalModel'); // Import ProposalModel
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  // Get all users
  UserModel.getAllUsers(
    {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search
    },
    (err, result) => {
      if (err) {
        console.error('Get all users error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Check if user is requesting their own profile or is an admin
  if (req.user.id !== parseInt(userId) && !['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  // Get user by ID
  UserModel.getUserById(userId, (err, user) => {
    if (err) {
      console.error('Get user by ID error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json({ user });
  });
});

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const userId = req.params.id;
  
  // Check if user is updating their own profile or is an admin
  if (req.user.id !== parseInt(userId) && !['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  // Get fields to update
  const { name, email, specialties, experience, baseRate } = req.body;
  
  // Create update object
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  
  // Lawyer specific fields
  if (req.user.role === 'lawyer' || (req.user.role === 'manager' && req.body.role === 'lawyer')) {
    if (specialties) updateData.specialties = specialties;
    if (experience) updateData.experience = experience;
    if (baseRate !== undefined) updateData.baseRate = baseRate;
  }
  
  // Update user
  UserModel.updateUser(userId, updateData, (err, user) => {
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user
    });
  });
});

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Delete user
  UserModel.deleteUser(userId, (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
    
    res.status(200).json({
      message: 'Utilisateur supprimé avec succès'
    });
  });
});

/**
 * Get lawyers
 * @route GET /api/users/lawyers
 * @access Public
 */
const getLawyers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, specialties, search } = req.query;
  
  // Get lawyers
  UserModel.getLawyers(
    {
      page: parseInt(page),
      limit: parseInt(limit),
      specialties,
      search
    },
    (err, result) => {
      if (err) {
        console.error('Get lawyers error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des avocats' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Update credit balance
 * @route PUT /api/users/:id/credit
 * @access Private (Admin only)
 */
const updateCreditBalance = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const userId = req.params.id;
  const { amount, transactionType, description } = req.body;
  
  // Update credit balance
  UserModel.updateCreditBalance(
    userId,
    parseInt(amount),
    transactionType,
    description,
    (err, result) => {
      if (err) {
        console.error('Update credit balance error:', err);
        return res.status(500).json({ message: `Erreur lors de la mise à jour du solde: ${err.message}` });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Get credit transactions
 * @route GET /api/users/:id/transactions
 * @access Private
 */
const getCreditTransactions = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { page = 1, limit = 10 } = req.query;
  
  // Check if user is requesting their own transactions or is an admin
  if (req.user.id !== parseInt(userId) && !['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  // Get credit transactions
  UserModel.getCreditTransactions(
    userId,
    {
      page: parseInt(page),
      limit: parseInt(limit)
    },
    (err, result) => {
      if (err) {
        console.error('Get credit transactions error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des transactions' });
      }
      
      res.status(200).json(result);
    }
  );
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLawyers,
  updateCreditBalance,
  getCreditTransactions
};

/**
 * Get dashboard stats for the logged-in user
 * @route GET /api/users/stats
 * @access Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch counts in parallel
    const [projectResult, requestCount, proposalCount] = await Promise.all([
      // Fetch projects just to get the total count from pagination
      new Promise((resolve, reject) => {
        ProjectModel.getProjectsByUserId(userId, 1, 1, (err, result) => { // Fetch page 1, limit 1 to get total
          if (err) return reject(err);
          resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        LegalRequestModel.countByClientId(userId, (err, count) => {
          if (err) return reject(err);
          resolve(count);
        });
      }),
      new Promise((resolve, reject) => {
        ProposalModel.countByClientId(userId, (err, count) => {
          if (err) return reject(err);
          resolve(count);
        });
      })
    ]);

    const projectCount = projectResult.pagination.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        projects: projectCount,
        legalRequests: requestCount,
        proposals: proposalCount
        // Credit balance is usually fetched separately or part of user profile/auth context
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques utilisateur' });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLawyers,
  updateCreditBalance,
  getCreditTransactions,
  getUserStats // Export the new function
};
