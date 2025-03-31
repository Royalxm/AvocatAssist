const ProjectModel = require('../models/ProjectModel');
const ChatModel = require('../models/ChatModel'); // Import ChatModel
const DocumentModel = require('../models/DocumentModel');

/**
 * Create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createProject = (req, res) => {
  // Add type to destructuring
  const { title, description, type } = req.body;
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
      description,
      type // Pass type to model
    },
    async (err, projectResult) => { // Make callback async
      if (err) {
        console.error('Erreur lors de la création du projet:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du projet'
        });
      }

      const projectId = projectResult.projectId;

      // Now, create the associated chat
      try {
        const chatResult = await ChatModel.create(userId, {
          projectId: projectId,
          title: `Chat for ${title}`
        }); // Use project title for chat title

        res.status(201).json({
          success: true,
          message: 'Projet et chat associé créés avec succès',
          projectId: projectId,
          chatId: chatResult.id // Include chatId in the response
        });

      } catch (chatErr) {
        console.error('Erreur lors de la création du chat associé:', chatErr.message);
        // Consider if we should rollback project creation or just report the chat error
        // For now, report that project was created but chat failed
        return res.status(500).json({
          success: false, // Or maybe true, but with a warning? Depends on desired behavior.
          message: 'Projet créé, mais erreur lors de la création du chat associé.',
          projectId: projectId, // Still return projectId
          error: chatErr.message
        });
      }
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
    
    // Documents are no longer fetched here; they should be fetched via DocumentModel routes/controller
    // Remove the ProjectModel.getProjectDocuments call
    
    res.status(200).json({
      success: true,
      project // Return project data without documents embedded
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
  // Add type to destructuring
  const { title, description, type } = req.body;
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
        description,
        type // Pass type to model
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

// Removed addDocumentToProject and removeDocumentFromProject as they are obsolete

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
