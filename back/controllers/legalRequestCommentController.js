const LegalRequestCommentModel = require('../models/LegalRequestCommentModel');
const LegalRequestModel = require('../models/LegalRequestModel');

/**
 * Create a new comment for a legal request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createComment = (req, res) => {
  const { legalRequestId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  
  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Le contenu du commentaire est requis'
    });
  }
  
  // Check if legal request exists
  LegalRequestModel.getLegalRequestById(legalRequestId, (err, request) => {
    if (err) {
      console.error('Erreur lors de la vérification de la demande juridique:', err.message);
      
      if (err.message === 'Demande juridique non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Demande juridique non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la demande juridique'
      });
    }
    
    // Create comment
    LegalRequestCommentModel.createComment(
      {
        userId,
        legalRequestId,
        content
      },
      (err, comment) => {
        if (err) {
          console.error('Erreur lors de la création du commentaire:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du commentaire'
          });
        }
        
        res.status(201).json({
          success: true,
          message: 'Commentaire ajouté avec succès',
          comment
        });
      }
    );
  });
};

/**
 * Get comments for a legal request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getComments = (req, res) => {
  const { legalRequestId } = req.params;
  
  // Check if legal request exists
  LegalRequestModel.getLegalRequestById(legalRequestId, (err, request) => {
    if (err) {
      console.error('Erreur lors de la vérification de la demande juridique:', err.message);
      
      if (err.message === 'Demande juridique non trouvée') {
        return res.status(404).json({
          success: false,
          message: 'Demande juridique non trouvée'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la demande juridique'
      });
    }
    
    // Check if user is authorized to view this request's comments
    if (
      request.clientId !== req.user.id &&
      req.user.role !== 'lawyer' &&
      !['support', 'manager'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé aux commentaires de cette demande juridique'
      });
    }
    
    // Get comments
    LegalRequestCommentModel.getCommentsByLegalRequestId(legalRequestId, (err, comments) => {
      if (err) {
        console.error('Erreur lors de la récupération des commentaires:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des commentaires'
        });
      }
      
      res.status(200).json({
        success: true,
        comments
      });
    });
  });
};

/**
 * Delete a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteComment = (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
  
  // Only the comment author or admins can delete comments
  if (!['support', 'manager'].includes(req.user.role)) {
    LegalRequestCommentModel.deleteComment(commentId, userId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression du commentaire:', err.message);
        
        if (err.message === 'Commentaire non trouvé') {
          return res.status(404).json({
            success: false,
            message: 'Commentaire non trouvé'
          });
        }
        
        if (err.message === 'Non autorisé à supprimer ce commentaire') {
          return res.status(403).json({
            success: false,
            message: 'Non autorisé à supprimer ce commentaire'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression du commentaire'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Commentaire supprimé avec succès',
        commentId: result.id
      });
    });
  } else {
    // Admins can delete any comment
    db.run('DELETE FROM LegalRequestComments WHERE id = ?', [commentId], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression du commentaire:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression du commentaire'
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Commentaire non trouvé'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Commentaire supprimé avec succès',
        commentId
      });
    });
  }
};