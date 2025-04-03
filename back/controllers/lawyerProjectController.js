const LawyerProject = require('../models/LawyerProjectModel');
const ProjectClient = require('../models/ProjectClientModel'); // Import the new client model
const { validationResult } = require('express-validator'); // If using express-validator

// @desc    Create a new lawyer project
// @route   POST /api/lawyer-projects
// @access  Private (Lawyer only)
exports.createLawyerProject = (req, res) => {
  // Optional: Add validation checks using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract project and potential client details
  const {
      title, description, type, status,
      isClientProject, // Expecting a boolean flag from frontend (true if client, false/undefined if personal)
      // Client details (only relevant if isClientProject is true)
      clientId, // If selecting an existing client
      clientFirstName, clientLastName, clientEmail, clientPhone, clientAddress, clientCompanyName, clientNotes
  } = req.body;
  
  const lawyerId = req.user.id;

  // --- Validation ---
  if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
  }
  // If it's a client project, either an existing clientId or at least first/last name should be provided
  if (isClientProject && !clientId && (!clientFirstName || !clientLastName)) {
       return res.status(400).json({ message: 'Client ID or First/Last Name required for client projects' });
  }
  // --- End Validation ---

  const createProjectWithClient = (projectClientId) => {
      const projectData = {
          lawyerId,
          title,
          description,
          type,
          status: status || 'Ouvert',
          projectClientId // This will be null if projectClientId is null (personal project)
      };
      LawyerProject.create(projectData, (err, newProject) => {
          if (err) {
              console.error('Error creating lawyer project entry:', err);
              return res.status(500).json({ message: 'Server error while creating project' });
          }
          // Optionally fetch the full project details including client info before responding
          LawyerProject.findByIdAndLawyerId(newProject.id, lawyerId, (findErr, fullProject) => {
               if (findErr || !fullProject) {
                    console.error('Error fetching newly created project:', findErr);
                    // Still return the basic project info even if the fetch fails
                    return res.status(201).json(newProject);
               }
               res.status(201).json(fullProject); // Return project with client details joined
          });
      });
  };

  // If it's a personal project or an existing client is selected
  if (!isClientProject || clientId) {
      createProjectWithClient(isClientProject ? clientId : null);
  }
  // If it's a new client project, create the client first
  else {
      const clientData = {
          lawyerId,
          firstName: clientFirstName,
          lastName: clientLastName,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress,
          companyName: clientCompanyName,
          notes: clientNotes
      };
      ProjectClient.create(clientData, (clientErr, newClient) => {
          if (clientErr) {
              console.error('Error creating new project client:', clientErr);
              return res.status(500).json({ message: 'Server error while creating client for project' });
          }
          createProjectWithClient(newClient.id); // Create project linked to the new client
      });
  }
};

// @desc    Get all projects for the logged-in lawyer
// @route   GET /api/lawyer-projects
// @access  Private (Lawyer only)
exports.getMyLawyerProjects = (req, res) => {
  const lawyerId = req.user.id; // Assuming user ID is attached by auth middleware

  LawyerProject.findAllByLawyerId(lawyerId, (err, projects) => {
    if (err) {
      console.error('Error fetching lawyer projects:', err);
      return res.status(500).json({ message: 'Server error while fetching projects' });
    }
    res.status(200).json(projects);
  });
};

// @desc    Get a single lawyer project by ID
// @route   GET /api/lawyer-projects/:id
// @access  Private (Lawyer only, owner)
exports.getLawyerProjectById = (req, res) => {
    const lawyerId = req.user.id;
    const projectId = req.params.id;

    LawyerProject.findByIdAndLawyerId(projectId, lawyerId, (err, project) => {
        if (err) {
            console.error('Error fetching single lawyer project:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!project) {
            return res.status(404).json({ message: 'Project not found or not authorized' });
        }
        res.status(200).json(project);
    });
};


// @desc    Update a lawyer project
// @route   PUT /api/lawyer-projects/:id
// @access  Private (Lawyer only, owner)
exports.updateLawyerProject = (req, res) => {
    const lawyerId = req.user.id;
    const projectId = req.params.id;
    // Extract project fields and potentially the client ID to link/unlink
    const { title, description, type, status, projectClientId } = req.body;

     // Optional: Add validation checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Prepare data for update
    const projectData = {
        title,
        description,
        type,
        status,
        // Allow setting projectClientId to an ID or explicitly to null
        projectClientId: projectClientId === undefined ? undefined : (projectClientId || null)
    };

    // Filter out undefined values so they don't overwrite existing data
    Object.keys(projectData).forEach(key => projectData[key] === undefined && delete projectData[key]);

    // Check if there's anything to update
    if (Object.keys(projectData).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
    }

    LawyerProject.update(projectId, lawyerId, projectData, (err, updatedProject) => {
        if (err) {
            console.error('Error updating lawyer project:', err);
            // Handle specific error for not found/unauthorized from model
            if (err.message.includes('not found or not authorized')) {
                 return res.status(404).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(updatedProject);
    });
};

// @desc    Delete a lawyer project
// @route   DELETE /api/lawyer-projects/:id
// @access  Private (Lawyer only, owner)
exports.deleteLawyerProject = (req, res) => {
    const lawyerId = req.user.id;
    const projectId = req.params.id;

    LawyerProject.deleteByIdAndLawyerId(projectId, lawyerId, (err, result) => {
        if (err) {
            console.error('Error deleting lawyer project:', err);
             // Handle specific error for not found/unauthorized from model
            if (err.message.includes('not found or not authorized')) {
                 return res.status(404).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(result); // Send back the success message from the model
    });
};