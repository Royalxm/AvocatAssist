const CalendarEventModel = require('../models/CalendarEventModel');
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get calendar events for the logged-in lawyer within a date range
 * @route GET /api/calendar/events
 * @access Private (Lawyer)
 */
exports.getEvents = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const { start, end } = req.query; // Expecting ISO 8601 date strings

    // Basic validation for start/end dates
    if (!start || !end || isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
        throw new AppError('Valid start and end date query parameters are required.', 400);
    }

    CalendarEventModel.getEventsByRange(lawyerId, start, end, (err, events) => {
        if (err) {
            throw new AppError('Failed to fetch calendar events', 500, err);
        }
        // Format events for FullCalendar if needed (e.g., converting allDay 0/1 to boolean)
        const formattedEvents = events.map(event => ({
            ...event,
            allDay: !!event.allDay // Convert 0/1 to false/true
        }));
        res.status(200).json({ success: true, events: formattedEvents });
    });
});

/**
 * Create a new calendar event for the logged-in lawyer
 * @route POST /api/calendar/events
 * @access Private (Lawyer)
 */
exports.createEvent = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const { title, start, end, allDay, description, location } = req.body;

    // Basic validation
    if (!title || !start) {
         throw new AppError('Title and start date/time are required.', 400);
    }
     if (isNaN(Date.parse(start)) || (end && isNaN(Date.parse(end)))) {
        throw new AppError('Invalid date format. Use ISO 8601.', 400);
    }

    const eventData = { lawyerId, title, start, end, allDay, description, location };

    CalendarEventModel.createEvent(eventData, (err, result) => {
        if (err) {
            throw new AppError('Failed to create calendar event', 500, err);
        }
        res.status(201).json({ success: true, message: 'Event created successfully', eventId: result.eventId });
    });
});

/**
 * Update a calendar event for the logged-in lawyer
 * @route PUT /api/calendar/events/:eventId
 * @access Private (Lawyer)
 */
exports.updateEvent = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);
    const { title, start, end, allDay, description, location } = req.body;

     // Basic validation for dates if provided
    if ((start && isNaN(Date.parse(start))) || (end && isNaN(Date.parse(end)))) {
        throw new AppError('Invalid date format. Use ISO 8601.', 400);
    }

    const eventData = { title, start, end, allDay, description, location };

    // Remove undefined fields so the model update works correctly
    Object.keys(eventData).forEach(key => eventData[key] === undefined && delete eventData[key]);

    CalendarEventModel.updateEvent(eventId, lawyerId, eventData, (err, result) => {
        if (err) {
            throw new AppError('Failed to update calendar event', 500, err);
        }
        if (result.changes === 0) {
            // Could be not found or user not authorized
             throw new AppError('Event not found or you are not authorized to update it', 404);
        }
        res.status(200).json({ success: true, message: 'Event updated successfully' });
    });
});

/**
 * Delete a calendar event for the logged-in lawyer
 * @route DELETE /api/calendar/events/:eventId
 * @access Private (Lawyer)
 */
exports.deleteEvent = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);

    CalendarEventModel.deleteEvent(eventId, lawyerId, (err, result) => {
        if (err) {
            throw new AppError('Failed to delete calendar event', 500, err);
        }
         if (result.changes === 0) {
            // Could be not found or user not authorized
             throw new AppError('Event not found or you are not authorized to delete it', 404);
        }
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    });
});