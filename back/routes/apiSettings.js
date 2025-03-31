const express = require('express');
const router = express.Router();
const apiSettingsController = require('../controllers/apiSettingsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/api-settings
 * @desc    Get all API settings
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorize(['support', 'manager']), apiSettingsController.getAllApiSettings);

/**
 * @route   GET /api/api-settings/:id
 * @desc    Get API setting by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticate, authorize(['support', 'manager']), apiSettingsController.getApiSettingById);

/**
 * @route   GET /api/api-settings/provider/:provider
 * @desc    Get API setting by provider
 * @access  Private (Admin only)
 */
router.get('/provider/:provider', authenticate, authorize(['support', 'manager']), apiSettingsController.getApiSettingByProvider);

/**
 * @route   POST /api/api-settings
 * @desc    Create a new API setting
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize(['support', 'manager']), apiSettingsController.createApiSetting);

/**
 * @route   PUT /api/api-settings/:id
 * @desc    Update API setting
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorize(['support', 'manager']), apiSettingsController.updateApiSetting);

/**
 * @route   DELETE /api/api-settings/:id
 * @desc    Delete API setting
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize(['support', 'manager']), apiSettingsController.deleteApiSetting);

/**
 * @route   GET /api/api-settings/default
 * @desc    Get default API setting
 * @access  Private (Admin only)
 */
router.get('/default', authenticate, authorize(['support', 'manager']), apiSettingsController.getDefaultApiSetting);

/**
 * @route   PUT /api/api-settings/:id/default
 * @desc    Set default API setting
 * @access  Private (Admin only)
 */
router.put('/:id/default', authenticate, authorize(['support', 'manager']), apiSettingsController.setDefaultApiSetting);

module.exports = router;
