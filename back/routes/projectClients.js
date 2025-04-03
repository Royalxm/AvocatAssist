const express = require('express');
const router = express.Router();
const { getMyProjectClients } = require('../controllers/projectClientController');
const { auth, isLawyer } = require('../middleware/auth'); // Use correct middleware import

// Apply protect and isLawyer middleware to all routes in this file
router.use(auth);
router.use(isLawyer);

// Define routes
router.route('/')
  .get(getMyProjectClients); // GET /api/project-clients

// TODO: Add POST, PUT, DELETE routes if needed for standalone client management

module.exports = router;