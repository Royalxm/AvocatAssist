const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const LegalRequestDocumentModel = require('../models/LegalRequestDocumentModel');
const LegalRequestModel = require('../models/LegalRequestModel');
const OpenRouterClient = require('../utils/openRouter');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Upload document for a legal request
 * @route POST /api/legal-request-documents/upload
 * @access Private
 */
const uploadDocument = asyncHandler(async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé' });
  }
  
  const { file } = req;
  const userId = req.user.id;
  const { legalRequestId } = req.body;

  // Validate legalRequestId
  if (!legalRequestId) {
    // Clean up uploaded file if legalRequestId is missing
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path); 
    }
    return res.status(400).json({ message: 'L\'ID de la demande juridique est requis pour télécharger un document' });
  }

  // Verify that the legal request exists and belongs to the user
  LegalRequestModel.getLegalRequestById(legalRequestId, (err, legalRequest) => {
    if (err) {
      // Clean up uploaded file
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(500).json({ message: 'Erreur lors de la vérification de la demande juridique' });
    }

    if (!legalRequest) {
      // Clean up uploaded file
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ message: 'Demande juridique non trouvée' });
    }

    // Check if user is the owner of the legal request or has appropriate role
    if (legalRequest.clientId !== userId && !['support', 'manager', 'lawyer'].includes(req.user.role)) {
      // Clean up uploaded file
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(403).json({ message: 'Accès non autorisé à cette demande juridique' });
    }

    // Process the file
    processAndSaveDocument(file, userId, legalRequestId, res);
  });
});

/**
 * Process and save document
 * @param {Object} file - Uploaded file
 * @param {Number} userId - User ID
 * @param {Number} legalRequestId - Legal Request ID
 * @param {Object} res - Response object
 */
const processAndSaveDocument = async (file, userId, legalRequestId, res) => {
  try {
    // Extract text from document if it's a PDF
    let extractedText = null;
    
    if (file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error('PDF parsing error:', err);
        // Log detailed error information for debugging
        if (err.details) {
          console.error('PDF parsing error details:', err.details);
        }
        if (err.message) {
          console.error('PDF parsing error message:', err.message);
        }
        
        // Continue without extracted text
        extractedText = "Le contenu du PDF n'a pas pu être extrait en raison d'un problème de format.";
      }
    }
    
    // Generate summary if text was extracted
    let summary = null;
    if (extractedText) {
      try {
        summary = await OpenRouterClient.generateDocumentSummary(extractedText);
      } catch (summaryErr) {
        console.error('Error generating document summary:', summaryErr);
        // Add a default summary message instead of leaving it null
        summary = "Impossible de générer un résumé automatique pour ce document. Le texte a été extrait mais le service d'IA n'a pas pu le traiter.";
      }
    } else {
      // Add a note when no text could be extracted
      summary = "Aucun résumé disponible. Le texte n'a pas pu être extrait de ce document.";
    }
    
    // Create document in database
    LegalRequestDocumentModel.createDocument(
      {
        userId,
        legalRequestId,
        filePath: file.path,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        extractedText,
        summary
      },
      (err, document) => {
        if (err) {
          console.error('Create document error:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du document' });
        }
        
        // Check if there were PDF parsing issues
        let message = 'Document téléchargé avec succès';
        if (file.mimetype === 'application/pdf' && (!extractedText || extractedText.includes("n'a pas pu être extrait"))) {
          message = 'Document téléchargé avec succès, mais le texte PDF n\'a pas pu être extrait correctement';
        }
        
        res.status(201).json({
          success: true,
          message: message,
          document
        });
      }
    );
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du document' });
  }
};

/**
 * Get documents for a legal request
 * @route GET /api/legal-request-documents/:legalRequestId
 * @access Private
 */
const getDocumentsByLegalRequestId = asyncHandler(async (req, res) => {
  const legalRequestId = req.params.legalRequestId || req.params.id;
  const userId = req.user.id;
  
  // Verify that the legal request exists and belongs to the user
  LegalRequestModel.getLegalRequestById(legalRequestId, (err, legalRequest) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la vérification de la demande juridique' });
    }

    if (!legalRequest) {
      return res.status(404).json({ message: 'Demande juridique non trouvée' });
    }

    // Check if user is the owner of the legal request or has appropriate role
    if (legalRequest.clientId !== userId && !['support', 'manager', 'lawyer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette demande juridique' });
    }

    // Get documents for the legal request
    LegalRequestDocumentModel.getDocumentsByLegalRequestId(legalRequestId, (err, documents) => {
      if (err) {
        console.error('Get documents error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
      }
      
      res.status(200).json({ documents });
    });
  });
});

/**
 * Get document by ID
 * @route GET /api/legal-request-documents/document/:id
 * @access Private
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID
  LegalRequestDocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Get document by ID error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document or has appropriate role
    if (document.userId !== userId && !['support', 'manager', 'lawyer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.status(200).json({ document });
  });
});

/**
 * Download document
 * @route GET /api/legal-request-documents/document/:id/download
 * @access Private
 */
const downloadDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID
  LegalRequestDocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Download document error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document or has appropriate role
    if (document.userId !== userId && !['support', 'manager', 'lawyer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Check if file exists
    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    // Send file
    res.download(document.filePath, document.fileName);
  });
});

/**
 * Delete document
 * @route DELETE /api/legal-request-documents/document/:id
 * @access Private
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID to check ownership
  LegalRequestDocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Delete document error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document or has appropriate role
    if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Delete document
    LegalRequestDocumentModel.deleteDocument(documentId, (err, result) => {
      if (err) {
        console.error('Delete document error:', err);
        return res.status(500).json({ message: 'Erreur lors de la suppression du document' });
      }
      
      res.status(200).json({
        message: 'Document supprimé avec succès'
      });
    });
  });
});

module.exports = {
  uploadDocument,
  getDocumentsByLegalRequestId,
  getDocumentById,
  downloadDocument,
  deleteDocument
};
