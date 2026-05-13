const express = require('express');
const router = express.Router();
const { getAllComplaints, getDashboardStats, updateComplaintStatus } = require('../controllers/dashboardController');
const enforceDepartmentAccess = require('../middleware/enforceDepartmentAccess');
const authorizeRoles = require('../middleware/roleMiddleware');
const verifyToken = require('../middleware/authMiddleware');

// Department Admin routes (filtered by department)
router.get('/complaints/admin', enforceDepartmentAccess, getAllComplaints);
router.get('/stats/admin', enforceDepartmentAccess, getDashboardStats);
router.patch('/complaints/:id/admin', enforceDepartmentAccess, updateComplaintStatus);

// Super Admin routes (no department filter needed, as enforceDepartmentAccess bypasses for super_admin)
router.get('/complaints/all', authorizeRoles(['super_admin']), getAllComplaints);
router.get('/stats/all', authorizeRoles(['super_admin']), getDashboardStats);
router.patch('/complaints/:id/superadmin', authorizeRoles(['super_admin']), updateComplaintStatus);

module.exports = router;