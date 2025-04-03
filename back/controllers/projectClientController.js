const ProjectClient = require('../models/ProjectClientModel');

// @desc    Get all project clients for the logged-in lawyer
// @route   GET /api/project-clients
// @access  Private (Lawyer only)
exports.getMyProjectClients = (req, res) => {
  const lawyerId = req.user.id; // Assuming user ID is attached by auth middleware

  ProjectClient.findAllByLawyerId(lawyerId, (err, clients) => {
    if (err) {
      console.error('Error fetching project clients:', err);
      return res.status(500).json({ message: 'Server error while fetching clients' });
    }
    res.status(200).json(clients || []); // Return empty array if null
  });
};

// TODO: Add controllers for creating (standalone), updating, deleting clients if needed outside project creation flow