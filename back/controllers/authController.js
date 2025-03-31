const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserModel = require('../models/UserModel');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Generate JWT token
 * @param {Number} userId - User ID
 * @returns {String} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !role) {
    return next(new AppError('Veuillez fournir tous les champs requis', 400));
  }
  
  // Validate role
  if (!['client', 'lawyer'].includes(role)) {
    return next(new AppError('Rôle invalide', 400));
  }
  
  // Check if user already exists
  UserModel.getUserByEmail(email, (err, existingUser) => {
    if (err) {
      return next(new AppError('Erreur lors de la vérification de l\'email', 500));
    }
    
    if (existingUser) {
      return next(new AppError('Cet email est déjà utilisé', 400));
    }
    
    // Create user
    UserModel.createUser({ name, email, password, role }, (err, user) => {
      if (err) {
        return next(new AppError('Erreur lors de la création de l\'utilisateur', 500));
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      // Remove password from response
      delete user.password;
      
      res.status(201).json({
        success: true,
        token,
        user
      });
    });
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }
  
  // Check if user exists
  UserModel.getUserByEmail(email, (err, user) => {
    if (err) {
      return next(new AppError('Erreur lors de la connexion', 500));
    }
    
    if (!user) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }
    
    // Check if password matches
    UserModel.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        return next(new AppError('Erreur lors de la vérification du mot de passe', 500));
      }
      
      if (!isMatch) {
        return next(new AppError('Email ou mot de passe incorrect', 401));
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      // Remove password from response
      delete user.password;
      
      res.status(200).json({
        success: true,
        token,
        user
      });
    });
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Validate required fields
  if (!currentPassword || !newPassword) {
    return next(new AppError('Veuillez fournir le mot de passe actuel et le nouveau mot de passe', 400));
  }
  
  // Get user with password
  UserModel.getUserByEmail(req.user.email, (err, user) => {
    if (err) {
      return next(new AppError('Erreur lors de la récupération de l\'utilisateur', 500));
    }
    
    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }
    
    // Check if current password matches
    UserModel.comparePassword(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        return next(new AppError('Erreur lors de la vérification du mot de passe', 500));
      }
      
      if (!isMatch) {
        return next(new AppError('Mot de passe actuel incorrect', 401));
      }
      
      // Update password
      UserModel.updatePassword(user.id, newPassword, (err, result) => {
        if (err) {
          return next(new AppError('Erreur lors de la mise à jour du mot de passe', 500));
        }
        
        res.status(200).json({
          success: true,
          message: 'Mot de passe mis à jour avec succès'
        });
      });
    });
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  // Validate required fields
  if (!email) {
    return next(new AppError('Veuillez fournir un email', 400));
  }
  
  // Check if user exists
  UserModel.getUserByEmail(email, (err, user) => {
    if (err) {
      return next(new AppError('Erreur lors de la récupération de l\'utilisateur', 500));
    }
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Update user with reset token
    // In a real app, you would store resetPasswordToken and resetPasswordExpire in the database
    // For this example, we'll just return the token
    
    // Send email with reset token
    // In a real app, you would send an email with the reset link
    // For this example, we'll just return the token
    
    res.status(200).json({
      success: true,
      message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation',
      resetToken // Remove this in production
    });
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;
  
  // Validate required fields
  if (!token || !newPassword) {
    return next(new AppError('Veuillez fournir un token et un nouveau mot de passe', 400));
  }
  
  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // In a real app, you would find the user with the reset token and check if it's expired
  // For this example, we'll just return success
  
  res.status(200).json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès'
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});
