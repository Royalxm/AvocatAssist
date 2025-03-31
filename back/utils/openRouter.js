const axios = require('axios');
const ApiSettingsModel = require('../models/ApiSettingsModel');

/**
 * OpenRouter API client
 * Handles API calls to OpenRouter or OpenAI
 */
const OpenRouterClient = {
  /**
   * Get API settings
   * @returns {Promise<Object>} - API settings
   */
  getApiSettings: () => {
    return new Promise((resolve, reject) => {
      ApiSettingsModel.getDefaultApiSetting((err, setting) => {
        if (err) {
          console.error("Error getting API settings:", err); // Added log
          return reject(err);
        }
        
        if (!setting) {
          console.error("No API settings found in DB."); // Added log
          return reject(new Error('Aucun paramètre API trouvé'));
        }
        
        resolve(setting);
      });
    });
  },
  
  /**
   * Create chat completion
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - API response
   */
  createChatCompletion: async (messages, options = {}) => {
    try {
      // Get API settings
      const apiSettings = await OpenRouterClient.getApiSettings();
      // console.log("DEBUG: Retrieved API Settings:", apiSettings); // Keep commented for now

      // Check if apiKey exists and is a string
      if (!apiSettings || typeof apiSettings.apiKey !== 'string') {
        console.error("DEBUG: Invalid or missing apiKey in settings:", apiSettings);
        throw new Error('Invalid or missing API key');
      }
      
      // Set default options
      const defaultOptions = {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      };
      
      // Merge options
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Create request payload
      const payload = {
        model: apiSettings.modelName || 'openai/gpt-3.5-turbo',
        messages,
        ...mergedOptions
      };
      // console.log("DEBUG: Request Payload:", JSON.stringify(payload, null, 2)); // Keep commented for now
      
      // Set headers
      const apiKeyTrimmed = apiSettings.apiKey.trim(); // Trim whitespace
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyTrimmed}` 
      };
      
      // Add OpenRouter specific headers if using OpenRouter
      // if (apiSettings.provider === 'openrouter') {
      //   headers['HTTP-Referer'] = 'https://avocatassist.com'; // Commented out
      //   headers['X-Title'] = 'AvocatAssist'; // Commented out
      // }
      // console.log("DEBUG: Request Headers:", headers); // Keep commented for now
      
      // Make API request
      const endpoint = apiSettings.endpointUrl || 'https://openrouter.ai/api/v1/chat/completions';
      // console.log("DEBUG: Sending request to:", endpoint); // Keep commented for now

      const response = await axios.post(
        endpoint,
        payload,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('OpenRouter API Error Status:', error.response.status);
        console.error('OpenRouter API Error Headers:', error.response.headers);
        console.error('OpenRouter API Error Data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('OpenRouter API No Response:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('OpenRouter API Request Setup Error:', error.message);
      }
      // console.error('OpenRouter API Config:', error.config); // Keep commented for now
      throw error;
    }
  },
  
  /**
   * Generate text completion
   * @param {String} prompt - Text prompt
   * @param {Object} options - Additional options
   * @returns {Promise<String>} - Generated text
   */
  generateText: async (prompt, options = {}) => {
    try {
      const messages = [{ role: 'user', content: prompt }];
      const response = await OpenRouterClient.createChatCompletion(messages, options);
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  },
  
  /**
   * Generate document summary
   * @param {String} documentText - Document text
   * @param {Object} options - Additional options
   * @returns {Promise<String>} - Generated summary
   */
  generateDocumentSummary: async (documentText, options = {}) => {
    try {
      // Truncate document text if too long
      const maxLength = 15000; // Adjust based on token limits
      const truncatedText = documentText.length > maxLength
        ? documentText.substring(0, maxLength) + '...'
        : documentText;
      
      const prompt = `Veuillez résumer le document juridique suivant en français, en mettant en évidence les points clés, les obligations, les droits et les délais importants. Utilisez un langage clair et accessible pour les non-juristes. Formatez la réponse en Markdown. Document: ${truncatedText}`; // Added Markdown instruction
      
      const messages = [{ role: 'user', content: prompt }];
      const response = await OpenRouterClient.createChatCompletion(messages, {
        temperature: 0.5,
        max_tokens: 1500,
        ...options
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Document summary generation error:', error);
      throw error;
    }
  },
  
  /**
   * Generate legal advice
   * @param {String} question - User question
   * @param {Array} documents - Related documents
   * @param {Object} options - Additional options
   * @returns {Promise<String>} - Generated advice
   */
  generateLegalAdvice: async (question, documents = [], options = {}) => {
    try {
      let context = '';
      
      // Add document context if available
      if (documents && documents.length > 0) {
        // Limit context length
        const maxContextLength = 10000;
        let currentLength = 0;
        
        context = 'Contexte des documents:\n\n';
        
        for (const doc of documents) {
          let contentToAdd = null;
          // Prioritize using the summary if available
          if (doc.summary && doc.summary.trim() !== '') {
            contentToAdd = `Résumé du document "${doc.fileName}":\n${doc.summary}\n\n`;
          } 
          // Fallback to extracted text excerpt if no summary
          else if (doc.extractedText) {
            const excerpt = doc.extractedText.substring(0, 2000); // Take first 2000 chars
            contentToAdd = `Extrait du document "${doc.fileName}":\n${excerpt}\n\n`;
          }

          if (contentToAdd) {
            if (currentLength + contentToAdd.length <= maxContextLength) {
              context += contentToAdd;
              currentLength += contentToAdd.length;
            } else {
              // Add a note that context was truncated
              context += `\n[Note: Le contexte des documents suivants a été tronqué en raison de la limite de longueur.]\n`;
              break; 
            }
          }
        }
      }
      
      const prompt = `Vous êtes un assistant juridique expert. Votre objectif est d'aider l'utilisateur en fournissant des informations juridiques générales, claires et accessibles en français, basées sur le droit français.

Instructions :
1.  **Analyser la question :** Décomposez la question de l'utilisateur pour bien comprendre ses besoins. Adaptez le niveau de réponse si l'utilisateur semble être débutant.
2.  **Utiliser le contexte :** Si des documents sont fournis, analysez-les attentivement pour éclairer votre réponse.
3.  **Raisonnement étape par étape :** Expliquez votre raisonnement de manière logique et structurée, en guidant l'utilisateur.
4.  **Clarifier au besoin :** Si la question est ambiguë ou incomplète, posez des questions ciblées pour mieux cerner la demande. N'hésitez pas à proposer votre aide si vous identifiez un besoin plus large derrière la question.
5.  **Fournir des informations utiles :** Donnez des explications simples sur les concepts juridiques, citez les articles de loi pertinents si possible, et proposez des exemples concrets. 
6.  **Être proactif :** Si cela peut aider, suggérez spontanément des démarches possibles, des alternatives ou des points de vigilance. Si la question semble liée à un projet (ex. création d'entreprise), proposez des étapes ou des outils utiles. Demandez à l'utilisateur s'il souhaite être accompagné ou recevoir plus d'informations.
7.  **Proposer son aide de manière naturelle :** Par exemple, dites "Souhaitez-vous que je vous accompagne dans les démarches ?", ou "Voulez-vous que je vous aide à rédiger ce document ?"
8.  **Préciser les limites :** Rappelez systématiquement que vos réponses constituent des informations juridiques générales et ne remplacent PAS un avis juridique personnalisé fourni par un avocat qualifié. Recommandez toujours de consulter un avocat pour des conseils adaptés à la situation spécifique de l'utilisateur.
9.  **Formatage Markdown :** Veuillez formater votre réponse en utilisant Markdown (par exemple, **gras**, *italique*, listes à puces avec -, *, ou +). Utilisez des titres si pertinent (par exemple, ## Titre).
10. **Proposer des questions de suivi :** À la fin de votre réponse, proposez 3 à 5 questions de suivi pertinentes que l'utilisateur pourrait poser pour approfondir le sujet, sous la forme :

QUESTIONS_SUGGÉRÉES:
1. [Question 1]
2. [Question 2]
3. [Question 3]
4. [Question 4 - optionnelle]
5. [Question 5 - optionnelle]

Contexte des documents fournis (le cas échéant) :
${context}

Question de l'utilisateur : ${question}

Réponse de l'assistant juridique (en suivant les instructions ci-dessus, en format Markdown, incluant les suggestions et les questions proposées à la fin) :`; // Added Markdown instruction

      
      const messages = [{ role: 'system', content: prompt }]; // Changed role to system for better instruction following
      const response = await OpenRouterClient.createChatCompletion(messages, {
        temperature: 0.4,
        max_tokens: 2000,
        ...options
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Legal advice generation error:', error);
      throw error;
    }
  },
  
  /**
   * Generate legal request summary
   * @param {String} description - Legal request description
   * @param {Object} options - Additional options
   * @returns {Promise<String>} - Generated summary
   */
  generateLegalRequestSummary: async (description, options = {}) => {
    try {
      const prompt = `Veuillez analyser et résumer la demande juridique suivante en français. Identifiez la nature du problème juridique, les questions clés, et les domaines du droit concernés. Présentez un résumé concis et structuré qui pourrait aider un avocat à comprendre rapidement la situation. Formatez la réponse en Markdown.
Demande: ${description}`; // Added Markdown instruction
      
      const messages = [{ role: 'user', content: prompt }];
      const response = await OpenRouterClient.createChatCompletion(messages, {
        temperature: 0.3,
        max_tokens: 1000,
        ...options
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Legal request summary generation error:', error);
      throw error;
    }
  },
  
  /**
   * Generate document from template
   * @param {String} templateName - Template name
   * @param {Object} variables - Template variables
   * @param {Object} options - Additional options
   * @returns {Promise<String>} - Generated document
   */
  generateDocumentFromTemplate: async (templateName, variables, options = {}) => {
    try {
      // Get template
      const templates = require('./documentTemplates');
      const template = templates[templateName];
      
      if (!template) {
        throw new Error(`Modèle "${templateName}" non trouvé`);
      }
      
      // Replace variables in template
      let document = template;
      
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        document = document.replace(new RegExp(placeholder, 'g'), value);
      }
      
      // Check if there are any remaining placeholders
      const remainingPlaceholders = document.match(/{{[^}]+}}/g);
      
      if (remainingPlaceholders && remainingPlaceholders.length > 0) {
        // Use AI to fill in missing placeholders
        const prompt = `Veuillez compléter le document juridique suivant en remplaçant les variables manquantes par des valeurs appropriées. Utilisez un langage formel et professionnel. Formatez la réponse en Markdown.

Document avec variables manquantes:
${document}

Variables manquantes:
${remainingPlaceholders.join('\n')}`; // Added Markdown instruction
        
        const messages = [{ role: 'user', content: prompt }];
        const response = await OpenRouterClient.createChatCompletion(messages, {
          temperature: 0.3,
          max_tokens: 2000,
          ...options
        });
        
        return response.choices[0].message.content;
      }
      
      return document;
    } catch (error) {
      console.error('Document generation error:', error);
      throw error;
    }
  }
};

module.exports = OpenRouterClient;
