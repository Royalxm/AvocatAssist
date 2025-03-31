/**
 * Database initialization script
 * Run this script to create the database schema and seed initial data
 */
const { db, initializeDatabase } = require('../config/database');

console.log('Initializing database...');
initializeDatabase();
console.log('Database initialization complete!');

// Close the database connection after initialization
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
}, 1000); // Give some time for the initialization to complete
