const LawyerTask = require('../models/LawyerTaskModel');
const LawyerProject = require('../models/LawyerProjectModel'); // To verify project ownership
const { validationResult } = require('express-validator');

// Middleware to check if the lawyer owns the project associated with the task
const checkProjectOwnership = (req, res, next) => {
    const lawyerId = req.user.id;
    // Get projectId from route params (for GET/PUT/DELETE single task) 
    // or from request body (for POST create task)
    const projectId = req.params.projectId || req.body.projectId; 
    const taskId = req.params.taskId; // For checking task's project later

    if (!projectId && !taskId) {
         return res.status(400).json({ message: 'Project ID is required' });
    }

    const verifyOwnership = (pId) => {
        LawyerProject.findByIdAndLawyerId(pId, lawyerId, (err, project) => {
            if (err) {
                console.error("Error checking project ownership:", err);
                return res.status(500).json({ message: "Server error checking project ownership" });
            }
            if (!project) {
                return res.status(403).json({ message: "Not authorized to access tasks for this project" });
            }
            req.project = project; // Attach project to request if needed later
            next(); // Proceed if ownership is confirmed
        });
    };

    if (projectId) {
        verifyOwnership(projectId);
    } else if (taskId) {
        // If only taskId is provided (e.g., PUT/DELETE /api/lawyer-tasks/:taskId), fetch the task first to get projectId
        LawyerTask.findById(taskId, (err, task) => {
             if (err) {
                console.error("Error finding task for ownership check:", err);
                return res.status(500).json({ message: "Server error finding task" });
            }
            if (!task) {
                 return res.status(404).json({ message: "Task not found" });
            }
            req.task = task; // Attach task for later use in PUT/DELETE
            verifyOwnership(task.projectId); // Verify ownership of the task's project
        });
    }
};


// @desc    Create a new task for a lawyer project
// @route   POST /api/lawyer-projects/:projectId/tasks  OR POST /api/lawyer-tasks (if projectId in body)
// @access  Private (Lawyer only, owner)
exports.createLawyerTask = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { text, dueDate } = req.body;
    const projectId = req.params.projectId || req.body.projectId; // Get projectId from route or body
    const lawyerId = req.user.id;

    if (!text) {
        return res.status(400).json({ message: 'Task text is required' });
    }
     if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }


    const taskData = { projectId, lawyerId, text, dueDate };

    LawyerTask.create(taskData, (err, newTask) => {
        if (err) {
            console.error('Error creating lawyer task:', err);
            return res.status(500).json({ message: 'Server error creating task' });
        }
        res.status(201).json(newTask);
    });
};

// @desc    Get all tasks for a specific lawyer project
// @route   GET /api/lawyer-projects/:projectId/tasks
// @access  Private (Lawyer only, owner)
exports.getTasksForProject = (req, res) => {
    const projectId = req.params.projectId;

    LawyerTask.findAllByProjectId(projectId, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks for project:', err);
            return res.status(500).json({ message: 'Server error fetching tasks' });
        }
        res.status(200).json(tasks || []);
    });
};

// @desc    Update a specific task
// @route   PUT /api/lawyer-tasks/:taskId 
// @access  Private (Lawyer only, owner of associated project)
exports.updateLawyerTask = (req, res) => {
    const taskId = req.params.taskId;
    const { text, completed, dueDate } = req.body;

    // Task object should be attached by checkProjectOwnership middleware
    if (!req.task || req.task.id != taskId) { 
         return res.status(404).json({ message: "Task not found or middleware error" });
    }

    const updateData = { text, completed, dueDate };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

     if (Object.keys(updateData).length === 0) {
         return res.status(400).json({ message: "No update data provided" });
     }

    LawyerTask.update(taskId, updateData, (err, updatedTask) => {
        if (err) {
            console.error('Error updating lawyer task:', err);
             if (err.message.includes('not found')) {
                 return res.status(404).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Server error updating task' });
        }
        res.status(200).json(updatedTask);
    });
};

// @desc    Delete a specific task
// @route   DELETE /api/lawyer-tasks/:taskId
// @access  Private (Lawyer only, owner of associated project)
exports.deleteLawyerTask = (req, res) => {
    const taskId = req.params.taskId;

    // Task object should be attached by checkProjectOwnership middleware
     if (!req.task || req.task.id != taskId) { 
         return res.status(404).json({ message: "Task not found or middleware error" });
    }

    LawyerTask.deleteById(taskId, (err, result) => {
        if (err) {
            console.error('Error deleting lawyer task:', err);
             if (err.message.includes('not found')) {
                 return res.status(404).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Server error deleting task' });
        }
        res.status(200).json(result);
    });
};

// Export middleware for use in routes
exports.checkProjectOwnership = checkProjectOwnership;