const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const Vendor = require('../models/Vendor.model');
const jwt = require('jsonwebtoken');
const { ApiResponse } = require('../utils/response.utils');
const { sendEmail, emailTemplates } = require('../utils/email.utils');

// Simple function to generate token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1d' });
};

// ─── User Register ────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'user' });
    const token = generateToken(user._id, user.role);

    ApiResponse(res, 201, 'User registered successfully', { user, accessToken: token, refreshToken: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── User Login ───────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    ApiResponse(res, 200, 'Login successful', { user, accessToken: token, refreshToken: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor Register ──────────────────────────────────────────────────────────
const registerVendor = async (req, res) => {
  try {
    const { name, email, password, storeName, storeDescription, phone } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: 'Name, email, password, and store name are required' });
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) return res.status(400).json({ message: 'Email already registered' });

    const vendor = await Vendor.create({ name, email, password, storeName, storeDescription, phone });
    const token = generateToken(vendor._id, 'vendor');

    ApiResponse(res, 201, 'Vendor registered successfully', { user: vendor, vendor, accessToken: token, refreshToken: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor Login ─────────────────────────────────────────────────────────────
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const vendor = await Vendor.findOne({ email }).select('+password');
    if (!vendor || !(await vendor.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(vendor._id, 'vendor');
    ApiResponse(res, 200, 'Login successful', { user: vendor, vendor, accessToken: token, refreshToken: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin Login ──────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id, 'admin');
    ApiResponse(res, 200, 'Login successful', { user: admin, accessToken: token, refreshToken: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModelByRole = (role = 'user') => {
  if (role === 'admin') return Admin;
  if (role === 'vendor') return Vendor;
  return User;
};

const generateResetToken = (email, role = 'user') => {
  return jwt.sign(
    { email, role },
    process.env.JWT_RESET_SECRET || 'reset_secret',
    { expiresIn: '1h' }
  );
};

const forgotPassword = async (req, res) => {
  try {
    const { email, role = 'user' } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const Model = getModelByRole(role);
    const account = await Model.findOne({ email });

    if (account) {
      const token = generateResetToken(email, role);
      const emailData = emailTemplates.passwordReset(account.name, token, role);
      await sendEmail({ to: email, ...emailData });
    }

    ApiResponse(res, 200, 'If the email exists, a password reset link has been sent.', {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'reset_secret');
    const { email, role } = decoded;
    const Model = getModelByRole(role);
    const account = await Model.findOne({ email });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.password = password;
    await account.save();

    ApiResponse(res, 200, 'Password reset successful', { role });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    // For now, just return success. Client handles token removal.
    ApiResponse(res, 200, 'Logged out successfully', {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerVendor,
  loginVendor,
  loginAdmin,
  forgotPassword,
  resetPassword,
  logout,
};

