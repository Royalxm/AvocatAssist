const { db } = require('../config/database');

/**
 * Get latest legal news items with pagination
 * @param {Object} options - { page, limit }
 * @param {Function} callback - Callback function (err, { items, pagination })
 */
exports.getLatestNews = (options, callback) => {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const countSql = 'SELECT COUNT(*) as total FROM LegalNewsItems';
    // Fetch latest news first based on publication date, fallback to fetched date
    const dataSql = `SELECT * FROM LegalNewsItems
                     ORDER BY COALESCE(pubDate, fetchedAt) DESC
                     LIMIT ? OFFSET ?`;

    db.get(countSql, [], (err, row) => {
        if (err) {
            return callback(err);
        }
        const total = row.total;
        const totalPages = Math.ceil(total / limit);

        db.all(dataSql, [limit, offset], (err, items) => {
            if (err) {
                return callback(err);
            }
            callback(null, {
                items,
                pagination: { page, limit, total, totalPages }
            });
        });
    });
};

/**
 * Add a new news item (intended for use by a background job/admin)
 * Avoids adding duplicates based on the unique link.
 * @param {Object} itemData - { title, link, source, pubDate, description }
 * @param {Function} callback - Callback function (err, { itemId, skipped })
 */
exports.addNewsItem = (itemData, callback) => {
    const { title, link, source, pubDate, description } = itemData;

    // Use INSERT OR IGNORE to avoid errors if the link (unique constraint) already exists
    const sql = `INSERT OR IGNORE INTO LegalNewsItems
                 (title, link, source, pubDate, description)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [
        title,
        link,
        source || null,
        pubDate || null, // Ensure pubDate is in a format SQLite understands (e.g., ISO 8601)
        description || null
    ], function(err) {
        if (err) {
            return callback(err);
        }
        // Check if a row was actually inserted (this.changes > 0)
        // If changes = 0, it means the link already existed and the row was ignored.
        callback(null, { itemId: this.lastID, inserted: this.changes > 0 });
    });
};

// Potential future functions:
// - deleteOldNewsItems(daysOld)
// - findBySource(source)