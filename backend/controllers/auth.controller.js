const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const Vendor = require('../models/Vendor.model');
const jwt = require('jsonwebtoken');
const { ApiResponse } = require('../utils/response.utils');

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

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    // For now, just return success. Client handles token removal.
    ApiResponse(res, 200, 'Logged out successfully', {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, registerVendor, loginVendor, loginAdmin, logout };

