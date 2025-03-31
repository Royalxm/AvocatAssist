const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, isAdmin, isManager } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin only)
 */
router.get(
  '/',
  auth,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100'),
    query('role').optional().isIn(['client', 'lawyer', 'support', 'manager']).withMessage('Rôle invalide')
  ],
  userController.getAllUsers
);

/**
 * @route GET /api/users/lawyers
 * @desc Get all lawyers
 * @access Public
 */
router.get(
  '/lawyers',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100')
  ],
  userController.getLawyers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get(
  '/:id',
  auth,
  [
    param('id').isInt().withMessage('ID utilisateur invalide')
  ],
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private
 */
router.put(
  '/:id',
  auth,
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
    body('specialties').optional().isString().withMessage('Les spécialités doivent être une chaîne de caractères'),
    body('experience').optional().isString().withMessage('L\'expérience doit être une chaîne de caractères'),
    body('baseRate').optional().isInt({ min: 0 }).withMessage('Le tarif de base doit être un nombre entier positif')
  ],
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin only)
 */
router.delete(
  '/:id',
  auth,
  isManager,
  [
    param('id').isInt().withMessage('ID utilisateur invalide')
  ],
  userController.deleteUser
);

/**
 * @route PUT /api/users/:id/credit
 * @desc Update user credit balance
 * @access Private (Admin only)
 */
router.put(
  '/:id/credit',
  auth,
  isAdmin,
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('amount').isInt({ min: 1 }).withMessage('Le montant doit être un nombre entier positif'),
    body('transactionType').isIn(['credit', 'debit']).withMessage('Type de transaction invalide'),
    body('description').isString().withMessage('La description doit être une chaîne de caractères')
  ],
  userController.updateCreditBalance
);

/**
 * @route GET /api/users/:id/transactions
 * @desc Get user credit transactions
 * @access Private
 */
router.get(
  '/:id/transactions',
  auth,
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100')
  ],
  userController.getCreditTransactions
);

module.exports = router;
