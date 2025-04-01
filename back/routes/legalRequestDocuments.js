const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { uploadSingleDocument } = require('../middleware/upload');
const legalRequestDocumentController = require('../controllers/legalRequestDocumentController');

/**
 * @route POST /api/legal-request-documents/upload
 * @desc Upload document for a legal request
 * @access Private
 */
router.post(
  '/upload',
  auth,
  uploadSingleDocument,
  legalRequestDocumentController.uploadDocument
);

/**
 * @route GET /api/legal-request-documents/:legalRequestId
 * @desc Get documents for a legal request
 * @access Private
 */
router.get(
  '/:legalRequestId',
  auth,
  legalRequestDocumentController.getDocumentsByLegalRequestId
);

/**
 * @route GET /api/legal-request-documents/document/:id
 * @desc Get document by ID
 * @access Private
 */
router.get(
  '/document/:id',
  auth,
  legalRequestDocumentController.getDocumentById
);

/**
 * @route GET /api/legal-request-documents/document/:id/download
 * @desc Download document
 * @access Private
 */
router.get(
  '/document/:id/download',
  auth,
  legalRequestDocumentController.downloadDocument
);

/**
 * @route DELETE /api/legal-request-documents/document/:id
 * @desc Delete document
 * @access Private
 */
router.delete(
  '/document/:id',
  auth,
  legalRequestDocumentController.deleteDocument
);

module.exports = router;
