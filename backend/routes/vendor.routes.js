const express = require('express');
const r = express.Router();
const { getVendorProfile, updateVendorProfile, getVendorDashboard } = require('../controllers/misc.controller');
const { getVendorOrders, updateVendorOrderStatus } = require('../controllers/order.controller');
const { authenticate, authorize, isApprovedVendor } = require('../middleware/auth.middleware');

const guard = [authenticate, authorize('vendor'), isApprovedVendor];

r.get('/profile', authenticate, authorize('vendor'), isApprovedVendor, getVendorProfile);
r.put('/profile', ...guard, updateVendorProfile);
r.get('/dashboard', ...guard, getVendorDashboard);
r.get('/orders', ...guard, getVendorOrders);
r.put('/orders/:orderId/status', ...guard, updateVendorOrderStatus);

module.exports = r;
