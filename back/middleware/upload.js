const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Upload directory
const uploadDir = process.env.UPLOAD_PATH || './uploads';

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user directory if it doesn't exist
    const userDir = path.join(uploadDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Les types autorisés sont: PDF, Word, Excel, PowerPoint, TXT, CSV, JPEG, PNG'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Middleware for uploading a single document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const uploadSingleDocument = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Fichier trop volumineux. La taille maximale est de 10MB' });
        }
        return res.status(400).json({ message: `Erreur lors du téléchargement: ${err.message}` });
      }
      
      return res.status(400).json({ message: err.message });
    }
    
    next();
  });
};

/**
 * Middleware for uploading multiple documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const uploadMultipleDocuments = (req, res, next) => {
  upload.array('documents', 5)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Fichier trop volumineux. La taille maximale est de 10MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Trop de fichiers. Le maximum est de 5 fichiers' });
        }
        return res.status(400).json({ message: `Erreur lors du téléchargement: ${err.message}` });
      }
      
      return res.status(400).json({ message: err.message });
    }
    
    next();
  });
};

module.exports = {
  uploadSingleDocument,
  uploadMultipleDocuments
};
