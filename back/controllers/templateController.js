const documentTemplates = require('../utils/documentTemplates');

/**
 * Get all document templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTemplates = (req, res) => {
  try {
    const templates = documentTemplates.getAllTemplates();
    
    res.status(200).json({
      success: true,
      templates
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des modèles de documents:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modèles de documents'
    });
  }
};

/**
 * Get document template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTemplateById = (req, res) => {
  const { id } = req.params;
  
  try {
    const template = documentTemplates.getTemplateById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Modèle de document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      template
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du modèle de document:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du modèle de document'
    });
  }
};

/**
 * Get document template by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTemplatesByCategory = (req, res) => {
  const { category } = req.params;
  
  try {
    const templates = documentTemplates.getTemplatesByCategory(category);
    
    res.status(200).json({
      success: true,
      templates
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des modèles de documents par catégorie:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des modèles de documents par catégorie'
    });
  }
};

/**
 * Generate document from template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateDocument = (req, res) => {
  const { templateId, variables } = req.body;
  
  // Validate input
  if (!templateId || !variables) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir l\'ID du modèle et les variables'
    });
  }
  
  try {
    const document = documentTemplates.generateDocument(templateId, variables);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Modèle de document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      document
    });
  } catch (err) {
    console.error('Erreur lors de la génération du document:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du document'
    });
  }
};

/**
 * Get template categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTemplateCategories = (req, res) => {
  try {
    const categories = documentTemplates.getCategories();
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des catégories de modèles:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories de modèles'
    });
  }
};

/**
 * Get template variables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTemplateVariables = (req, res) => {
  const { id } = req.params;
  
  try {
    const variables = documentTemplates.getTemplateVariables(id);
    
    if (!variables) {
      return res.status(404).json({
        success: false,
        message: 'Modèle de document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      variables
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des variables du modèle:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des variables du modèle'
    });
  }
};

/**
 * Search templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchTemplates = (req, res) => {
  const { searchTerm } = req.query;
  
  // Validate input
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un terme de recherche'
    });
  }
  
  try {
    const templates = documentTemplates.searchTemplates(searchTerm);
    
    res.status(200).json({
      success: true,
      templates
    });
  } catch (err) {
    console.error('Erreur lors de la recherche des modèles de documents:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des modèles de documents'
    });
  }
};
