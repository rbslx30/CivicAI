const jwt = require('jsonwebtoken');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = (req, res) => {
  const { username, password } = req.body;

  // Verify against secure Environment Variables
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  if (username === adminUser && password === adminPass) {
    console.log(`[Auth] ✓ Admin login successful for user: ${username}`);
    const token = jwt.sign(
      { role: 'admin', username }, 
      process.env.JWT_SECRET || 'hackathon_secret', 
      { expiresIn: '1d' }
    );
    return res.status(200).json({ success: true, token });
  }

  console.warn(`[Auth] ⚠ Failed admin login attempt for user: ${username}`);
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};

module.exports = { adminLogin };