const db = require('../config/database').db; // Get the db connection instance

const LawyerProject = {
  // Create a new lawyer project
  // Create a new lawyer project, potentially linking a client
  create: ({ lawyerId, title, description, type, status = 'Ouvert', projectClientId = null }, callback) => {
    const sql = `INSERT INTO projects_lawyer
                 (lawyerId, title, description, type, status, projectClientId, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
    const params = [
        lawyerId,
        title,
        description,
        type,
        status,
        projectClientId // This will be NULL if it's a personal project
    ];
    db.run(sql, params, function (err) {
      if (err) {
        return callback(err);
      }
      // Return the ID and the data used for creation
      callback(null, { id: this.lastID, lawyerId, title, description, type, status, projectClientId });
    });
  },

  // Find all projects for a specific lawyer
  // Find all projects for a specific lawyer, optionally joining client info
  findAllByLawyerId: (lawyerId, callback) => {
    // Join with project_clients to get client name if available
    const sql = `
      SELECT
        p.*,
        c.firstName AS clientFirstName,
        c.lastName AS clientLastName
      FROM projects_lawyer p
      LEFT JOIN project_clients c ON p.projectClientId = c.id AND p.lawyerId = c.lawyerId
      WHERE p.lawyerId = ?
      ORDER BY p.createdAt DESC`;
    db.all(sql, [lawyerId], callback);
  },

  // Find a single project by ID and ensure it belongs to the lawyer
  // Find a single project by ID, optionally joining client info
  findByIdAndLawyerId: (id, lawyerId, callback) => {
    const sql = `
      SELECT
        p.*,
        c.firstName AS clientFirstName,
        c.lastName AS clientLastName,
        c.email AS clientEmail,
        c.phone AS clientPhone,
        c.address AS clientAddress,
        c.companyName AS clientCompanyName,
        c.notes AS clientNotes
      FROM projects_lawyer p
      LEFT JOIN project_clients c ON p.projectClientId = c.id AND p.lawyerId = c.lawyerId
      WHERE p.id = ? AND p.lawyerId = ?`;
    db.get(sql, [id, lawyerId], callback);
  },

  // Update a project
  // Update a project, including potentially changing the linked client
  update: (id, lawyerId, { title, description, type, status, projectClientId }, callback) => {
    // Construct SET clause dynamically based on provided fields
    const fieldsToUpdate = [];
    const values = [];

    if (title !== undefined) { fieldsToUpdate.push('title = ?'); values.push(title); }
    if (description !== undefined) { fieldsToUpdate.push('description = ?'); values.push(description); }
    if (type !== undefined) { fieldsToUpdate.push('type = ?'); values.push(type); }
    if (status !== undefined) { fieldsToUpdate.push('status = ?'); values.push(status); }
    // Allow setting projectClientId to a specific ID or NULL
    if (projectClientId !== undefined) {
        fieldsToUpdate.push('projectClientId = ?');
        values.push(projectClientId); // Can be null to unlink client
    }

    if (fieldsToUpdate.length === 0) {
      // Nothing to update, maybe return the existing record or an indication
      return LawyerProject.findByIdAndLawyerId(id, lawyerId, callback);
    }

    fieldsToUpdate.push("updatedAt = datetime('now')"); // Always update timestamp

    const sql = `UPDATE projects_lawyer SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND lawyerId = ?`;
    values.push(id, lawyerId);

    db.run(sql, values, function (err) {
      if (err) {
        return callback(err);
      }
      // Check if any row was actually updated
      if (this.changes === 0) {
        return callback(new Error('Project not found or not authorized for update'));
      }
      // Fetch and return the updated record
      LawyerProject.findByIdAndLawyerId(id, lawyerId, callback);
    });
  },

  // Delete a project by ID and ensure it belongs to the lawyer
  deleteByIdAndLawyerId: (id, lawyerId, callback) => {
    const sql = `DELETE FROM projects_lawyer WHERE id = ? AND lawyerId = ?`;
    db.run(sql, [id, lawyerId], function (err) {
       if (err) {
        return callback(err);
      }
       // Check if any row was actually deleted
      if (this.changes === 0) {
        return callback(new Error('Project not found or not authorized for deletion'));
      }
      callback(null, { message: 'Project deleted successfully' });
    });
  }
};

module.exports = LawyerProject;