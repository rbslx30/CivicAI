const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Secure Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = email || username; // Support both

    const user = await User.findOne({ email: loginId });
    if (!user || (user.role !== 'super_admin' && user.role !== 'department_admin')) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or unauthorized access.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(`[Auth] ✓ Admin login successful: ${user.email} Role: ${user.role}`);
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      // Ensure department is only added if the user is a department_admin
      { id: user._id, role: user.role, 
        ...(user.role === 'department_admin' && user.department && { department: user.department }) 
      },
      { expiresIn: '1d' }
    );
    return res.status(200).json({ success: true, token, role: user.role, department: user.department });
  } catch (error) {
    console.error(`[Auth Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

module.exports = { adminLogin };