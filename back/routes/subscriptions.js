const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth'); // Assuming authorize checks req.user.role against the array

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
 * @access  Private (Lawyer only) - Renamed
 */
router.post('/subscribe/lawyer', authenticate, authorize(['lawyer']), subscriptionController.subscribeLawyerToPlan); // Renamed controller function

/**
 * @route   GET /api/subscriptions/user
 * @desc    Get user subscription
 * @access  Private (Lawyer only) - Renamed
 */
router.get('/user/lawyer', authenticate, authorize(['lawyer']), subscriptionController.getLawyerSubscription); // Renamed controller function

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

// --- Client Subscription Routes ---

/**
 * @route   POST /api/subscriptions/subscribe/client
 * @desc    Initiate subscription for a client (creates pending record)
 * @access  Private (Client only)
 */
router.post('/subscribe/client', authenticate, authorize(['client']), subscriptionController.subscribeClientToPlan);

/**
 * @route   POST /api/subscriptions/subscribe/client/payment
 * @desc    Handle successful payment confirmation for a client subscription
 * @access  Private (Client only) - Simulates payment callback
 */
router.post('/subscribe/client/payment', authenticate, authorize(['client']), subscriptionController.handleSubscriptionPayment);

/**
 * @route   GET /api/subscriptions/user/client
 * @desc    Get current client's subscription details
 * @access  Private (Client only)
 */
router.get('/user/client', authenticate, authorize(['client']), subscriptionController.getClientSubscription);

/**
 * @route   DELETE /api/subscriptions/subscribe/client
 * @desc    Cancel the current client's active subscription
 * @access  Private (Client only)
 */
router.delete('/subscribe/client', authenticate, authorize(['client']), subscriptionController.cancelClientSubscription);

/**
 * @route   GET /api/subscriptions/user/client/history
 * @desc    Get client's subscription history
 * @access  Private (Client only)
 */
router.get('/user/client/history', authenticate, authorize(['client']), subscriptionController.getClientSubscriptionHistory);


module.exports = router;
