const db = require('../config/database').db; // Get the db connection instance

const ProjectClient = {
  // Create a new project client record
  create: ({ lawyerId, firstName, lastName, email, phone, address, companyName, notes }, callback) => {
    const sql = `INSERT INTO project_clients 
                 (lawyerId, firstName, lastName, email, phone, address, companyName, notes, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
    const params = [lawyerId, firstName, lastName, email, phone, address, companyName, notes];
    
    db.run(sql, params, function (err) {
      if (err) {
        return callback(err);
      }
      // Return the ID of the newly inserted client
      callback(null, { id: this.lastID, lawyerId, firstName, lastName, email, phone, address, companyName, notes });
    });
  },

  // Find a client by ID (ensure it belongs to the lawyer for security if needed elsewhere)
  findByIdAndLawyerId: (id, lawyerId, callback) => {
    const sql = `SELECT * FROM project_clients WHERE id = ? AND lawyerId = ?`;
    db.get(sql, [id, lawyerId], callback);
  },
  
  // Find all clients for a specific lawyer (useful for dropdowns later)
  findAllByLawyerId: (lawyerId, callback) => {
    const sql = `SELECT * FROM project_clients WHERE lawyerId = ? ORDER BY lastName, firstName`;
    db.all(sql, [lawyerId], callback);
  },

  // Update a client record
  update: (id, lawyerId, { firstName, lastName, email, phone, address, companyName, notes }, callback) => {
    const fieldsToUpdate = [];
    const values = [];

    if (firstName !== undefined) { fieldsToUpdate.push('firstName = ?'); values.push(firstName); }
    if (lastName !== undefined) { fieldsToUpdate.push('lastName = ?'); values.push(lastName); }
    if (email !== undefined) { fieldsToUpdate.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fieldsToUpdate.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fieldsToUpdate.push('address = ?'); values.push(address); }
    if (companyName !== undefined) { fieldsToUpdate.push('companyName = ?'); values.push(companyName); }
    if (notes !== undefined) { fieldsToUpdate.push('notes = ?'); values.push(notes); }

    if (fieldsToUpdate.length === 0) {
      return ProjectClient.findByIdAndLawyerId(id, lawyerId, callback); // Nothing to update
    }

    fieldsToUpdate.push("updatedAt = datetime('now')"); 

    const sql = `UPDATE project_clients SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND lawyerId = ?`;
    values.push(id, lawyerId);

    db.run(sql, values, function (err) {
      if (err) { return callback(err); }
      if (this.changes === 0) { return callback(new Error('Client not found or not authorized for update')); }
      ProjectClient.findByIdAndLawyerId(id, lawyerId, callback); // Return updated record
    });
  },

  // Delete a client record (use with caution, might orphan projects if FK is SET NULL)
  deleteByIdAndLawyerId: (id, lawyerId, callback) => {
    // Consider implications: deleting a client might set projectClientId to NULL in projects_lawyer
    const sql = `DELETE FROM project_clients WHERE id = ? AND lawyerId = ?`;
    db.run(sql, [id, lawyerId], function (err) {
       if (err) { return callback(err); }
       if (this.changes === 0) { return callback(new Error('Client not found or not authorized for deletion')); }
       callback(null, { message: 'Client deleted successfully' });
    });
  }
};

module.exports = ProjectClient;