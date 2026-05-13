const express = require('express');
const router = express.Router();
const {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController'); // Assuming you have a complaintController

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public route for submitting a complaint (requires logged-in user)
router.post('/', verifyToken, authorizeRoles(['user', 'admin']), submitComplaint);
// Admin routes for managing complaints
router.get('/', verifyToken, authorizeRoles(['admin']), getComplaints);
router.get('/:id', verifyToken, authorizeRoles(['admin']), getComplaintById);
router.patch('/:id', verifyToken, authorizeRoles(['admin']), updateComplaintStatus);
router.delete('/:id', verifyToken, authorizeRoles(['admin']), deleteComplaint); // Assuming a delete route

module.exports = router;