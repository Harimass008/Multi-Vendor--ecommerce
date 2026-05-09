// coupon.routes.js
const express = require('express');
const cr = express.Router();
const { validateCoupon, getActiveCoupons } = require('../controllers/misc.controller');
const { authenticate } = require('../middleware/auth.middleware');

cr.get('/active', getActiveCoupons);
cr.post('/validate', authenticate, validateCoupon);

module.exports = cr;
