const express = require('express');
const router = express.Router();
const {
  createComplaint,
  trackComplaint,
  getUserComplaints // New controller function for user's own complaints
} = require('../controllers/complaintController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// User-facing routes
router.post('/', verifyToken, authorizeRoles(['user', 'department_admin', 'super_admin']), createComplaint);
router.get('/my', verifyToken, authorizeRoles(['user']), getUserComplaints);

// Public route for tracking a complaint (no authentication needed)
router.get('/track', trackComplaint);

module.exports = router;