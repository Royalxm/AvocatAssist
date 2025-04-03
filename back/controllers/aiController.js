const { validationResult } = require('express-validator');
const OpenRouterClient = require('../utils/openRouter');
const DocumentModel = require('../models/DocumentModel');
const UserModel = require('../models/UserModel');
const ChatModel = require('../models/ChatModel'); // Added
const ConversationModel = require('../models/ConversationModel'); // Added for suggestions
const MessageModel = require('../models/MessageModel'); // Added
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
  
  // Expect either chatId OR conversationId, but not both
  const { question, chatId: requestedChatId, conversationId: requestedConversationId } = req.body;
  const userId = req.user.id;

  let chat;
  let actualChatId;

  if (requestedChatId && requestedConversationId) {
    return res.status(400).json({ message: 'Provide either chatId or conversationId, not both.' });
  }

  if (!requestedChatId && !requestedConversationId) {
    return res.status(400).json({ message: 'Either chatId or conversationId is required.' });
  }

  try {
    if (requestedChatId) {
      const parsedChatId = parseInt(requestedChatId, 10);
      if (isNaN(parsedChatId)) {
        throw new AppError('Invalid Chat ID format.', 400);
      }
      chat = await ChatModel.findById(parsedChatId, userId);
      actualChatId = parsedChatId; // Keep the originally requested ID
    } else { // conversationId must be present
      const parsedConversationId = parseInt(requestedConversationId, 10);
      if (isNaN(parsedConversationId)) {
        throw new AppError('Invalid Conversation ID format.', 400);
      }
      // Fetch or create the chat associated with the conversation
      // We might need the conversation title if creating a new chat
      // For now, let's assume findOrCreateForConversation handles default title
      chat = await ChatModel.findOrCreateForConversation(userId, parsedConversationId);
      actualChatId = chat.id; // Use the ID from the found/created chat record
    }

    // Check if user has enough tokens
    // For simplicity, we'll assume each question costs 10 tokens
    const tokenCost = 10;

    // Get user
    const user = await new Promise((resolve, reject) => {
      UserModel.getUserById(userId, (err, user) => {
        if (err) return reject(new AppError('Erreur lors de la récupération de l\'utilisateur', 500));
        if (!user) return reject(new AppError('Utilisateur non trouvé', 404));
        resolve(user);
      });
    });

    if (user.creditBalance < tokenCost) {
      throw new AppError('Solde de jetons insuffisant', 400);
    }

    // --- Chat Handling ---
    // The 'chat' variable is now populated from the logic above
    if (!chat) {
      // This condition should ideally be caught by findById or findOrCreateForConversation
      // But we keep it as a safeguard
      throw new AppError('Chat non trouvé ou accès refusé.', 404);
    }

    // --- Save User Message ---
    await MessageModel.create(actualChatId, 'user', question);

    // Initialize documents array
    let projectDocuments = [];

    // If chat is associated with a project, get its documents
    if (chat.projectId) {
      projectDocuments = await new Promise((resolve, reject) => {
        DocumentModel.getDocumentsByProjectId(chat.projectId, (err, docs) => {
          if (err) {
            console.error('Error fetching project documents:', err);
            // Continue without documents if there's an error, or reject if critical
            return reject(new AppError('Erreur lors de la récupération des documents du projet.', 500));
          }
          resolve(docs || []);
        });
      });
    }
    // For conversation-based chats (chat.conversationId is set), we don't fetch project documents

    // --- Fetch Message History ---
    const messageHistory = await MessageModel.findByChatId(actualChatId);

    // --- Generate AI Response ---
    // Pass the fetched project documents and message history to the AI client
    // Generate AI Response - now returns an object { advice, suggestions }
    const { advice, suggestions: generatedSuggestions } = await OpenRouterClient.generateLegalAdvice(question, projectDocuments, messageHistory);

    // --- Save AI Message ---
    // Save AI Message (only the main advice part)
    const aiMessage = await MessageModel.create(actualChatId, 'ai', advice, tokenCost);

    // --- Update User Token Balance ---
    const updateResult = await new Promise((resolve, reject) => {
      UserModel.updateCreditBalance(
        userId,
        tokenCost,
        'debit',
        `Utilisation IA (Chat ${actualChatId})`,
        (err, result) => {
          if (err) return reject(new AppError('Erreur lors de la mise à jour du solde de jetons', 500));
          resolve(result);
        }
      );
    });

    // --- Save generated suggestions if present ---
    // Use the 'generatedSuggestions' array returned by generateLegalAdvice
    if (generatedSuggestions && generatedSuggestions.length > 0) {

      // Save suggestions to the appropriate table (Chats or Conversations)
      try {
        if (chat.conversationId) {
          // This chat is linked to a standalone conversation
          await ConversationModel.updateLastSuggestedQuestions(chat.conversationId, generatedSuggestions);
        } else if (chat.projectId) {
           // This chat is linked to a project (handled via Chats table directly)
           await ChatModel.updateLastSuggestedQuestions(actualChatId, generatedSuggestions);
        }
      } catch (suggestionSaveError) {
          console.error("Error saving suggested questions:", suggestionSaveError);
          // Decide if this error should be fatal or just logged
      }
    }

    // --- Send Response ---
    res.status(200).json({
      chatId: actualChatId, // Return the actual chat ID used
      response: advice, // Return the main advice
      messageId: aiMessage.id, // Return the ID of the AI message
      newBalance: updateResult.newBalance,
      suggestedQuestions: generatedSuggestions // Return the suggestions array
    });

  } catch (error) {
    // Let the asyncHandler manage the error response
    // If it's an AppError we created, it will use its status code. Otherwise, 500.
    throw error;
  }

    // Removed the redundant try...catch block.
    // asyncHandler will handle errors and pass them to the central error handler.
  // Removed the outer catch block. asyncHandler will handle errors.
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

// Lawyer-specific functions performLegalResearch and assistDrafting removed as per revised plan

module.exports = {
  askQuestion,
  getUserQueries,
  getQueryById,
  generateDocumentSummary,
  generateLegalRequestSummary,
  generateDocumentFromTemplate,
  getAvailableTemplates
};
