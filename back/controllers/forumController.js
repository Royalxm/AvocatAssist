const ForumTopicModel = require('../models/ForumTopicModel');
const ForumPostModel = require('../models/ForumPostModel');
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

// --- Topics ---

/**
 * Create a new forum topic
 * @route POST /api/forum/topics
 * @access Private (Lawyer)
 */
exports.createTopic = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const { title, category } = req.body;
    const lawyerId = req.user.id; // Assuming auth middleware sets req.user

    // Ensure user is a lawyer (redundant if route middleware handles it, but good practice)
    if (req.user.role !== 'lawyer') {
         throw new AppError('Only lawyers can create forum topics.', 403);
    }

    ForumTopicModel.createTopic({ lawyerId, title, category }, (err, result) => {
        if (err) {
            throw new AppError('Failed to create topic', 500, err);
        }
        res.status(201).json({ success: true, message: 'Topic created successfully', topicId: result.topicId });
    });
});

/**
 * Get forum topics with pagination
 * @route GET /api/forum/topics
 * @access Private (Lawyer)
 */
exports.getTopics = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const sortBy = req.query.sortBy; // Optional: 'createdAt', 'title', 'category', 'lastActivityAt'
    const order = req.query.order;   // Optional: 'ASC', 'DESC'

    ForumTopicModel.getTopics({ page, limit, sortBy, order }, (err, result) => {
        if (err) {
            throw new AppError('Failed to fetch topics', 500, err);
        }
        res.status(200).json({ success: true, ...result });
    });
});

/**
 * Get a single forum topic by ID
 * @route GET /api/forum/topics/:topicId
 * @access Private (Lawyer)
 */
exports.getTopicById = asyncHandler(async (req, res) => {
    const { topicId } = req.params;

    ForumTopicModel.getTopicById(topicId, (err, topic) => {
        if (err) {
            throw new AppError('Failed to fetch topic', 500, err);
        }
        if (!topic) {
            throw new AppError('Topic not found', 404);
        }
        res.status(200).json({ success: true, topic });
    });
});

// --- Posts ---

/**
 * Create a new forum post in a topic
 * @route POST /api/forum/topics/:topicId/posts
 * @access Private (Lawyer)
 */
exports.createPost = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const { topicId } = req.params;
    const { content } = req.body;
    const lawyerId = req.user.id;

    // Ensure user is a lawyer
    if (req.user.role !== 'lawyer') {
         throw new AppError('Only lawyers can post in the forum.', 403);
    }

    // Optional: Check if topic exists first
    ForumTopicModel.getTopicById(topicId, (err, topic) => {
        if (err) {
            throw new AppError('Error checking topic existence', 500, err);
        }
        if (!topic) {
            throw new AppError('Topic not found', 404);
        }

        // Topic exists, create the post
        ForumPostModel.createPost({ topicId, lawyerId, content }, (err, result) => {
            if (err) {
                throw new AppError('Failed to create post', 500, err);
            }
            res.status(201).json({ success: true, message: 'Post created successfully', postId: result.postId });
        });
    });
});

/**
 * Get posts for a specific topic with pagination
 * @route GET /api/forum/topics/:topicId/posts
 * @access Private (Lawyer)
 */
exports.getPosts = asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const order = req.query.order; // Optional: 'ASC', 'DESC' (default ASC in model)

    // Optional: Check if topic exists first
     ForumTopicModel.getTopicById(topicId, (err, topic) => {
        if (err) {
            throw new AppError('Error checking topic existence', 500, err);
        }
        if (!topic) {
            throw new AppError('Topic not found', 404);
        }

        // Topic exists, get posts
        ForumPostModel.getPostsByTopicId(topicId, { page, limit, order }, (err, result) => {
            if (err) {
                throw new AppError('Failed to fetch posts', 500, err);
            }
            res.status(200).json({ success: true, ...result });
        });
    });
});

/**
 * Update a forum post
 * @route PUT /api/forum/posts/:postId
 * @access Private (Owner Lawyer only)
 */
exports.updatePost = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const { postId } = req.params;
    const { content } = req.body;
    const lawyerId = req.user.id;

    // Get the post to verify ownership
    ForumPostModel.getPostById(postId, (err, post) => {
        if (err) {
            throw new AppError('Error fetching post for update', 500, err);
        }
        if (!post) {
            throw new AppError('Post not found', 404);
        }
        if (post.lawyerId !== lawyerId) {
            throw new AppError('You are not authorized to update this post', 403);
        }

        // Update the post
        ForumPostModel.updatePost(postId, content, (err, result) => {
            if (err) {
                throw new AppError('Failed to update post', 500, err);
            }
            if (result.changes === 0) {
                 // Should not happen if post was found, but good practice
                 throw new AppError('Post not found or no changes made', 404);
            }
            res.status(200).json({ success: true, message: 'Post updated successfully' });
        });
    });
});

/**
 * Delete a forum post
 * @route DELETE /api/forum/posts/:postId
 * @access Private (Owner Lawyer or Admin)
 */
exports.deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the post to verify ownership or admin role
    ForumPostModel.getPostById(postId, (err, post) => {
        if (err) {
            throw new AppError('Error fetching post for deletion', 500, err);
        }
        if (!post) {
            throw new AppError('Post not found', 404);
        }

        // Check authorization
        const isOwner = post.lawyerId === userId;
        const isAdmin = ['support', 'manager'].includes(userRole);

        if (!isOwner && !isAdmin) {
            throw new AppError('You are not authorized to delete this post', 403);
        }

        // Delete the post
        ForumPostModel.deletePost(postId, (err, result) => {
            if (err) {
                throw new AppError('Failed to delete post', 500, err);
            }
             if (result.changes === 0) {
                 // Should not happen if post was found
                 throw new AppError('Post not found', 404);
            }
            res.status(200).json({ success: true, message: 'Post deleted successfully' });
        });
    });
});