const { db } = require('../config/database');

/**
 * Create a new calendar event for a lawyer
 * @param {Object} eventData - { lawyerId, title, start, end, allDay, description, location }
 * @param {Function} callback - Callback function (err, { eventId })
 */
exports.createEvent = (eventData, callback) => {
    const { lawyerId, title, start, end, allDay, description, location } = eventData;
    const sql = `INSERT INTO CalendarEvents
                 (lawyerId, title, start, end, allDay, description, location)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        lawyerId,
        title,
        start, // Expecting ISO 8601 format string
        end || null, // Optional
        allDay ? 1 : 0, // Convert boolean to integer
        description || null,
        location || null
    ], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { eventId: this.lastID });
    });
};

/**
 * Get calendar events for a lawyer within a specific date range
 * @param {Number} lawyerId - Lawyer's user ID
 * @param {String} rangeStart - Start date/time (ISO 8601 format)
 * @param {String} rangeEnd - End date/time (ISO 8601 format)
 * @param {Function} callback - Callback function (err, events)
 */
exports.getEventsByRange = (lawyerId, rangeStart, rangeEnd, callback) => {
    // Query events that overlap with the given range
    // An event overlaps if:
    // - It starts within the range OR
    // - It ends within the range OR
    // - It starts before the range and ends after the range
    const sql = `SELECT * FROM CalendarEvents
                 WHERE lawyerId = ?
                 AND (
                     (start >= ? AND start < ?) OR -- Starts within range
                     (end > ? AND end <= ?) OR     -- Ends within range (exclusive start, inclusive end)
                     (start < ? AND (end IS NULL OR end > ?)) -- Spans the entire range
                 )
                 ORDER BY start ASC`;
    db.all(sql, [lawyerId, rangeStart, rangeEnd, rangeStart, rangeEnd, rangeStart, rangeEnd], callback);
};

/**
 * Get a specific calendar event by ID
 * @param {Number} eventId - Event ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, event)
 */
exports.getEventById = (eventId, lawyerId, callback) => {
    const sql = `SELECT * FROM CalendarEvents WHERE id = ? AND lawyerId = ?`;
    db.get(sql, [eventId, lawyerId], callback);
};

/**
 * Update a calendar event
 * @param {Number} eventId - Event ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Object} eventData - { title, start, end, allDay, description, location }
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.updateEvent = (eventId, lawyerId, eventData, callback) => {
    const { title, start, end, allDay, description, location } = eventData;
    // Construct SET clause dynamically based on provided fields
    let setClauses = [];
    let params = [];

    if (title !== undefined) { setClauses.push("title = ?"); params.push(title); }
    if (start !== undefined) { setClauses.push("start = ?"); params.push(start); }
    if (end !== undefined) { setClauses.push("end = ?"); params.push(end); } // Allow setting end to null
    if (allDay !== undefined) { setClauses.push("allDay = ?"); params.push(allDay ? 1 : 0); }
    if (description !== undefined) { setClauses.push("description = ?"); params.push(description); }
    if (location !== undefined) { setClauses.push("location = ?"); params.push(location); }

    if (setClauses.length === 0) {
        return callback(null, { changes: 0 }); // No fields to update
    }

    const sql = `UPDATE CalendarEvents SET ${setClauses.join(', ')}, updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ? AND lawyerId = ?`;
    params.push(eventId, lawyerId);

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};

/**
 * Delete a calendar event
 * @param {Number} eventId - Event ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.deleteEvent = (eventId, lawyerId, callback) => {
    const sql = `DELETE FROM CalendarEvents WHERE id = ? AND lawyerId = ?`;
    db.run(sql, [eventId, lawyerId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};