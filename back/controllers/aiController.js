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
  
  // chatId is required from the request body, which refers to the ID in the Chats table
  const { question, chatId: requestedChatId } = req.body; 
  const userId = req.user.id;
  
  if (!requestedChatId) {
    return res.status(400).json({ message: 'Chat ID is required.' });
  }
  const chatId = parseInt(requestedChatId, 10);
  if (isNaN(chatId)) {
     return res.status(400).json({ message: 'Invalid Chat ID format.' });
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
    // Fetch the chat record using the provided chatId
    const chat = await ChatModel.findById(chatId, userId);
    if (!chat) {
      throw new AppError('Chat non trouvé ou accès refusé.', 404);
    }

    // --- Save User Message ---
    await MessageModel.create(chatId, 'user', question);
    
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
    // For conversation-based chats (chat.conversationId), we don't need to fetch documents
    
    // --- Generate AI Response ---
    // Pass the fetched project documents to the AI client (empty array for conversation-based chats)
    let aiResponseText = await OpenRouterClient.generateLegalAdvice(question, projectDocuments); // Changed to let

      // --- Save AI Message ---
      const aiMessage = await MessageModel.create(chatId, 'ai', aiResponseText, tokenCost);

      // --- Update User Token Balance ---
      const updateResult = await new Promise((resolve, reject) => {
        UserModel.updateCreditBalance(
          userId,
          tokenCost,
          'debit',
          `Utilisation IA (Chat ${chatId})`,
          (err, result) => {
            if (err) return reject(new AppError('Erreur lors de la mise à jour du solde de jetons', 500));
            resolve(result);
          }
        );
      });

      // --- Extract and Save suggested questions if present ---
      let suggestedQuestions = [];
      const suggestedQuestionsMatch = aiResponseText.match(/QUESTIONS_SUGGÉRÉES:\s*\n((?:(?:\d+\.\s*.*?)(?:\n|$))+)/);
      
      if (suggestedQuestionsMatch && suggestedQuestionsMatch[1]) {
        // Extract the questions from the matched text
        const questionsText = suggestedQuestionsMatch[1];
        const questionMatches = questionsText.match(/\d+\.\s*(.*?)(?:\n|$)/g);
        
        if (questionMatches) {
          suggestedQuestions = questionMatches.map(q => {
            // Remove the number and trim
            return q.replace(/^\d+\.\s*/, '').trim();
          }).filter(q => q); // Filter out empty strings
        }
        
        // Remove the suggested questions section from the response text
        // This keeps the UI cleaner by not showing the QUESTIONS_SUGGÉRÉES section
        aiResponseText = aiResponseText.replace(/QUESTIONS_SUGGÉRÉES:[\s\S]*$/, '').trim();
        
        // Update the AI message in the database with the cleaned response
        await MessageModel.update(aiMessage.id, aiResponseText);

        // Save suggestions to the appropriate table (Chats or Conversations)
        try {
          if (chat.conversationId) {
            // This chat is linked to a standalone conversation
            await ConversationModel.updateLastSuggestedQuestions(chat.conversationId, suggestedQuestions);
          } else if (chat.projectId) {
             // This chat is linked to a project (handled via Chats table directly)
             await ChatModel.updateLastSuggestedQuestions(chatId, suggestedQuestions);
          }
        } catch (suggestionSaveError) {
            console.error("Error saving suggested questions:", suggestionSaveError);
            // Decide if this error should be fatal or just logged
        }
      }
      
      // --- Send Response ---
      res.status(200).json({
        chatId: chatId, // Return the chat ID (new or existing)
        response: aiResponseText,
        messageId: aiMessage.id, // Return the ID of the AI message
        newBalance: updateResult.newBalance,
        suggestedQuestions: suggestedQuestions // Include the extracted questions
      });

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

module.exports = {
  askQuestion,
  getUserQueries,
  getQueryById,
  generateDocumentSummary,
  generateLegalRequestSummary,
  generateDocumentFromTemplate,
  getAvailableTemplates
};
