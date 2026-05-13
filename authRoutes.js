const express = require('express');
const { register, login, getMe, sendOtp, verifyOtp } = require('../controllers/authController');
// Assuming you might have authMiddleware for protected routes later
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// router.get('/me', protect, getMe); // Example of a protected route

module.exports = router;