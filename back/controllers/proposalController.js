const ProposalModel = require('../models/ProposalModel');
const LegalRequestModel = require('../models/LegalRequestModel');

/**
 * Create a new proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createProposal = (req, res) => {
  const { requestId, proposalText, price } = req.body;
  const lawyerId = req.user.id;
  
  // Validate input
  if (!requestId || !proposalText || !price) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir tous les champs requis'
    });
  }
  
  // Validate price
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le prix doit être un nombre positif'
    });
  }
  
  // Check if user is a lawyer
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({
      success: false,
      message: 'Seuls les avocats peuvent soumettre des propositions'
    });
  }
  
  // Create proposal
  ProposalModel.createProposal(
    {
      requestId,
      lawyerId,
      proposalText,
      price
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la création de la proposition:', err.message);
        
        if (err.message === 'Demande juridique non trouvée') {
          return res.status(404).json({
            success: false,
            message: 'Demande juridique non trouvée'
          });
        }
        
        if (err.message === 'La demande juridique n\'est pas ouverte') {
          return res.status(400).json({
            success: false,
            message: 'La demande juridique n\'est pas ouverte'
          });
        }
        
        if (err.message === 'Vous avez déjà soumis une proposition pour cette demande') {
          return res.status(400).json({
            success: false,
            message: 'Vous avez déjà soumis une proposition pour cette demande'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de la proposition'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Proposition créée avec succès',
        proposalId: result.proposalId
      });
    }
  );
};

/**
 * Get proposal by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProposalById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  ProposalModel.getProposalById(id, (err, proposal) => {
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
    
    // Check if user is authorized to view this proposal
    const isClient = proposal.request.clientId === userId;
    const isLawyer = proposal.lawyerId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isLawyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette proposition'
      });
    }
    
    res.status(200).json({
      success: true,
      proposal
    });
  });
};

/**
 * Get proposals by request ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProposalsByRequestId = (req, res) => {
  const { requestId } = req.params;
  const userId = req.user.id;
  
  // Check if legal request exists and user is authorized to view its proposals
  LegalRequestModel.getLegalRequestById(requestId, (err, request) => {
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
    
    // Check if user is authorized to view proposals for this request
    const isClient = request.clientId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé aux propositions de cette demande'
      });
    }
    
    // Get proposals
    ProposalModel.getProposalsByRequestId(requestId, (err, proposals) => {
      if (err) {
        console.error('Erreur lors de la récupération des propositions:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des propositions'
        });
      }
      
      res.status(200).json({
        success: true,
        proposals
      });
    });
  });
};

/**
 * Get proposals by lawyer ID with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLawyerProposals = (req, res) => {
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
  
  ProposalModel.getProposalsByLawyerId(lawyerId, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des propositions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des propositions'
      });
    }
    
    res.status(200).json({
      success: true,
      proposals: result.proposals,
      pagination: result.pagination
    });
  });
};

/**
 * Update proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProposal = (req, res) => {
  const { id } = req.params;
  const { proposalText, price, status } = req.body;
  const userId = req.user.id;
  
  // Get proposal to check ownership and status
  ProposalModel.getProposalById(id, (err, proposal) => {
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
    
    // Check if user is authorized to update this proposal
    const isLawyer = proposal.lawyerId === userId;
    const isClient = proposal.request.clientId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    // Lawyers can update proposalText and price, but not status
    if (isLawyer && status && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Les avocats ne peuvent pas modifier le statut de la proposition'
      });
    }
    
    // Clients can only update status to 'acceptée' or 'refusée'
    if (isClient && !isAdmin) {
      if (proposalText || price) {
        return res.status(403).json({
          success: false,
          message: 'Les clients ne peuvent pas modifier le texte ou le prix de la proposition'
        });
      }
      
      if (status && status !== 'acceptée' && status !== 'refusée') {
        return res.status(403).json({
          success: false,
          message: 'Les clients ne peuvent que accepter ou refuser une proposition'
        });
      }
    }
    
    // If not authorized at all
    if (!isLawyer && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette proposition'
      });
    }
    
    // Update proposal
    ProposalModel.updateProposal(
      id,
      {
        proposalText,
        price,
        status
      },
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour de la proposition:', err.message);
          
          if (err.message === 'Impossible de modifier une proposition déjà acceptée ou refusée') {
            return res.status(400).json({
              success: false,
              message: 'Impossible de modifier une proposition déjà acceptée ou refusée'
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la proposition'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Proposition mise à jour avec succès',
          proposalId: result.proposalId
        });
      }
    );
  });
};

/**
 * Delete proposal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProposal = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Get proposal to check ownership and status
  ProposalModel.getProposalById(id, (err, proposal) => {
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
    
    // Check if user is authorized to delete this proposal
    const isLawyer = proposal.lawyerId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isLawyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette proposition'
      });
    }
    
    // Delete proposal
    ProposalModel.deleteProposal(id, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de la proposition:', err.message);
        
        if (err.message === 'Impossible de supprimer une proposition acceptée') {
          return res.status(400).json({
            success: false,
            message: 'Impossible de supprimer une proposition acceptée'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression de la proposition'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Proposition supprimée avec succès',
        proposalId: result.proposalId
      });
    });
  });
};

/**
 * Get accepted proposal for a request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAcceptedProposal = (req, res) => {
  const { requestId } = req.params;
  const userId = req.user.id;
  
  // Check if legal request exists and user is authorized to view its accepted proposal
  LegalRequestModel.getLegalRequestById(requestId, (err, request) => {
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
    
    // Check if user is authorized to view the accepted proposal for this request
    const isClient = request.clientId === userId;
    const isAdmin = ['support', 'manager'].includes(req.user.role);
    
    if (!isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à la proposition acceptée de cette demande'
      });
    }
    
    // Get accepted proposal
    ProposalModel.getAcceptedProposalByRequestId(requestId, (err, proposal) => {
      if (err) {
        console.error('Erreur lors de la récupération de la proposition acceptée:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de la proposition acceptée'
        });
      }
      
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Aucune proposition acceptée trouvée pour cette demande'
        });
      }
      
      res.status(200).json({
        success: true,
        proposal
      });
    });
  });
};

/**
 * Get proposal statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProposalStats = (req, res) => {
  // Only admins can view proposal statistics
  if (!['support', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé aux statistiques des propositions'
    });
  }
  
  ProposalModel.getProposalStats((err, stats) => {
    if (err) {
      console.error('Erreur lors de la récupération des statistiques des propositions:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques des propositions'
      });
    }
    
    res.status(200).json({
      success: true,
      stats
    });
  });
};
