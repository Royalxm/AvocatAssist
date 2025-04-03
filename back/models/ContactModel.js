const { db } = require('../config/database');

/**
 * Create a new contact for a lawyer
 * @param {Object} contactData - { lawyerId, name, email, phone, company, notes, isClient, clientId }
 * @param {Function} callback - Callback function (err, { contactId })
 */
exports.createContact = (contactData, callback) => {
    const { lawyerId, name, email, phone, company, notes, isClient, clientId } = contactData;
    const sql = `INSERT INTO Contacts
                 (lawyerId, name, email, phone, company, notes, isClient, clientId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        lawyerId,
        name,
        email || null,
        phone || null,
        company || null,
        notes || null,
        isClient ? 1 : 0,
        clientId || null // Ensure clientId is null if not provided or isClient is false
    ], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { contactId: this.lastID });
    });
};

/**
 * Get contacts for a lawyer with pagination and optional search
 * @param {Number} lawyerId - Lawyer's user ID
 * @param {Object} options - { page, limit, searchTerm }
 * @param {Function} callback - Callback function (err, { contacts, pagination })
 */
exports.getContactsByLawyerId = (lawyerId, options, callback) => {
    const { page = 1, limit = 20, searchTerm } = options;
    const offset = (page - 1) * limit;
    let params = [lawyerId];
    let whereClause = 'WHERE lawyerId = ?';

    if (searchTerm) {
        whereClause += ` AND (
            name LIKE ? OR
            email LIKE ? OR
            phone LIKE ? OR
            company LIKE ? OR
            notes LIKE ?
        )`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const countSql = `SELECT COUNT(*) as total FROM Contacts ${whereClause}`;
    const dataSql = `SELECT * FROM Contacts ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`;

    db.get(countSql, params, (err, row) => {
        if (err) {
            return callback(err);
        }
        const total = row.total;
        const totalPages = Math.ceil(total / limit);

        // Add limit and offset for data query
        params.push(limit, offset);

        db.all(dataSql, params, (err, contacts) => {
            if (err) {
                return callback(err);
            }
            callback(null, {
                contacts,
                pagination: { page, limit, total, totalPages }
            });
        });
    });
};

/**
 * Get a specific contact by ID
 * @param {Number} contactId - Contact ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, contact)
 */
exports.getContactById = (contactId, lawyerId, callback) => {
    const sql = `SELECT * FROM Contacts WHERE id = ? AND lawyerId = ?`;
    db.get(sql, [contactId, lawyerId], callback);
};

/**
 * Update a contact
 * @param {Number} contactId - Contact ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Object} contactData - { name, email, phone, company, notes, isClient, clientId }
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.updateContact = (contactId, lawyerId, contactData, callback) => {
    const { name, email, phone, company, notes, isClient, clientId } = contactData;
    let setClauses = [];
    let params = [];

    // Build SET clause dynamically
    if (name !== undefined) { setClauses.push("name = ?"); params.push(name); }
    if (email !== undefined) { setClauses.push("email = ?"); params.push(email); }
    if (phone !== undefined) { setClauses.push("phone = ?"); params.push(phone); }
    if (company !== undefined) { setClauses.push("company = ?"); params.push(company); }
    if (notes !== undefined) { setClauses.push("notes = ?"); params.push(notes); }
    if (isClient !== undefined) { setClauses.push("isClient = ?"); params.push(isClient ? 1 : 0); }
    // Only update clientId if isClient is true, otherwise set to null
    if (isClient !== undefined) {
         setClauses.push("clientId = ?");
         params.push(isClient ? (clientId || null) : null);
    } else if (clientId !== undefined) {
        // If isClient is not being updated, but clientId is, update it only if the contact is already marked as client
        // This logic might need refinement based on exact requirements
         setClauses.push("clientId = CASE WHEN isClient = 1 THEN ? ELSE NULL END");
         params.push(clientId || null);
    }


    if (setClauses.length === 0) {
        return callback(null, { changes: 0 }); // No fields to update
    }

    const sql = `UPDATE Contacts SET ${setClauses.join(', ')}, updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ? AND lawyerId = ?`;
    params.push(contactId, lawyerId);

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};

/**
 * Delete a contact
 * @param {Number} contactId - Contact ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.deleteContact = (contactId, lawyerId, callback) => {
    const sql = `DELETE FROM Contacts WHERE id = ? AND lawyerId = ?`;
    db.run(sql, [contactId, lawyerId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};