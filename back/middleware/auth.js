const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

/**
 * Authentication middleware
 * Verifies JWT token and sets req.user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    UserModel.getUserById(decoded.userId, (err, user) => {
      if (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Set user in request
      req.user = user;
      next();
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token invalide' });
  }
};

/**
 * Admin middleware
 * Checks if user is admin (support or manager)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès interdit, droits administrateur requis' });
  }
  
  next();
};

/**
 * Manager middleware
 * Checks if user is manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Accès interdit, droits manager requis' });
  }
  
  next();
};

/**
 * Lawyer middleware
 * Checks if user is lawyer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isLawyer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ message: 'Accès interdit, droits avocat requis' });
  }
  
  next();
};

/**
 * Client middleware
 * Checks if user is client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Accès interdit, droits client requis' });
  }
  
  next();
};

/**
 * Role authorization middleware
 * Checks if user has one of the allowed roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès interdit, rôle requis: ${roles.join(' ou ')}` 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate: auth, // Alias for auth
  auth,
  authorize,
  isAdmin,
  isManager,
  isLawyer,
  isClient
};
