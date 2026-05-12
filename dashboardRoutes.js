const express = require('express');
const router = express.Router();
const { getAllComplaints, getDashboardStats, updateComplaintStatus } = require('./dashboardController');

// Route: GET /api/dashboard/complaints (Middleware handled in server.js)
router.get('/complaints', getAllComplaints);

// Route: GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// Route: PUT /api/dashboard/complaints/:id/status
router.put('/complaints/:id/status', updateComplaintStatus);

module.exports = router;