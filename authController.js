const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Added for isValidObjectId check if needed for email/mobile
const nodemailer = require('nodemailer');

// In-memory store for OTPs. 
// NOTE: For production scalability, store this in MongoDB (create an OTP model) or Redis.
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Add to .env
    pass: process.env.EMAIL_PASS  // Add to .env (Use App Passwords for Gmail)
  }
});

exports.register = async (req, res) => {
  console.log("Signup route hit");
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  console.log("Send OTP route hit");
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expiresAt });

    // Send Email
    await transporter.sendMail({
      from: `"CivicAI Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your CivicAI Login OTP',
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes. Do not share this with anyone.</p>`
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email. Please check server configuration.' });
  }
};

exports.verifyOtp = async (req, res) => {
  console.log("Verify OTP route hit");
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData) return res.status(400).json({ success: false, message: 'OTP not requested or has expired' });
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (storedData.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });

    // OTP is valid. Remove it from store to prevent reuse.
    otpStore.delete(email);

    // Here you can either return a verification success for a multi-step signup, 
    // or if this is for Passwordless Login, find the user and return a JWT.
    
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  console.log("Login route hit");
  try {
    const { email, password } = req.body;
    
    // Determine if the input is an email or a mobile number (simple check)
    // For a robust solution, you'd validate against regex for email and phone number formats
    const isEmail = email.includes('@');
    const query = isEmail ? { email } : { mobile: email }; // Assuming 'mobile' field exists in User model if not email
    
    // For now, sticking to 'email' as per existing User model and frontend payload
    const user = await User.findOne({ email }).select('+password'); // Select password explicitly for comparison
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const payload = { id: user._id, role: user.role };
    if (user.role === 'department_admin' && user.department) {
      payload.department = user.department;
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, message: 'Login successful', token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};