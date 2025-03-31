const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/plans', subscriptionController.getAllPlans);

/**
 * @route   GET /api/subscriptions/plans/:id
 * @desc    Get subscription plan by ID
 * @access  Public
 */
router.get('/plans/:id', subscriptionController.getPlanById);

/**
 * @route   POST /api/subscriptions/plans
 * @desc    Create a new subscription plan
 * @access  Private (Admin only)
 */
router.post('/plans', authenticate, authorize(['support', 'manager']), subscriptionController.createPlan);

/**
 * @route   PUT /api/subscriptions/plans/:id
 * @desc    Update subscription plan
 * @access  Private (Admin only)
 */
router.put('/plans/:id', authenticate, authorize(['support', 'manager']), subscriptionController.updatePlan);

/**
 * @route   DELETE /api/subscriptions/plans/:id
 * @desc    Delete subscription plan
 * @access  Private (Admin only)
 */
router.delete('/plans/:id', authenticate, authorize(['support', 'manager']), subscriptionController.deletePlan);

/**
 * @route   POST /api/subscriptions/subscribe
 * @desc    Subscribe user to a plan
 * @access  Private (Lawyer only)
 */
router.post('/subscribe', authenticate, subscriptionController.subscribeToPlan);

/**
 * @route   GET /api/subscriptions/user
 * @desc    Get user subscription
 * @access  Private (Lawyer only)
 */
router.get('/user', authenticate, subscriptionController.getUserSubscription);

/**
 * @route   PUT /api/subscriptions/token-balance
 * @desc    Update user token balance
 * @access  Private (Admin only)
 */
router.put('/token-balance', authenticate, authorize(['support', 'manager']), subscriptionController.updateTokenBalance);

/**
 * @route   POST /api/subscriptions/reset-tokens
 * @desc    Reset token balances for all users with a specific plan
 * @access  Private (Admin only)
 */
router.post('/reset-tokens', authenticate, authorize(['support', 'manager']), subscriptionController.resetTokenBalances);

module.exports = router;
