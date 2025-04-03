const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const { initializeDatabase } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error');

// Load environment variables
require('dotenv').config();

// Initialize database
initializeDatabase();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5050;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/legal-requests', require('./routes/legalRequests'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/api-settings', require('./routes/apiSettings'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/conversations', require('./routes/conversations')); // Add conversation routes
app.use('/api/legal-request-documents', require('./routes/legalRequestDocuments')); // Add legal request documents routes
app.use('/api/legal-requests', require('./routes/legalRequestComments')); // Add legal request comments routes
app.use('/api/forum', require('./routes/forum')); // Add forum routes
app.use('/api/direct-messages', require('./routes/directMessages')); // Add direct message routes
app.use('/api/calendar', require('./routes/calendar')); // Add calendar routes
app.use('/api/contacts', require('./routes/contacts')); // Add contact book routes
app.use('/api/legal-news', require('./routes/legalNews')); // Add legal news routes
app.use('/api/lawyer-templates', require('./routes/lawyerTemplates')); // Add lawyer template routes
app.use('/api/lawyer-projects', require('./routes/lawyerProjects')); // Add lawyer-specific project routes
app.use('/api/project-clients', require('./routes/projectClients')); // Add project client routes
// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, we might want to exit the process and let a process manager restart it
  // process.exit(1);
});

module.exports = app;
