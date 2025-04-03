const express = require('express');
const router = express.Router();
const {
  createLawyerProject,
  getMyLawyerProjects,
  getLawyerProjectById,
  updateLawyerProject,
  deleteLawyerProject
} = require('../controllers/lawyerProjectController');
const { auth, isLawyer } = require('../middleware/auth'); // Import 'auth' instead of 'protect'

// Apply protect and isLawyer middleware to all routes in this file
router.use(auth); // Use the correct middleware function name
router.use(isLawyer);

// Define routes
router.route('/')
  .post(createLawyerProject) // POST /api/lawyer-projects
  .get(getMyLawyerProjects); // GET /api/lawyer-projects

router.route('/:id')
  .get(getLawyerProjectById)    // GET /api/lawyer-projects/:id
  .put(updateLawyerProject)    // PUT /api/lawyer-projects/:id
  .delete(deleteLawyerProject); // DELETE /api/lawyer-projects/:id

module.exports = router;