const express = require('express');
// Use mergeParams: true to allow access to :projectId from the parent router
const router = express.Router({ mergeParams: true }); 
const {
  createLawyerTask,
  getTasksForProject,
  updateLawyerTask,
  deleteLawyerTask,
  checkProjectOwnership // Import the ownership middleware
} = require('../controllers/lawyerTaskController');
const { auth, isLawyer } = require('../middleware/auth');

// --- Routes Nested Under Projects ---
// These routes will be mounted like: app.use('/api/lawyer-projects/:projectId/tasks', lawyerTaskRoutes);
// They automatically have access to :projectId and ownership is checked first.

router.route('/')
  .post(auth, isLawyer, checkProjectOwnership, createLawyerTask) // POST /api/lawyer-projects/:projectId/tasks
  .get(auth, isLawyer, checkProjectOwnership, getTasksForProject); // GET /api/lawyer-projects/:projectId/tasks

// --- Standalone Routes for Specific Tasks ---
// These routes need to check ownership based on the taskId
// We create a separate router for these to be mounted at /api/lawyer-tasks

const taskRouter = express.Router();

taskRouter.route('/:taskId')
  .put(auth, isLawyer, checkProjectOwnership, updateLawyerTask)    // PUT /api/lawyer-tasks/:taskId
  .delete(auth, isLawyer, checkProjectOwnership, deleteLawyerTask); // DELETE /api/lawyer-tasks/:taskId

// Export both routers
module.exports = { 
    projectTaskRoutes: router, // For mounting under /api/lawyer-projects/:projectId/tasks
    standaloneTaskRoutes: taskRouter // For mounting under /api/lawyer-tasks
};