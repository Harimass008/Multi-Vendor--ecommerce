const express = require('express');
const r = express.Router();
const {
  adminDashboard, adminGetUsers, adminGetVendors, adminApproveVendor,
  adminBanUser, adminBanVendor, adminDeleteVendor, adminGetAllOrders,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminGetCategories, adminCreateCoupon
} = require('../controllers/misc.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const guard = [authenticate, authorize('admin')];

r.get('/dashboard', ...guard, adminDashboard);
r.get('/users', ...guard, adminGetUsers);
r.put('/users/:id/ban', ...guard, adminBanUser);
r.get('/vendors', ...guard, adminGetVendors);
r.put('/vendors/:id/approve', ...guard, adminApproveVendor);
r.put('/vendors/:id/ban', ...guard, adminBanVendor);
r.delete('/vendors/:id', ...guard, adminDeleteVendor);
r.get('/orders', ...guard, adminGetAllOrders);
r.get('/categories', ...guard, adminGetCategories);
r.post('/categories', ...guard, adminCreateCategory);
r.put('/categories/:id', ...guard, adminUpdateCategory);
r.delete('/categories/:id', ...guard, adminDeleteCategory);
r.post('/coupons', ...guard, adminCreateCoupon);

module.exports = r;
