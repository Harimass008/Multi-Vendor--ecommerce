const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const Vendor = require('../models/Vendor.model');

const findAuthById = async (id) => {
  return await User.findById(id).select('-password')
    || await Vendor.findById(id).select('-password')
    || await Admin.findById(id).select('-password');
};

// ─── Authenticate JWT ─────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');

    const user = await findAuthById(decoded.id || decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ─── Role Authorization ───────────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

// ─── Vendor Check ────────────────────────────────────────────────────────────
const isApprovedVendor = async (req, res, next) => {
  try {
    req.vendor = req.user;
    if (req.vendor.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Vendor account is not approved yet' });
    }
    if (req.vendor.isBanned) {
      return res.status(403).json({ message: 'Vendor account is banned' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { authenticate, authorize, isApprovedVendor };
