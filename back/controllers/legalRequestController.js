const LegalRequestModel = require('../models/LegalRequestModel');
const { generateDocumentSummary } = require('../utils/openRouter');

/**
 * Create a new legal request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createLegalRequest = async (req, res) => {
  const { description, documentText, title, projectId, summaryAI } = req.body;
  const clientId = req.user.id;
  
  // Validate input
  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir une description pour la demande juridique'
    });
  }
  
  try {
    
    // Create legal request
    LegalRequestModel.createLegalRequest(
      {
        clientId,
        title,
        description,
        projectId,
        summaryAI: summaryAI || null
      },
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la création de la demande juridique:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la demande juridique'
          });
        }
        
        res.status(201).json({
          success: true,
          message: 'Demande juridique créée avec succès',
          requestId: result.requestId,
          summaryAI
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors du traitement de la demande juridique:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la demande juridique'
    });
  }
};

/**
 * Get legal request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLegalRequestById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  LegalRequestModel.getLegalRequestById(id, (err, request) => {
    if (err) {
      console.error('Erreur lors de la récupération de la demande juridique:', err.message);
      
      if (err.message === 'Demande juridique non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Demande juridique non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la demande juridique'
      });
    }
    
    // Check if user is authorized to view this request
    if (
      request.clientId !== userId &&
      req.user.role !== 'lawyer' &&
      !['support', 'manager'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette demande juridique'
      });
    }
    
    res.status(200).json({
      success: true,
      request
    });
  });
};

/**
 * Get legal requests by client ID with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClientLegalRequests = (req, res) => {
  const clientId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  
  LegalRequestModel.getLegalRequestsByClientId(clientId, page, limit, status, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des demandes juridiques:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des demandes juridiques'
      });
    }
    
    res.status(200).json({
      success: true,
      requests: result.requests,
      pagination: result.pagination
    });
  });
};

/**
 * Get open legal requests with pagination (for lawyers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getOpenLegalRequests = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Only lawyers, support, and managers can view open requests
  if (req.user.role !== 'lawyer' && !['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé aux demandes juridiques ouvertes'
    });
  }
  
  LegalRequestModel.getOpenLegalRequests(page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des demandes juridiques ouvertes:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des demandes juridiques ouvertes'
      });
    }
    
    res.status(200).json({
      success: true,
      requests: result.requests,
      pagination: result.pagination
    });
  });
};

/**
 * Update legal request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateLegalRequest = (req, res) => {
  const { id } = req.params;
  const { description, status, summaryAI } = req.body;
  const userId = req.user.id;
  
  // Check if legal request exists and belongs to user
  LegalRequestModel.getLegalRequestById(id, (err, request) => {
    if (err) {
      console.error('Erreur lors de la récupération de la demande juridique:', err.message);
      
      if (err.message === 'Demande juridique non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Demande juridique non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la demande juridique'
      });
    }
    
    // Check if user is authorized to update this request
    const isClient = request.clientId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette demande juridique'
      });
    }
    
    // Clients can only update description and summaryAI
    if (isClient && !isAdmin && status) {
      return res.status(403).json({
        success: false,
        message: 'Les clients ne peuvent pas modifier le statut de la demande'
      });
    }
    
    // Update legal request
    LegalRequestModel.updateLegalRequest(
      id,
      {
        description,
        status,
        summaryAI
      },
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour de la demande juridique:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la demande juridique'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Demande juridique mise à jour avec succès',
          requestId: result.requestId
        });
      }
    );
  });
};

/**
 * Delete legal request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteLegalRequest = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Check if legal request exists and belongs to user
  LegalRequestModel.getLegalRequestById(id, (err, request) => {
    if (err) {
      console.error('Erreur lors de la récupération de la demande juridique:', err.message);
      
      if (err.message === 'Demande juridique non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Demande juridique non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la demande juridique'
      });
    }
    
    // Check if user is authorized to delete this request
    const isClient = request.clientId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette demande juridique'
      });
    }
    
    // Delete legal request
    LegalRequestModel.deleteLegalRequest(id, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de la demande juridique:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression de la demande juridique'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Demande juridique supprimée avec succès',
        requestId: result.requestId
      });
    });
  });
};

/**
 * Search legal requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchLegalRequests = (req, res) => {
  const { searchTerm, status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Validate input
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un terme de recherche'
    });
  }
  
  // Only admins can search all legal requests
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à la recherche de demandes juridiques'
    });
  }
  
  LegalRequestModel.searchLegalRequests(searchTerm, status, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la recherche des demandes juridiques:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche des demandes juridiques'
      });
    }
    
    res.status(200).json({
      success: true,
      requests: result.requests,
      pagination: result.pagination
    });
  });
};
