const express = require('express');
const router = express.Router();
const { createComplaint, trackComplaint } = require('./complaintController');

// Route: POST /api/complaints
router.post('/', createComplaint);

// Route: GET /api/complaints/track
router.get('/track', trackComplaint);

module.exports = router;