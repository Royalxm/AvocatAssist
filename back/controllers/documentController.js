const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const DocumentModel = require('../models/DocumentModel');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Upload document
 * @route POST /api/documents/upload
 * @access Private
 */
const uploadDocument = asyncHandler(async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé' });
  }
  
  const { file } = req;
  const userId = req.user.id;
  
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
        // Continue without extracted text
      }
    }
    
    // Create document in database
    DocumentModel.createDocument(
      {
        userId,
        filePath: file.path,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        extractedText
      },
      (err, document) => {
        if (err) {
          console.error('Create document error:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du document' });
        }
        
        res.status(201).json({
          message: 'Document téléchargé avec succès',
          document
        });
      }
    );
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du document' });
  }
});

/**
 * Get user documents
 * @route GET /api/documents
 * @access Private
 */
const getUserDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, fileType } = req.query;
  
  // Get user documents
  DocumentModel.getDocumentsByUserId(
    userId,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      fileType
    },
    (err, result) => {
      if (err) {
        console.error('Get user documents error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Get document by ID
 * @route GET /api/documents/:id
 * @access Private
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID
  DocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Get document by ID error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document
    if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.status(200).json({ document });
  });
});

/**
 * Download document
 * @route GET /api/documents/:id/download
 * @access Private
 */
const downloadDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID
  DocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Download document error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document
    if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
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
 * @route DELETE /api/documents/:id
 * @access Private
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;
  
  // Get document by ID to check ownership
  DocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Delete document error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document
    if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Delete document
    DocumentModel.deleteDocument(documentId, (err, result) => {
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

/**
 * Search documents
 * @route GET /api/documents/search
 * @access Private
 */
const searchDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { query, page = 1, limit = 10 } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Le paramètre de recherche est requis' });
  }
  
  // Search documents
  DocumentModel.searchDocuments(
    userId,
    query,
    {
      page: parseInt(page),
      limit: parseInt(limit)
    },
    (err, result) => {
      if (err) {
        console.error('Search documents error:', err);
        return res.status(500).json({ message: 'Erreur lors de la recherche de documents' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Get all documents (admin only)
 * @route GET /api/documents/all
 * @access Private (Admin only)
 */
const getAllDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, userId, fileType } = req.query;
  
  // Get all documents
  DocumentModel.getAllDocuments(
    {
      page: parseInt(page),
      limit: parseInt(limit),
      userId: userId ? parseInt(userId) : undefined,
      fileType
    },
    (err, result) => {
      if (err) {
        console.error('Get all documents error:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
      }
      
      res.status(200).json(result);
    }
  );
});

/**
 * Update document extracted text
 * @route PUT /api/documents/:id/extract-text
 * @access Private
 */
const updateExtractedText = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const documentId = req.params.id;
  const userId = req.user.id;
  const { extractedText } = req.body;
  
  // Get document by ID to check ownership
  DocumentModel.getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Update extracted text error:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Check if user is the owner of the document
    if (document.userId !== userId && !['support', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Update document
    DocumentModel.updateDocument(
      documentId,
      { extractedText },
      (err, updatedDocument) => {
        if (err) {
          console.error('Update extracted text error:', err);
          return res.status(500).json({ message: 'Erreur lors de la mise à jour du document' });
        }
        
        res.status(200).json({
          message: 'Texte extrait mis à jour avec succès',
          document: updatedDocument
        });
      }
    );
  });
});

module.exports = {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  searchDocuments,
  getAllDocuments,
  updateExtractedText
};
