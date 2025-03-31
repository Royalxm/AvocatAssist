const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private (Client only)
 */
router.post('/', authenticate, transactionController.createTransaction);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticate, transactionController.getTransactionById);

/**
 * @route   GET /api/transactions/client
 * @desc    Get transactions by client ID with pagination
 * @access  Private (Client only)
 */
router.get('/client', authenticate, transactionController.getClientTransactions);

/**
 * @route   GET /api/transactions/lawyer
 * @desc    Get transactions by lawyer ID with pagination
 * @access  Private (Lawyer only)
 */
router.get('/lawyer', authenticate, transactionController.getLawyerTransactions);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with pagination
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorize(['support', 'manager']), transactionController.getAllTransactions);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, authorize(['support', 'manager']), transactionController.getTransactionStats);

module.exports = router;
