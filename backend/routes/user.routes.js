// user.routes.js
const express = require('express');
const r = express.Router();
const { getProfile, updateProfile, addAddress, removeAddress } = require('../controllers/misc.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

r.get('/profile', authenticate, getProfile);
r.put('/profile', authenticate, updateProfile);
r.post('/addresses', authenticate, addAddress);
r.delete('/addresses/:id', authenticate, removeAddress);
r.get('/orders', authenticate, require('../controllers/order.controller').getUserOrders);

module.exports = r;
