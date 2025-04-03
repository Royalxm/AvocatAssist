const express = require('express');
const { body, param, query } = require('express-validator');
const forumController = require('../controllers/forumController');
const { authenticate, isLawyer, authorize } = require('../middleware/auth'); // Use isLawyer middleware

const router = express.Router();

// --- Forum Topic Routes ---

/**
 * @route   POST /api/forum/topics
 * @desc    Create a new forum topic
 * @access  Private (Lawyer only)
 */
router.post(
    '/topics',
    authenticate,
    isLawyer, // Only lawyers can create topics
    [
        body('title').notEmpty().withMessage('Title is required').trim().isLength({ min: 5, max: 150 }),
        body('category').optional().trim().isLength({ max: 50 })
    ],
    forumController.createTopic
);

/**
 * @route   GET /api/forum/topics
 * @desc    Get forum topics with pagination
 * @access  Private (Lawyer only)
 */
router.get(
    '/topics',
    authenticate,
    isLawyer, // Only lawyers can view the forum
    [ // Optional query param validation
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
        query('sortBy').optional().isIn(['createdAt', 'lastActivityAt', 'title', 'category']),
        query('order').optional().isIn(['ASC', 'DESC'])
    ],
    forumController.getTopics
);

/**
 * @route   GET /api/forum/topics/:topicId
 * @desc    Get a single forum topic by ID
 * @access  Private (Lawyer only)
 */
router.get(
    '/topics/:topicId',
    authenticate,
    isLawyer, // Only lawyers can view topics
    [
        param('topicId').isInt({ min: 1 }).withMessage('Invalid Topic ID')
    ],
    forumController.getTopicById
);

// --- Forum Post Routes ---

/**
 * @route   POST /api/forum/topics/:topicId/posts
 * @desc    Create a new post in a topic
 * @access  Private (Lawyer only)
 */
router.post(
    '/topics/:topicId/posts',
    authenticate,
    isLawyer, // Only lawyers can post
    [
        param('topicId').isInt({ min: 1 }).withMessage('Invalid Topic ID'),
        body('content').notEmpty().withMessage('Post content cannot be empty').trim().isLength({ min: 1 })
    ],
    forumController.createPost
);

/**
 * @route   GET /api/forum/topics/:topicId/posts
 * @desc    Get posts for a specific topic
 * @access  Private (Lawyer only)
 */
router.get(
    '/topics/:topicId/posts',
    authenticate,
    isLawyer, // Only lawyers can view posts
    [
        param('topicId').isInt({ min: 1 }).withMessage('Invalid Topic ID'),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('order').optional().isIn(['ASC', 'DESC'])
    ],
    forumController.getPosts
);

/**
 * @route   PUT /api/forum/posts/:postId
 * @desc    Update a forum post
 * @access  Private (Owner Lawyer only)
 */
router.put(
    '/posts/:postId',
    authenticate,
    isLawyer, // User must be a lawyer
    [
        param('postId').isInt({ min: 1 }).withMessage('Invalid Post ID'),
        body('content').notEmpty().withMessage('Post content cannot be empty').trim().isLength({ min: 1 })
    ],
    forumController.updatePost // Controller handles ownership check
);

/**
 * @route   DELETE /api/forum/posts/:postId
 * @desc    Delete a forum post
 * @access  Private (Owner Lawyer or Admin)
 */
router.delete(
    '/posts/:postId',
    authenticate,
    authorize(['lawyer', 'support', 'manager']), // Allow owner lawyer or admins
    [
        param('postId').isInt({ min: 1 }).withMessage('Invalid Post ID')
    ],
    forumController.deletePost // Controller handles ownership/admin check
);


module.exports = router;