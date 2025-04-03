const express = require('express');
const { body, param, query } = require('express-validator');
const calendarController = require('../controllers/calendarController');
const { authenticate, isLawyer } = require('../middleware/auth'); // Use isLawyer middleware

const router = express.Router();

// Apply authentication and lawyer check to all calendar routes
router.use(authenticate);
router.use(isLawyer); // Ensure only lawyers can access calendar features

/**
 * @route   GET /api/calendar/events
 * @desc    Get calendar events for the logged-in lawyer within a date range
 * @access  Private (Lawyer only)
 */
router.get(
    '/events',
    [
        query('start').isISO8601().withMessage('Start date must be a valid ISO 8601 date string'),
        query('end').isISO8601().withMessage('End date must be a valid ISO 8601 date string')
    ],
    calendarController.getEvents
);

/**
 * @route   POST /api/calendar/events
 * @desc    Create a new calendar event for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.post(
    '/events',
    [
        body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 255 }),
        body('start').isISO8601().withMessage('Start date must be a valid ISO 8601 date string'),
        body('end').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid ISO 8601 date string'),
        body('allDay').optional().isBoolean().toBoolean(),
        body('description').optional({ nullable: true }).trim(),
        body('location').optional({ nullable: true }).trim().isLength({ max: 255 })
    ],
    calendarController.createEvent
);

/**
 * @route   PUT /api/calendar/events/:eventId
 * @desc    Update a calendar event for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.put(
    '/events/:eventId',
    [
        param('eventId').isInt({ min: 1 }).withMessage('Invalid Event ID'),
        body('title').optional().trim().isLength({ max: 255 }),
        body('start').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date string'),
        body('end').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid ISO 8601 date string'),
        body('allDay').optional().isBoolean().toBoolean(),
        body('description').optional({ nullable: true }).trim(),
        body('location').optional({ nullable: true }).trim().isLength({ max: 255 })
    ],
    calendarController.updateEvent
);

/**
 * @route   DELETE /api/calendar/events/:eventId
 * @desc    Delete a calendar event for the logged-in lawyer
 * @access  Private (Lawyer only)
 */
router.delete(
    '/events/:eventId',
    [
        param('eventId').isInt({ min: 1 }).withMessage('Invalid Event ID')
    ],
    calendarController.deleteEvent
);

module.exports = router;