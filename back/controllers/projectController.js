const ProjectModel = require('../models/ProjectModel');
const DocumentModel = require('../models/DocumentModel');

/**
 * Create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createProject = (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  
  // Validate input
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un titre pour le projet'
    });
  }
  
  // Create project
  ProjectModel.createProject(
    {
      userId,
      title,
      description
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la création du projet:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du projet'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Projet créé avec succès',
        projectId: result.projectId
      });
    }
  );
};

/**
 * Get project by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  ProjectModel.getProjectById(id, (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err.message);
      
      if (err.message === 'Projet non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du projet'
      });
    }
    
    // Check if project belongs to user
    if (project.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce projet'
      });
    }
    
    // Get project documents
    ProjectModel.getProjectDocuments(id, (err, documents) => {
      if (err) {
        console.error('Erreur lors de la récupération des documents du projet:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des documents du projet'
        });
      }
      
      project.documents = documents;
      
      res.status(200).json({
        success: true,
        project
      });
    });
  });
};

/**
 * Get user's projects with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProjects = (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  ProjectModel.getProjectsByUserId(userId, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des projets:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des projets'
      });
    }
    
    res.status(200).json({
      success: true,
      projects: result.projects,
      pagination: result.pagination
    });
  });
};

/**
 * Update project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = req.user.id;
  
  // Check if project exists and belongs to user
  ProjectModel.getProjectById(id, (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err.message);
      
      if (err.message === 'Projet non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du projet'
      });
    }
    
    // Check if project belongs to user
    if (project.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce projet'
      });
    }
    
    // Update project
    ProjectModel.updateProject(
      id,
      {
        title,
        description
      },
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du projet:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du projet'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Projet mis à jour avec succès',
          projectId: result.projectId
        });
      }
    );
  });
};

/**
 * Delete project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProject = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Check if project exists and belongs to user
  ProjectModel.getProjectById(id, (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err.message);
      
      if (err.message === 'Projet non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du projet'
      });
    }
    
    // Check if project belongs to user
    if (project.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce projet'
      });
    }
    
    // Delete project
    ProjectModel.deleteProject(id, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression du projet:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression du projet'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Projet supprimé avec succès',
        projectId: result.projectId
      });
    });
  });
};

/**
 * Add document to project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addDocumentToProject = (req, res) => {
  const { id } = req.params;
  const { documentId } = req.body;
  const userId = req.user.id;
  
  // Validate input
  if (!documentId) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID du document'
    });
  }
  
  // Check if project exists and belongs to user
  ProjectModel.getProjectById(id, (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err.message);
      
      if (err.message === 'Projet non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du projet'
      });
    }
    
    // Check if project belongs to user
    if (project.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce projet'
      });
    }
    
    // Check if document exists and belongs to user
    DocumentModel.getDocumentById(documentId, (err, document) => {
      if (err) {
        console.error('Erreur lors de la récupération du document:', err.message);
        
        if (err.message === 'Document non trouvé') {
          return res.status(404).json({
            success: false,
            message: 'Document non trouvé'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du document'
        });
      }
      
      // Check if document belongs to user
      if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à ce document'
        });
      }
      
      // Add document to project
      ProjectModel.addDocumentToProject(id, documentId, (err, result) => {
        if (err) {
          console.error('Erreur lors de l\'ajout du document au projet:', err.message);
          
          if (err.message === 'Le document n\'appartient pas à l\'utilisateur du projet') {
            return res.status(400).json({
              success: false,
              message: 'Le document n\'appartient pas à l\'utilisateur du projet'
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout du document au projet'
          });
        }
        
        res.status(200).json({
          success: true,
          message: 'Document ajouté au projet avec succès',
          projectId: result.projectId,
          documentId: result.documentId
        });
      });
    });
  });
};

/**
 * Remove document from project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeDocumentFromProject = (req, res) => {
  const { id, documentId } = req.params;
  const userId = req.user.id;
  
  // Check if project exists and belongs to user
  ProjectModel.getProjectById(id, (err, project) => {
    if (err) {
      console.error('Erreur lors de la récupération du projet:', err.message);
      
      if (err.message === 'Projet non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du projet'
      });
    }
    
    // Check if project belongs to user
    if (project.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce projet'
      });
    }
    
    // Remove document from project
    ProjectModel.removeDocumentFromProject(id, documentId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression du document du projet:', err.message);
        
        if (err.message === 'Document non trouvé dans ce projet') {
          return res.status(404).json({
            success: false,
            message: 'Document non trouvé dans ce projet'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression du document du projet'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Document supprimé du projet avec succès',
        projectId: result.projectId,
        documentId: result.documentId
      });
    });
  });
};

/**
 * Search projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchProjects = (req, res) => {
  const userId = req.user.id;
  const { searchTerm } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Validate input
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un terme de recherche'
    });
  }
  
  ProjectModel.searchProjects(userId, searchTerm, page, limit, (err, result) => {
    if (err) {
      console.error('Erreur lors de la recherche des projets:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche des projets'
      });
    }
    
    res.status(200).json({
      success: true,
      projects: result.projects,
      pagination: result.pagination
    });
  });
};
