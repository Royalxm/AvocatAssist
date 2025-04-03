const db = require('../config/database').db; // Get the db connection instance

const LawyerTask = {
  // Create a new task for a specific project and lawyer
  create: ({ projectId, lawyerId, text, dueDate = null }, callback) => {
    const sql = `INSERT INTO lawyer_tasks (projectId, lawyerId, text, dueDate, completed, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))`;
    const params = [projectId, lawyerId, text, dueDate];
    
    db.run(sql, params, function (err) {
      if (err) {
        return callback(err);
      }
      // Return the ID of the newly inserted task
      callback(null, { id: this.lastID, projectId, lawyerId, text, dueDate, completed: 0 });
    });
  },

  // Find all tasks for a specific project (ensure lawyer owns project indirectly via controller)
  findAllByProjectId: (projectId, callback) => {
    const sql = `SELECT * FROM lawyer_tasks WHERE projectId = ? ORDER BY createdAt DESC`;
    db.all(sql, [projectId], callback);
  },

  // Find a single task by ID
  findById: (id, callback) => {
    const sql = `SELECT * FROM lawyer_tasks WHERE id = ?`;
    db.get(sql, [id], callback);
  },

  // Update a task (e.g., text, completed status, due date)
  update: (id, { text, completed, dueDate }, callback) => {
    const fieldsToUpdate = [];
    const values = [];

    if (text !== undefined) { fieldsToUpdate.push('text = ?'); values.push(text); }
    if (completed !== undefined) { fieldsToUpdate.push('completed = ?'); values.push(completed ? 1 : 0); }
    if (dueDate !== undefined) { fieldsToUpdate.push('dueDate = ?'); values.push(dueDate); } // Allow setting dueDate to null

    if (fieldsToUpdate.length === 0) {
      return LawyerTask.findById(id, callback); // Nothing to update
    }

    fieldsToUpdate.push("updatedAt = datetime('now')"); 

    const sql = `UPDATE lawyer_tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    values.push(id);

    db.run(sql, values, function (err) {
      if (err) { return callback(err); }
      if (this.changes === 0) { return callback(new Error('Task not found for update')); }
      LawyerTask.findById(id, callback); // Return updated record
    });
  },

  // Delete a task by ID
  deleteById: (id, callback) => {
    const sql = `DELETE FROM lawyer_tasks WHERE id = ?`;
    db.run(sql, [id], function (err) {
       if (err) { return callback(err); }
       if (this.changes === 0) { return callback(new Error('Task not found for deletion')); }
       callback(null, { message: 'Task deleted successfully' });
    });
  }
};

module.exports = LawyerTask;