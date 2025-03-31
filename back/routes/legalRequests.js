const express = require('express');
const router = express.Router();
const legalRequestController = require('../controllers/legalRequestController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/legal-requests
 * @desc    Create a new legal request
 * @access  Private (Client only)
 */
router.post('/', authenticate, legalRequestController.createLegalRequest);

/**
 * @route   GET /api/legal-requests/client
 * @desc    Get legal requests by client ID with pagination
 * @access  Private (Client only)
 */
router.get('/client', authenticate, legalRequestController.getClientLegalRequests);

/**
 * @route   GET /api/legal-requests/open
 * @desc    Get open legal requests with pagination
 * @access  Private (Lawyer, Support, Manager only)
 */
router.get('/open', authenticate, legalRequestController.getOpenLegalRequests);

/**
 * @route   GET /api/legal-requests/search
 * @desc    Search legal requests
 * @access  Private (Admin only)
 */
router.get('/search', authenticate, authorize(['support', 'manager']), legalRequestController.searchLegalRequests);

/**
 * @route   GET /api/legal-requests/:id
 * @desc    Get legal request by ID
 * @access  Private
 */
router.get('/:id', authenticate, legalRequestController.getLegalRequestById);

/**
 * @route   PUT /api/legal-requests/:id
 * @desc    Update legal request
 * @access  Private
 */
router.put('/:id', authenticate, legalRequestController.updateLegalRequest);

/**
 * @route   DELETE /api/legal-requests/:id
 * @desc    Delete legal request
 * @access  Private
 */
router.delete('/:id', authenticate, legalRequestController.deleteLegalRequest);


module.exports = router;
