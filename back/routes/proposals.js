const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/proposals
 * @desc    Create a new proposal
 * @access  Private (Lawyer only)
 */
router.post('/', authenticate, proposalController.createProposal);

/**
 * @route   GET /api/proposals/lawyer
 * @desc    Get proposals by lawyer ID with pagination
 * @access  Private (Lawyer only)
 */
router.get('/lawyer', authenticate, proposalController.getLawyerProposals);

/**
 * @route   GET /api/proposals/stats
 * @desc    Get proposal statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, authorize(['support', 'manager']), proposalController.getProposalStats);

/**
 * @route   GET /api/proposals/request/:requestId
 * @desc    Get proposals by request ID
 * @access  Private
 */
router.get('/request/:requestId', authenticate, proposalController.getProposalsByRequestId);

/**
 * @route   GET /api/proposals/request/:requestId/accepted
 * @desc    Get accepted proposal for a request
 * @access  Private
 */
router.get('/request/:requestId/accepted', authenticate, proposalController.getAcceptedProposal);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get proposal by ID
 * @access  Private
 */
router.get('/:id', authenticate, proposalController.getProposalById);

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update proposal
 * @access  Private
 */
router.put('/:id', authenticate, proposalController.updateProposal);

/**
 * @route   DELETE /api/proposals/:id
 * @desc    Delete proposal
 * @access  Private
 */
router.delete('/:id', authenticate, proposalController.deleteProposal);

module.exports = router;
