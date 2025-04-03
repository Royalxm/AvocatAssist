const { db } = require('../config/database');

/**
 * Create a new custom template for a lawyer
 * @param {Object} templateData - { lawyerId, name, description, category, content, variables }
 * @param {Function} callback - Callback function (err, { templateId })
 */
exports.createTemplate = (templateData, callback) => {
    const { lawyerId, name, description, category, content, variables } = templateData;
    // Store variables as a JSON string
    const variablesJson = JSON.stringify(variables || []);
    const sql = `INSERT INTO LawyerTemplates
                 (lawyerId, name, description, category, content, variables)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        lawyerId,
        name,
        description || null,
        category || null,
        content,
        variablesJson
    ], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { templateId: this.lastID });
    });
};

/**
 * Get custom templates for a lawyer with pagination and optional search/category filter
 * @param {Number} lawyerId - Lawyer's user ID
 * @param {Object} options - { page, limit, searchTerm, category }
 * @param {Function} callback - Callback function (err, { templates, pagination })
 */
exports.getTemplatesByLawyerId = (lawyerId, options, callback) => {
    const { page = 1, limit = 20, searchTerm, category } = options;
    const offset = (page - 1) * limit;
    let params = [lawyerId];
    let whereClauses = ['lawyerId = ?'];

    if (searchTerm) {
        whereClauses.push(`(name LIKE ? OR description LIKE ? OR category LIKE ?)`);
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    if (category) {
        whereClauses.push(`category = ?`);
        params.push(category);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM LawyerTemplates ${whereSql}`;
    const dataSql = `SELECT id, name, description, category, createdAt, updatedAt FROM LawyerTemplates ${whereSql} ORDER BY name ASC LIMIT ? OFFSET ?`;

    db.get(countSql, params, (err, row) => {
        if (err) {
            return callback(err);
        }
        const total = row.total;
        const totalPages = Math.ceil(total / limit);

        // Add limit and offset for data query
        params.push(limit, offset);

        db.all(dataSql, params, (err, templates) => {
            if (err) {
                return callback(err);
            }
            callback(null, {
                templates, // Return only summary data for list view
                pagination: { page, limit, total, totalPages }
            });
        });
    });
};

/**
 * Get a specific custom template by ID, including content and variables
 * @param {Number} templateId - Template ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, template)
 */
exports.getTemplateById = (templateId, lawyerId, callback) => {
    const sql = `SELECT * FROM LawyerTemplates WHERE id = ? AND lawyerId = ?`;
    db.get(sql, [templateId, lawyerId], (err, template) => {
        if (err) return callback(err);
        if (template && template.variables) {
            try {
                template.variables = JSON.parse(template.variables);
            } catch (e) {
                console.error(`Failed to parse variables for template ${templateId}:`, e);
                template.variables = []; // Default to empty array on parse error
            }
        }
        callback(null, template);
    });
};

/**
 * Update a custom template
 * @param {Number} templateId - Template ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Object} templateData - { name, description, category, content, variables }
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.updateTemplate = (templateId, lawyerId, templateData, callback) => {
    const { name, description, category, content, variables } = templateData;
    let setClauses = [];
    let params = [];

    // Build SET clause dynamically
    if (name !== undefined) { setClauses.push("name = ?"); params.push(name); }
    if (description !== undefined) { setClauses.push("description = ?"); params.push(description); }
    if (category !== undefined) { setClauses.push("category = ?"); params.push(category); }
    if (content !== undefined) { setClauses.push("content = ?"); params.push(content); }
    if (variables !== undefined) { setClauses.push("variables = ?"); params.push(JSON.stringify(variables || [])); }

    if (setClauses.length === 0) {
        return callback(null, { changes: 0 }); // No fields to update
    }

    const sql = `UPDATE LawyerTemplates SET ${setClauses.join(', ')}, updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ? AND lawyerId = ?`;
    params.push(templateId, lawyerId);

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};

/**
 * Delete a custom template
 * @param {Number} templateId - Template ID
 * @param {Number} lawyerId - Lawyer's user ID (for authorization)
 * @param {Function} callback - Callback function (err, { changes })
 */
exports.deleteTemplate = (templateId, lawyerId, callback) => {
    const sql = `DELETE FROM LawyerTemplates WHERE id = ? AND lawyerId = ?`;
    db.run(sql, [templateId, lawyerId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
};

/**
 * Helper function to extract variables (placeholders) from template content.
 * Matches {variableName} or [variableName].
 * @param {String} content - The template content string.
 * @returns {Array<String>} - An array of unique variable names found.
 */
exports.extractVariables = (content) => {
    if (!content) return [];
    const regex = /\{([a-zA-Z0-9_]+)\}|\[([a-zA-Z0-9_]+)\]/g;
    let match;
    const variables = new Set();
    while ((match = regex.exec(content)) !== null) {
        // match[1] is for {} style, match[2] is for [] style
        variables.add(match[1] || match[2]);
    }
    return Array.from(variables);
};