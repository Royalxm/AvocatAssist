const TransactionModel = require('../models/TransactionModel');
const ProposalModel = require('../models/ProposalModel');

/**
 * Create a new transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTransaction = (req, res) => {
  const { proposalId } = req.body;
  const clientId = req.user.id;
  
  // Validate input
  if (!proposalId) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID de la proposition'
    });
  }
  
  // Check if user is a client
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Seuls les clients peuvent créer des transactions'
    });
  }
  
  // Get proposal to check if it's accepted and belongs to the client
  ProposalModel.getProposalById(proposalId, (err, proposal) => {
    if (err) {
      console.error('Erreur lors de la récupération de la proposition:', err.message);
      
      if (err.message === 'Proposition non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Proposition non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la proposition'
      });
    }
    
    // Check if proposal is accepted
    if (proposal.status !== 'acceptée') {
      return res.status(400).json({
        success: false,
        message: 'La proposition n\'est pas acceptée'
      });
    }
    
    // Check if client is the owner of the legal request
    if (proposal.request.clientId !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à créer une transaction pour cette proposition'
      });
    }
    
    // Calculate commission (10% of the price)
    const amount = proposal.price;
    const commission = Math.round(amount * 0.1);
    
    // Create transaction
    TransactionModel.createTransaction(
      {
        proposalId,
        clientId,
        amount,
        commission
      },
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la création de la transaction:', err.message);
          
          if (err.message === 'Une transaction existe déjà pour cette proposition') {
            return res.status(400).json({
              success: false,
              message: 'Une transaction existe déjà pour cette proposition'
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la transaction'
          });
        }
        
        res.status(201).json({
          success: true,
          message: 'Transaction créée avec succès',
          transactionId: result.transactionId
        });
      }
    );
  });
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTransactionById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  TransactionModel.getTransactionById(id, (err, transaction) => {
    if (err) {
      console.error('Erreur lors de la récupération de la transaction:', err.message);
      
      if (err.message === 'Transaction non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Transaction non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la transaction'
      });
    }
    
    // Check if user is authorized to view this transaction
    const isClient = transaction.clientId === userId;
    const isLawyer = transaction.lawyer.id === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isLawyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      transaction
    });
  });
};

/**
 * Get transactions by client ID with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClientTransactions = (req, res) => {
  const clientId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Check if user is a client
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  TransactionModel.getTransactionsByClientId(clientId, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des transactions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des transactions'
      });
    }
    
    res.status(200).json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination
    });
  });
};

/**
 * Get transactions by lawyer ID with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLawyerTransactions = (req, res) => {
  const lawyerId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Check if user is a lawyer
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  TransactionModel.getTransactionsByLawyerId(lawyerId, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des transactions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des transactions'
      });
    }
    
    res.status(200).json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination
    });
  });
};

/**
 * Get all transactions with pagination (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTransactions = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Check if user is an admin
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  TransactionModel.getAllTransactions(page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des transactions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des transactions'
      });
    }
    
    res.status(200).json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination
    });
  });
};

/**
 * Get transaction statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTransactionStats = (req, res) => {
  // Check if user is an admin
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  TransactionModel.getTransactionStats((err, stats) => {
    if (err) {
      console.error('Erreur lors de la récupération des statistiques des transactions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques des transactions'
      });
    }
    
    res.status(200).json({
      success: true,
      stats
    });
  });
};
