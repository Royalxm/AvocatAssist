const { validationResult } = require('express-validator');
const OpenRouterClient = require('../utils/openRouter');
const QueryModel = require('../models/QueryModel');
const DocumentModel = require('../models/DocumentModel');
const UserModel = require('../models/UserModel');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Ask a question to the AI
 * @route POST /api/ai/ask
 * @access Private
 */
const askQuestion = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { question, documentIds } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user has enough tokens
    // For simplicity, we'll assume each question costs 10 tokens
    const tokenCost = 10;
    
    // Get user
    UserModel.getUserById(userId, async (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
      }
      
      // Check if user has enough tokens
      if (user.creditBalance < tokenCost) {
        return res.status(400).json({ message: 'Solde de jetons insuffisant' });
      }
      
      // Get related documents if provided
      let documents = [];
      if (documentIds && documentIds.length > 0) {
        // Get documents
        for (const docId of documentIds) {
          await new Promise((resolve, reject) => {
            DocumentModel.getDocumentById(docId, (err, doc) => {
              if (err) {
                console.error('Get document error:', err);
                return reject(err);
              }
              
              if (doc && doc.userId === userId) {
                documents.push(doc);
              }
              
              resolve();
            });
          });
        }
      }
      
      // Generate response
      const response = await OpenRouterClient.generateLegalAdvice(question, documents);
      
      // Save query to database
      QueryModel.createQuery(
        {
          userId,
          question,
          response,
          tokensUsed: tokenCost
        },
        (err, query) => {
          if (err) {
            console.error('Create query error:', err);
            return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la requête' });
          }
          
          // Update user token balance
          UserModel.updateCreditBalance(
            userId,
            tokenCost,
            'debit',
            'Utilisation de l\'assistant IA',
            (err, result) => {
              if (err) {
                console.error('Update credit balance error:', err);
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du solde de jetons' });
              }
              
              res.status(200).json({
                query,
                newBalance: result.newBalance
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la réponse' });
  }
});

/**
 * Get user queries
 * @route GET /api/ai/queries
 * @access Private
 */
const getUserQueries = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  
  // Get user queries
  QueryModel.getQueriesByUserId(
    userId,
    {
      page: parseInt(page),
      limit: parseInt(limit)
    },
    (err, result) => {
      if (err) {
        console.error('Get user queries error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des requêtes' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Get query by ID
 * @route GET /api/ai/queries/:id
 * @access Private
 */
const getQueryById = asyncHandler(async (req, res) => {
  const queryId = req.params.id;
  const userId = req.user.id;
  
  // Get query by ID
  QueryModel.getQueryById(queryId, (err, query) => {
    if (err) {
      console.error('Get query by ID error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération de la requête' });
    }
    
    if (!query) {
      return res.status(404).json({ message: 'Requête non trouvée' });
    }
    
    // Check if user is the owner of the query
    if (query.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.status(200).json({ query });
  });
});

/**
 * Generate document summary
 * @route POST /api/ai/summarize
 * @access Private
 */
const generateDocumentSummary = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { documentId } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user has enough tokens
    // For simplicity, we'll assume each summary costs 20 tokens
    const tokenCost = 20;
    
    // Get user
    UserModel.getUserById(userId, async (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
      }
      
      // Check if user has enough tokens
      if (user.creditBalance < tokenCost) {
        return res.status(400).json({ message: 'Solde de jetons insuffisant' });
      }
      
      // Get document
      DocumentModel.getDocumentById(documentId, async (err, document) => {
        if (err) {
          console.error('Get document error:', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
        }
        
        if (!document) {
          return res.status(404).json({ message: 'Document non trouvé' });
        }
        
        // Check if user is the owner of the document
        if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
        
        // Check if document has extracted text
        if (!document.extractedText) {
          return res.status(400).json({ message: 'Le document n\'a pas de texte extrait' });
        }
        
        // Generate summary
        const summary = await OpenRouterClient.generateDocumentSummary(document.extractedText);
        
        // Update user token balance
        UserModel.updateCreditBalance(
          userId,
          tokenCost,
          'debit',
          'Génération de résumé de document',
          (err, result) => {
            if (err) {
              console.error('Update credit balance error:', err);
              return res.status(500).json({ message: 'Erreur lors de la mise à jour du solde de jetons' });
            }
            
            res.status(200).json({
              summary,
              newBalance: result.newBalance
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du résumé' });
  }
});

/**
 * Generate legal request summary
 * @route POST /api/ai/legal-request-summary
 * @access Private
 */
const generateLegalRequestSummary = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { description } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user has enough tokens
    // For simplicity, we'll assume each summary costs 15 tokens
    const tokenCost = 15;
    
    // Get user
    UserModel.getUserById(userId, async (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
      }
      
      // Check if user has enough tokens
      if (user.creditBalance < tokenCost) {
        return res.status(400).json({ message: 'Solde de jetons insuffisant' });
      }
      
      // Generate summary
      const summary = await OpenRouterClient.generateLegalRequestSummary(description);
      
      // Update user token balance
      UserModel.updateCreditBalance(
        userId,
        tokenCost,
        'debit',
        'Génération de résumé de demande juridique',
        (err, result) => {
          if (err) {
            console.error('Update credit balance error:', err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du solde de jetons' });
          }
          
          res.status(200).json({
            summary,
            newBalance: result.newBalance
          });
        }
      );
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du résumé' });
  }
});

/**
 * Generate document from template
 * @route POST /api/ai/generate-document
 * @access Private
 */
const generateDocumentFromTemplate = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { templateName, variables } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user has enough tokens
    // For simplicity, we'll assume each document generation costs 5 tokens
    const tokenCost = 5;
    
    // Get user
    UserModel.getUserById(userId, async (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
      }
      
      // Check if user has enough tokens
      if (user.creditBalance < tokenCost) {
        return res.status(400).json({ message: 'Solde de jetons insuffisant' });
      }
      
      // Generate document
      const document = await OpenRouterClient.generateDocumentFromTemplate(templateName, variables);
      
      // Update user token balance
      UserModel.updateCreditBalance(
        userId,
        tokenCost,
        'debit',
        'Génération de document à partir d\'un modèle',
        (err, result) => {
          if (err) {
            console.error('Update credit balance error:', err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du solde de jetons' });
          }
          
          res.status(200).json({
            document,
            newBalance: result.newBalance
          });
        }
      );
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du document' });
  }
});

/**
 * Get available templates
 * @route GET /api/ai/templates
 * @access Private
 */
const getAvailableTemplates = asyncHandler(async (req, res) => {
  try {
    const templates = require('../utils/documentTemplates');
    
    // Get template names and descriptions
    const templateList = Object.keys(templates).map(key => {
      // Extract template name from key using regex
      const nameMatch = key.match(/([A-Z]?[a-z]+)/g);
      const name = nameMatch ? nameMatch.join(' ') : key;
      
      return {
        id: key,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        // Extract variables from template using regex
        variables: (templates[key].match(/{{([^}]+)}}/g) || []).map(v => v.replace(/[{}]/g, ''))
      };
    });
    
    res.status(200).json({ templates: templateList });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modèles' });
  }
});

module.exports = {
  askQuestion,
  getUserQueries,
  getQueryById,
  generateDocumentSummary,
  generateLegalRequestSummary,
  generateDocumentFromTemplate,
  getAvailableTemplates
};
