const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
// Assuming you might have authMiddleware for protected routes later
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
// router.get('/me', protect, getMe); // Example of a protected route

module.exports = router;