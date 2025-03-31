const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', authenticate, projectController.createProject);

/**
 * @route   GET /api/projects
 * @desc    Get user's projects with pagination
 * @access  Private
 */
router.get('/', authenticate, projectController.getUserProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', authenticate, projectController.getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', authenticate, projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', authenticate, projectController.deleteProject);

/**
 * @route   POST /api/projects/:id/documents
 * @desc    Add document to project
 * @access  Private
 */
router.post('/:id/documents', authenticate, projectController.addDocumentToProject);

/**
 * @route   DELETE /api/projects/:id/documents/:documentId
 * @desc    Remove document from project
 * @access  Private
 */
router.delete('/:id/documents/:documentId', authenticate, projectController.removeDocumentFromProject);

/**
 * @route   GET /api/projects/search
 * @desc    Search projects
 * @access  Private
 */
router.get('/search', authenticate, projectController.searchProjects);

module.exports = router;
